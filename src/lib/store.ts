import { create } from 'zustand'
import { db } from './db'
import { newId, todayISO } from './ids'
import { DEFAULT_RELATION_TYPES, EMOJI_TO_ICON, slugify } from './relations'
import { extractWikiLinks, normalizeTitle } from './wiki'
import type { Backup, EntityKind, EntityRef, ID, ImageRec, Link, MapNode, MapPackage, MindMap, NodeSize, Note, RelationType, View } from './types'
import { shrinkImage } from './images'
import { DEFAULT_MAX_TEXT_WIDTH, MAX_NODE_WIDTH, MIN_NODE_WIDTH } from './layout'

interface Snapshot {
  mapId: ID
  nodes: MapNode[]
  links: Link[]
}

export interface AppState {
  loaded: boolean
  maps: Record<ID, MindMap>
  nodes: Record<ID, MapNode>
  notes: Record<ID, Note>
  links: Record<ID, Link>
  relationTypes: RelationType[]
  images: Record<ID, ImageRec>

  view: View
  selectedNodeId: ID | null
  editingNodeId: ID | null
  /** text that replaces the node text when editing starts by typing */
  editingSeed: string | null
  /** incremented every time we want the canvas to centre on selectedNodeId */
  focusTick: number
  showRelations: boolean
  paletteOpen: boolean
  theme: 'dark' | 'light'
  inspectorOpen: boolean
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  /** default text size for nodes without their own */
  defaultNodeSize: NodeSize
  /** wrap width for node text without a fixed width */
  nodeMaxWidth: number
  setDefaultNodeSize: (s: NodeSize) => void
  setNodeMaxWidth: (w: number) => void
  /** live width change while dragging the resize handle (no undo entry) */
  setNodeWidth: (id: ID, width: number | null) => void

  undoStack: Snapshot[]
  redoStack: Snapshot[]
  /** in-app replacement for window.confirm / alert (native dialogs are blocked in sandboxed hosts) */
  dialog: { message: string; confirm: boolean; resolve: (ok: boolean) => void } | null
  /** image id shown full-size in an overlay */
  lightbox: ID | null
  setLightbox: (id: ID | null) => void
  ask: (message: string) => Promise<boolean>
  notify: (message: string) => Promise<void>

  // lifecycle
  load: () => Promise<void>

  // navigation
  setView: (v: View) => void
  goToMap: (mapId: ID, nodeId?: ID | null) => void
  openNote: (noteId: ID) => void
  openJournal: (date: string) => void
  goToEntity: (ref: EntityRef) => void
  selectNode: (id: ID | null) => void
  setEditing: (id: ID | null, seed?: string | null) => void
  setShowRelations: (v: boolean) => void
  setPaletteOpen: (v: boolean) => void
  setTheme: (t: 'dark' | 'light') => void
  setInspectorOpen: (v: boolean) => void

  // maps
  createMap: (title: string) => ID
  renameMap: (id: ID, title: string) => void
  deleteMap: (id: ID) => void

  // nodes
  addChild: (parentId: ID, text?: string) => ID
  addSibling: (nodeId: ID, text?: string) => ID
  updateNode: (id: ID, patch: Partial<Pick<MapNode, 'text' | 'color' | 'icon' | 'collapsed' | 'width' | 'size'>>) => void
  deleteNode: (id: ID) => void
  moveNode: (id: ID, newParentId: ID, index?: number) => void
  /** create a free node (no parent) centred at the given canvas position */
  addFloatingNode: (mapId: ID, cx: number, cy: number, text?: string) => ID
  /** move a free node; cx/cy are canvas centre coordinates */
  setNodePosition: (id: ID, cx: number, cy: number) => void
  /** cut a node (with its subtree) out of the tree and leave it free at the given position */
  detachNode: (id: ID, cx: number, cy: number) => void
  setNodeImage: (id: ID, file: File) => Promise<void>
  removeNodeImage: (id: ID) => void
  reorderNode: (id: ID, delta: number) => void
  toggleCollapse: (id: ID) => void
  expandAncestors: (id: ID) => void
  undo: () => void
  redo: () => void

  // notes / journal
  createNote: (partial?: Partial<Note>) => ID
  updateNote: (id: ID, patch: Partial<Pick<Note, 'title' | 'body' | 'tags'>>) => void
  deleteNote: (id: ID) => void
  getOrCreateJournal: (date: string) => ID

  // links
  addLink: (from: EntityRef, to: EntityRef, type: string, label?: string) => ID | null
  removeLink: (id: ID) => void
  addRelationType: (forward: string, inverse: string | undefined, color: string, directed: boolean) => string

  // single-map packages
  exportMapPackage: (mapId: ID) => MapPackage
  /** adds the package as a new map (plus its notes and links); returns the new map id */
  importMapPackage: (pkg: MapPackage) => ID | null
  /** adds a map from a markdown outline (- items indented by two spaces) */
  importOutline: (title: string, items: { text: string; children: unknown[] }[]) => ID

  // backup
  exportAll: () => Backup
  importAll: (b: Backup) => Promise<void>
  resetAll: () => Promise<void>
}

function now() {
  return Date.now()
}

function dict<T extends { id: string }>(arr: T[]): Record<string, T> {
  const o: Record<string, T> = {}
  for (const x of arr) o[x.id] = x
  return o
}

function dictBy<T>(arr: T[], key: (t: T) => string): Record<string, T> {
  const o: Record<string, T> = {}
  for (const x of arr) o[key(x)] = x
  return o
}

/** Collect a node and all its descendants (ids). */
export function subtreeIds(nodes: Record<ID, MapNode>, rootId: ID): ID[] {
  const byParent = new Map<ID | null, MapNode[]>()
  for (const n of Object.values(nodes)) {
    const arr = byParent.get(n.parentId) ?? []
    arr.push(n)
    byParent.set(n.parentId, arr)
  }
  const out: ID[] = []
  const stack = [rootId]
  while (stack.length) {
    const id = stack.pop()!
    out.push(id)
    for (const c of byParent.get(id) ?? []) stack.push(c.id)
  }
  return out
}

export function childrenOf(nodes: Record<ID, MapNode>, parentId: ID): MapNode[] {
  return Object.values(nodes)
    .filter((n) => n.parentId === parentId)
    .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)
}

function parseHash(): View | null {
  const h = location.hash.replace(/^#\/?/, '')
  const parts = h.split('/').filter(Boolean)
  if (parts[0] === 'map' && parts[1]) return { kind: 'map', mapId: parts[1] }
  if (parts[0] === 'note') return { kind: 'notes', noteId: parts[1] ?? null }
  if (parts[0] === 'journal') return { kind: 'journal', date: parts[1] ?? todayISO() }
  return null
}

function hashFor(v: View, nodeId: ID | null): string {
  if (v.kind === 'map') return `#/map/${v.mapId}${nodeId ? `/node/${nodeId}` : ''}`
  if (v.kind === 'notes') return `#/note${v.noteId ? `/${v.noteId}` : ''}`
  return `#/journal/${v.date}`
}

let loadPromise: Promise<void> | null = null

export const useStore = create<AppState>()((set, get) => {
  const persistNodes = (changed: MapNode[], removed: ID[] = []) => {
    void db.transaction('rw', db.nodes, async () => {
      if (changed.length) await db.nodes.bulkPut(changed)
      if (removed.length) await db.nodes.bulkDelete(removed)
    })
  }
  const persistLinks = (changed: Link[], removed: ID[] = []) => {
    void db.transaction('rw', db.links, async () => {
      if (changed.length) await db.links.bulkPut(changed)
      if (removed.length) await db.links.bulkDelete(removed)
    })
  }
  /** remove image records that belonged to nodes being deleted (call before the nodes leave the store) */
  const dropImagesOf = (nodeIds: ID[]) => {
    const imgs = nodeIds.map((id) => get().nodes[id]?.image).filter((x): x is string => !!x)
    if (!imgs.length) return
    set((s) => {
      const images = { ...s.images }
      for (const i of imgs) delete images[i]
      return { images }
    })
    void db.images.bulkDelete(imgs as ID[])
  }
  const touchMap = (mapId: ID) => {
    const m = get().maps[mapId]
    if (!m) return
    const upd = { ...m, updatedAt: now() }
    set((s) => ({ maps: { ...s.maps, [mapId]: upd } }))
    void db.maps.put(upd)
  }

  const snapshot = (mapId: ID): Snapshot => {
    const { nodes, links } = get()
    const mapNodes = Object.values(nodes).filter((n) => n.mapId === mapId)
    const ids = new Set(mapNodes.map((n) => n.id))
    const mapLinks = Object.values(links).filter((l) => (l.fromKind === 'node' && ids.has(l.fromId)) || (l.toKind === 'node' && ids.has(l.toId)))
    return { mapId, nodes: mapNodes.map((n) => ({ ...n })), links: mapLinks.map((l) => ({ ...l })) }
  }
  const pushUndo = (mapId: ID) => {
    set((s) => ({ undoStack: [...s.undoStack.slice(-60), snapshot(mapId)], redoStack: [] }))
  }
  const restore = (snap: Snapshot) => {
    const { nodes, links } = get()
    const currentIds = Object.values(nodes)
      .filter((n) => n.mapId === snap.mapId)
      .map((n) => n.id)
    const currentIdSet = new Set(currentIds)
    const snapIds = new Set(snap.nodes.map((n) => n.id))
    const removedNodes = currentIds.filter((id) => !snapIds.has(id))
    const currentLinks = Object.values(links).filter(
      (l) => (l.fromKind === 'node' && currentIdSet.has(l.fromId)) || (l.toKind === 'node' && currentIdSet.has(l.toId)),
    )
    const snapLinkIds = new Set(snap.links.map((l) => l.id))
    const removedLinks = currentLinks.filter((l) => !snapLinkIds.has(l.id)).map((l) => l.id)
    const newNodes = { ...nodes }
    for (const id of removedNodes) delete newNodes[id]
    for (const n of snap.nodes) newNodes[n.id] = n
    const newLinks = { ...links }
    for (const id of removedLinks) delete newLinks[id]
    for (const l of snap.links) newLinks[l.id] = l
    const sel = get().selectedNodeId
    set({ nodes: newNodes, links: newLinks, selectedNodeId: sel && snapIds.has(sel) ? sel : null, editingNodeId: null })
    persistNodes(snap.nodes, removedNodes)
    persistLinks(snap.links, removedLinks)
  }

  /** Resolve a [[title]] to an entity: nodes by text, notes by title. */
  const resolveTitle = (title: string, excludeNoteId: ID): EntityRef | null => {
    const key = normalizeTitle(title)
    const { nodes, notes } = get()
    for (const n of Object.values(notes)) {
      if (n.id !== excludeNoteId && normalizeTitle(n.title) === key) return { kind: 'note', id: n.id }
    }
    for (const n of Object.values(nodes)) {
      if (normalizeTitle(n.text) === key) return { kind: 'node', id: n.id }
    }
    return null
  }

  const syncAutoLinks = (noteId: ID) => {
    const note = get().notes[noteId]
    if (!note) return
    const targets = extractWikiLinks(note.body)
      .map((t) => resolveTitle(t, noteId))
      .filter((r): r is EntityRef => !!r)
    const existing = Object.values(get().links).filter((l) => l.auto && l.fromKind === 'note' && l.fromId === noteId)
    const wanted = new Set(targets.map((t) => `${t.kind}:${t.id}`))
    const removed = existing.filter((l) => !wanted.has(`${l.toKind}:${l.toId}`)).map((l) => l.id)
    const have = new Set(existing.map((l) => `${l.toKind}:${l.toId}`))
    const added: Link[] = targets
      .filter((t) => !have.has(`${t.kind}:${t.id}`))
      .map((t) => ({
        id: newId(),
        fromKind: 'note',
        fromId: noteId,
        toKind: t.kind,
        toId: t.id,
        type: 'mentions',
        auto: true,
        createdAt: now(),
      }))
    if (!removed.length && !added.length) return
    set((s) => {
      const links = { ...s.links }
      for (const id of removed) delete links[id]
      for (const l of added) links[l.id] = l
      return { links }
    })
    persistLinks(added, removed)
  }

  /** Re-resolve auto links from every note that mentions the given title (used after rename). */
  const resyncMentions = () => {
    for (const n of Object.values(get().notes)) if (n.body.includes('[[')) syncAutoLinks(n.id)
  }

  const removeLinksTouching = (ids: Set<ID>, kind: EntityKind): ID[] => {
    const { links } = get()
    const removed = Object.values(links)
      .filter((l) => (l.fromKind === kind && ids.has(l.fromId)) || (l.toKind === kind && ids.has(l.toId)))
      .map((l) => l.id)
    if (removed.length) {
      set((s) => {
        const links = { ...s.links }
        for (const id of removed) delete links[id]
        return { links }
      })
      persistLinks([], removed)
    }
    return removed
  }

  const doLoad = async () => {
    const [maps, nodes, notes, links, settings, images] = await Promise.all([
      db.maps.toArray(),
      db.nodes.toArray(),
      db.notes.toArray(),
      db.links.toArray(),
      db.settings.toArray(),
      db.images.toArray(),
    ])
    const sett = dictBy(settings, (s) => s.key)
    const customTypes = (sett['relationTypes']?.value as RelationType[] | undefined) ?? []
    const theme = (sett['theme']?.value as 'dark' | 'light' | undefined) ?? 'dark'
    const showRelations = (sett['showRelations']?.value as boolean | undefined) ?? true
    const defaultNodeSize = (sett['defaultNodeSize']?.value as NodeSize | undefined) ?? 'md'
    const nodeMaxWidth = (sett['nodeMaxWidth']?.value as number | undefined) ?? DEFAULT_MAX_TEXT_WIDTH
    const sidebarOpen = (sett['sidebarOpen']?.value as boolean | undefined) ?? true
    const ids = new Set(DEFAULT_RELATION_TYPES.map((t) => t.id))
    const relationTypes = [...DEFAULT_RELATION_TYPES, ...customTypes.filter((t) => !ids.has(t.id))]
    // earlier versions stored emoji as node icons
    const migrated = nodes.filter((n) => n.icon && EMOJI_TO_ICON[n.icon]).map((n) => ({ ...n, icon: EMOJI_TO_ICON[n.icon!] }))
    for (const m of migrated) nodes[nodes.findIndex((n) => n.id === m.id)] = m
    if (migrated.length) void db.nodes.bulkPut(migrated)
    set({
      maps: dict(maps),
      nodes: dict(nodes),
      notes: dict(notes),
      links: dict(links),
      images: dict(images),
      relationTypes,
      theme,
      showRelations,
      defaultNodeSize,
      nodeMaxWidth,
      sidebarOpen,
    })
    if (maps.length === 0) {
      const { seedDemo } = await import('./seed')
      await seedDemo()
    }
    const fromHash = parseHash()
    let view: View
    if (fromHash && (fromHash.kind !== 'map' || get().maps[fromHash.mapId])) view = fromHash
    else {
      const first = Object.values(get().maps).sort((a, b) => b.updatedAt - a.updatedAt)[0]
      view = first ? { kind: 'map', mapId: first.id } : { kind: 'notes', noteId: null }
    }
    const nodeFromHash = location.hash.match(/\/node\/([a-z0-9]+)/)?.[1] ?? null
    set({ loaded: true, view, selectedNodeId: nodeFromHash && get().nodes[nodeFromHash] ? nodeFromHash : null })
    if (nodeFromHash) set((s) => ({ focusTick: s.focusTick + 1 }))
    history.replaceState(null, '', hashFor(view, get().selectedNodeId))
  }

  return {
    loaded: false,
    maps: {},
    nodes: {},
    notes: {},
    links: {},
    relationTypes: DEFAULT_RELATION_TYPES,
    images: {},
    view: { kind: 'map', mapId: '' },
    selectedNodeId: null,
    editingNodeId: null,
    editingSeed: null,
    focusTick: 0,
    showRelations: true,
    paletteOpen: false,
    theme: 'dark',
    inspectorOpen: true,
    sidebarOpen: true,
    setSidebarOpen: (v) => {
      set({ sidebarOpen: v })
      void db.settings.put({ key: 'sidebarOpen', value: v })
    },
    defaultNodeSize: 'md',
    nodeMaxWidth: DEFAULT_MAX_TEXT_WIDTH,
    setDefaultNodeSize: (size) => {
      set({ defaultNodeSize: size })
      void db.settings.put({ key: 'defaultNodeSize', value: size })
    },
    setNodeMaxWidth: (w) => {
      set({ nodeMaxWidth: w })
      void db.settings.put({ key: 'nodeMaxWidth', value: w })
    },
    setNodeWidth: (id, width) => {
      const n = get().nodes[id]
      if (!n) return
      const w = width === null ? null : Math.round(Math.max(MIN_NODE_WIDTH, Math.min(MAX_NODE_WIDTH, width)))
      if (w === (n.width ?? null)) return
      const upd = { ...n, width: w, updatedAt: now() }
      set((s) => ({ nodes: { ...s.nodes, [id]: upd } }))
      persistNodes([upd])
    },
    undoStack: [],
    redoStack: [],
    dialog: null,
    lightbox: null,
    setLightbox: (id) => set({ lightbox: id }),
    ask: (message) =>
      new Promise<boolean>((resolve) => {
        set({
          dialog: {
            message,
            confirm: true,
            resolve: (ok) => {
              set({ dialog: null })
              resolve(ok)
            },
          },
        })
      }),
    notify: (message) =>
      new Promise<void>((resolve) => {
        set({
          dialog: {
            message,
            confirm: false,
            resolve: () => {
              set({ dialog: null })
              resolve()
            },
          },
        })
      }),

    load: () => {
      if (!loadPromise) loadPromise = doLoad().finally(() => (loadPromise = null))
      return loadPromise
    },

    setView: (view) => {
      set({ view, editingNodeId: null })
      if (view.kind !== 'map') set({ selectedNodeId: null })
      history.replaceState(null, '', hashFor(view, view.kind === 'map' ? get().selectedNodeId : null))
    },
    goToMap: (mapId, nodeId = null) => {
      if (!get().maps[mapId]) return
      if (nodeId) get().expandAncestors(nodeId)
      set((s) => ({
        view: { kind: 'map', mapId },
        selectedNodeId: nodeId,
        editingNodeId: null,
        focusTick: nodeId ? s.focusTick + 1 : s.focusTick,
        inspectorOpen: nodeId ? true : s.inspectorOpen,
      }))
      history.replaceState(null, '', hashFor({ kind: 'map', mapId }, nodeId))
    },
    openNote: (noteId) => get().setView({ kind: 'notes', noteId }),
    openJournal: (date) => get().setView({ kind: 'journal', date }),
    goToEntity: (ref) => {
      if (ref.kind === 'node') {
        const n = get().nodes[ref.id]
        if (n) get().goToMap(n.mapId, n.id)
      } else {
        const note = get().notes[ref.id]
        if (!note) return
        if (note.kind === 'journal' && note.date) get().openJournal(note.date)
        else get().openNote(note.id)
      }
    },
    selectNode: (id) => {
      set({ selectedNodeId: id })
      const v = get().view
      if (v.kind === 'map') history.replaceState(null, '', hashFor(v, id))
    },
    setEditing: (id, seed = null) =>
      set((s) => ({
        editingNodeId: id,
        // keys typed before the editor mounted accumulate in the seed
        editingSeed: id ? (s.editingNodeId === id && seed !== null ? (s.editingSeed ?? '') + seed : seed) : null,
      })),
    setShowRelations: (v) => {
      set({ showRelations: v })
      void db.settings.put({ key: 'showRelations', value: v })
    },
    setPaletteOpen: (v) => set({ paletteOpen: v }),
    setTheme: (t) => {
      set({ theme: t })
      void db.settings.put({ key: 'theme', value: t })
    },
    setInspectorOpen: (v) => set({ inspectorOpen: v }),

    createMap: (title) => {
      const id = newId()
      const rootId = newId()
      const t = now()
      const map: MindMap = { id, title: title || 'Nová mapa', rootId, createdAt: t, updatedAt: t }
      const root: MapNode = {
        id: rootId,
        mapId: id,
        parentId: null,
        text: map.title,
        color: null,
        icon: null,
        collapsed: false,
        order: 0,
        createdAt: t,
        updatedAt: t,
      }
      set((s) => ({ maps: { ...s.maps, [id]: map }, nodes: { ...s.nodes, [rootId]: root } }))
      void db.maps.put(map)
      persistNodes([root])
      return id
    },
    renameMap: (id, title) => {
      const m = get().maps[id]
      if (!m) return
      const upd = { ...m, title, updatedAt: now() }
      set((s) => ({ maps: { ...s.maps, [id]: upd } }))
      void db.maps.put(upd)
      // keep root text in sync when it still equals the old title
      const root = get().nodes[m.rootId]
      if (root && root.text === m.title) get().updateNode(root.id, { text: title })
    },
    deleteMap: (id) => {
      const m = get().maps[id]
      if (!m) return
      const ids = Object.values(get().nodes)
        .filter((n) => n.mapId === id)
        .map((n) => n.id)
      removeLinksTouching(new Set(ids), 'node')
      dropImagesOf(ids)
      set((s) => {
        const maps = { ...s.maps }
        delete maps[id]
        const nodes = { ...s.nodes }
        for (const nid of ids) delete nodes[nid]
        return { maps, nodes, undoStack: s.undoStack.filter((u) => u.mapId !== id), redoStack: [] }
      })
      void db.maps.delete(id)
      persistNodes([], ids)
      const v = get().view
      if (v.kind === 'map' && v.mapId === id) {
        const next = Object.values(get().maps).sort((a, b) => b.updatedAt - a.updatedAt)[0]
        get().setView(next ? { kind: 'map', mapId: next.id } : { kind: 'notes', noteId: null })
      }
    },

    addChild: (parentId, text = '') => {
      const parent = get().nodes[parentId]
      if (!parent) return ''
      pushUndo(parent.mapId)
      const siblings = childrenOf(get().nodes, parentId)
      const t = now()
      const node: MapNode = {
        id: newId(),
        mapId: parent.mapId,
        parentId,
        text,
        color: null,
        icon: null,
        collapsed: false,
        order: siblings.length ? siblings[siblings.length - 1].order + 1 : 0,
        createdAt: t,
        updatedAt: t,
      }
      const changed: MapNode[] = [node]
      const updates: Record<ID, MapNode> = { [node.id]: node }
      if (parent.collapsed) {
        const p = { ...parent, collapsed: false, updatedAt: t }
        updates[p.id] = p
        changed.push(p)
      }
      set((s) => ({ nodes: { ...s.nodes, ...updates }, selectedNodeId: node.id, editingNodeId: node.id, editingSeed: null }))
      persistNodes(changed)
      touchMap(parent.mapId)
      return node.id
    },
    addSibling: (nodeId, text = '') => {
      const n = get().nodes[nodeId]
      if (!n) return ''
      if (!n.parentId) return get().addChild(nodeId, text)
      pushUndo(n.mapId)
      const siblings = childrenOf(get().nodes, n.parentId)
      const idx = siblings.findIndex((s) => s.id === nodeId)
      const t = now()
      const node: MapNode = {
        id: newId(),
        mapId: n.mapId,
        parentId: n.parentId,
        text,
        color: null,
        icon: null,
        collapsed: false,
        order: 0,
        createdAt: t,
        updatedAt: t,
      }
      const reordered = [...siblings.slice(0, idx + 1), node, ...siblings.slice(idx + 1)].map((s, i) => ({ ...s, order: i }))
      const updates: Record<ID, MapNode> = {}
      for (const s of reordered) updates[s.id] = s
      set((s) => ({ nodes: { ...s.nodes, ...updates }, selectedNodeId: node.id, editingNodeId: node.id, editingSeed: null }))
      persistNodes(reordered)
      touchMap(n.mapId)
      return node.id
    },
    updateNode: (id, patch) => {
      const n = get().nodes[id]
      if (!n) return
      const textChanged = patch.text !== undefined && patch.text !== n.text
      if (textChanged || patch.color !== undefined || patch.icon !== undefined || patch.size !== undefined || patch.width !== undefined) pushUndo(n.mapId)
      const upd = { ...n, ...patch, updatedAt: now() }
      set((s) => ({ nodes: { ...s.nodes, [id]: upd } }))
      persistNodes([upd])
      touchMap(n.mapId)
      if (textChanged) {
        // renaming the root renames the map while the two still match
        const m = get().maps[n.mapId]
        if (m && m.rootId === id && m.title === n.text && upd.text) {
          const mu = { ...m, title: upd.text, updatedAt: now() }
          set((s) => ({ maps: { ...s.maps, [n.mapId]: mu } }))
          void db.maps.put(mu)
        }
        resyncMentions()
      }
    },
    deleteNode: (id) => {
      const n = get().nodes[id]
      if (!n || get().maps[n.mapId]?.rootId === id) return // never delete the root
      pushUndo(n.mapId)
      const ids = subtreeIds(get().nodes, id)
      removeLinksTouching(new Set(ids), 'node')
      dropImagesOf(ids)
      const siblings = n.parentId ? childrenOf(get().nodes, n.parentId) : []
      const idx = siblings.findIndex((s) => s.id === id)
      const nextSel = siblings[idx + 1]?.id ?? siblings[idx - 1]?.id ?? n.parentId ?? null
      set((s) => {
        const nodes = { ...s.nodes }
        for (const nid of ids) delete nodes[nid]
        return { nodes, selectedNodeId: nextSel, editingNodeId: null }
      })
      persistNodes([], ids)
      touchMap(n.mapId)
    },
    moveNode: (id, newParentId, index) => {
      const n = get().nodes[id]
      const p = get().nodes[newParentId]
      if (!n || !p || n.mapId !== p.mapId || get().maps[n.mapId]?.rootId === id) return
      if (subtreeIds(get().nodes, id).includes(newParentId)) return // cannot move into own subtree
      pushUndo(n.mapId)
      const t = now()
      const siblings = childrenOf(get().nodes, newParentId).filter((s) => s.id !== id)
      const at = index === undefined ? siblings.length : Math.max(0, Math.min(index, siblings.length))
      const moved = { ...n, parentId: newParentId, x: null, y: null, updatedAt: t }
      const reordered = [...siblings.slice(0, at), moved, ...siblings.slice(at)].map((s, i) => ({ ...s, order: i }))
      const updates: Record<ID, MapNode> = {}
      for (const s of reordered) updates[s.id] = s
      const changed = [...reordered]
      if (p.collapsed) {
        const pu = { ...p, collapsed: false, updatedAt: t }
        updates[pu.id] = pu
        changed.push(pu)
      }
      set((s) => ({ nodes: { ...s.nodes, ...updates } }))
      persistNodes(changed)
      touchMap(n.mapId)
    },
    addFloatingNode: (mapId, cx, cy, text = '') => {
      if (!get().maps[mapId]) return ''
      pushUndo(mapId)
      const t = now()
      const node: MapNode = {
        id: newId(),
        mapId,
        parentId: null,
        text,
        color: null,
        icon: null,
        collapsed: false,
        order: 0,
        x: Math.round(cx),
        y: Math.round(cy),
        createdAt: t,
        updatedAt: t,
      }
      set((s) => ({ nodes: { ...s.nodes, [node.id]: node }, selectedNodeId: node.id, editingNodeId: node.id, editingSeed: null }))
      persistNodes([node])
      touchMap(mapId)
      return node.id
    },
    setNodePosition: (id, cx, cy) => {
      const n = get().nodes[id]
      if (!n || n.parentId || get().maps[n.mapId]?.rootId === id) return
      const upd = { ...n, x: Math.round(cx), y: Math.round(cy), updatedAt: now() }
      set((s) => ({ nodes: { ...s.nodes, [id]: upd } }))
      persistNodes([upd])
    },
    detachNode: (id, cx, cy) => {
      const n = get().nodes[id]
      if (!n || !n.parentId) return
      pushUndo(n.mapId)
      const upd = { ...n, parentId: null, x: Math.round(cx), y: Math.round(cy), updatedAt: now() }
      set((s) => ({ nodes: { ...s.nodes, [id]: upd } }))
      persistNodes([upd])
      touchMap(n.mapId)
    },
    setNodeImage: async (id, file) => {
      const n = get().nodes[id]
      if (!n || !file.type.startsWith('image/')) return
      const { dataUrl, w, h } = await shrinkImage(file)
      const rec: ImageRec = { id: newId(), dataUrl, w, h, createdAt: now() }
      const old = n.image
      const upd = { ...n, image: rec.id, updatedAt: now() }
      set((s) => {
        const images = { ...s.images, [rec.id]: rec }
        if (old) delete images[old]
        return { images, nodes: { ...s.nodes, [id]: upd } }
      })
      await db.images.put(rec)
      if (old) await db.images.delete(old)
      persistNodes([upd])
      touchMap(n.mapId)
    },
    removeNodeImage: (id) => {
      const n = get().nodes[id]
      if (!n || !n.image) return
      const old = n.image
      const upd = { ...n, image: null, updatedAt: now() }
      set((s) => {
        const images = { ...s.images }
        delete images[old]
        return { images, nodes: { ...s.nodes, [id]: upd } }
      })
      void db.images.delete(old)
      persistNodes([upd])
    },
    reorderNode: (id, delta) => {
      const n = get().nodes[id]
      if (!n || !n.parentId) return
      const siblings = childrenOf(get().nodes, n.parentId)
      const idx = siblings.findIndex((s) => s.id === id)
      const to = idx + delta
      if (to < 0 || to >= siblings.length) return
      pushUndo(n.mapId)
      const arr = [...siblings]
      arr.splice(idx, 1)
      arr.splice(to, 0, n)
      const reordered = arr.map((s, i) => ({ ...s, order: i }))
      const updates: Record<ID, MapNode> = {}
      for (const s of reordered) updates[s.id] = s
      set((s) => ({ nodes: { ...s.nodes, ...updates } }))
      persistNodes(reordered)
    },
    toggleCollapse: (id) => {
      const n = get().nodes[id]
      if (!n) return
      const upd = { ...n, collapsed: !n.collapsed, updatedAt: now() }
      set((s) => ({ nodes: { ...s.nodes, [id]: upd } }))
      persistNodes([upd])
    },
    expandAncestors: (id) => {
      const { nodes } = get()
      const changed: MapNode[] = []
      let cur = nodes[id]?.parentId ? nodes[nodes[id].parentId!] : undefined
      while (cur) {
        if (cur.collapsed) changed.push({ ...cur, collapsed: false })
        cur = cur.parentId ? nodes[cur.parentId] : undefined
      }
      if (!changed.length) return
      const updates: Record<ID, MapNode> = {}
      for (const c of changed) updates[c.id] = c
      set((s) => ({ nodes: { ...s.nodes, ...updates } }))
      persistNodes(changed)
    },
    undo: () => {
      const { undoStack, view } = get()
      if (view.kind !== 'map') return
      const idx = [...undoStack].reverse().findIndex((s) => s.mapId === view.mapId)
      if (idx < 0) return
      const real = undoStack.length - 1 - idx
      const snap = undoStack[real]
      const current = snapshot(view.mapId)
      set((s) => ({ undoStack: s.undoStack.filter((_, i) => i !== real), redoStack: [...s.redoStack, current] }))
      restore(snap)
    },
    redo: () => {
      const { redoStack, view } = get()
      if (view.kind !== 'map') return
      const idx = [...redoStack].reverse().findIndex((s) => s.mapId === view.mapId)
      if (idx < 0) return
      const real = redoStack.length - 1 - idx
      const snap = redoStack[real]
      const current = snapshot(view.mapId)
      set((s) => ({ redoStack: s.redoStack.filter((_, i) => i !== real), undoStack: [...s.undoStack, current] }))
      restore(snap)
    },

    createNote: (partial = {}) => {
      const t = now()
      const note: Note = {
        id: newId(),
        kind: 'note',
        title: '',
        body: '',
        tags: [],
        createdAt: t,
        updatedAt: t,
        ...partial,
      }
      set((s) => ({ notes: { ...s.notes, [note.id]: note } }))
      void db.notes.put(note)
      if (note.body) syncAutoLinks(note.id)
      return note.id
    },
    updateNote: (id, patch) => {
      const n = get().notes[id]
      if (!n) return
      const upd = { ...n, ...patch, updatedAt: now() }
      set((s) => ({ notes: { ...s.notes, [id]: upd } }))
      void db.notes.put(upd)
      if (patch.body !== undefined) syncAutoLinks(id)
      if (patch.title !== undefined) resyncMentions()
    },
    deleteNote: (id) => {
      removeLinksTouching(new Set([id]), 'note')
      set((s) => {
        const notes = { ...s.notes }
        delete notes[id]
        return { notes }
      })
      void db.notes.delete(id)
      const v = get().view
      if (v.kind === 'notes' && v.noteId === id) get().setView({ kind: 'notes', noteId: null })
    },
    getOrCreateJournal: (date) => {
      const existing = Object.values(get().notes).find((n) => n.kind === 'journal' && n.date === date)
      if (existing) return existing.id
      return get().createNote({ kind: 'journal', date, title: date })
    },

    addLink: (from, to, type, label) => {
      if (from.kind === to.kind && from.id === to.id) return null
      const dup = Object.values(get().links).find(
        (l) => !l.auto && l.type === type && l.fromKind === from.kind && l.fromId === from.id && l.toKind === to.kind && l.toId === to.id,
      )
      if (dup) return dup.id
      const link: Link = {
        id: newId(),
        fromKind: from.kind,
        fromId: from.id,
        toKind: to.kind,
        toId: to.id,
        type,
        label,
        createdAt: now(),
      }
      const mapId = from.kind === 'node' ? get().nodes[from.id]?.mapId : to.kind === 'node' ? get().nodes[to.id]?.mapId : null
      if (mapId) pushUndo(mapId)
      set((s) => ({ links: { ...s.links, [link.id]: link } }))
      persistLinks([link])
      return link.id
    },
    removeLink: (id) => {
      const l = get().links[id]
      if (!l) return
      const mapId = l.fromKind === 'node' ? get().nodes[l.fromId]?.mapId : l.toKind === 'node' ? get().nodes[l.toId]?.mapId : null
      if (mapId) pushUndo(mapId)
      set((s) => {
        const links = { ...s.links }
        delete links[id]
        return { links }
      })
      persistLinks([], [id])
    },
    addRelationType: (forward, inverse, color, directed) => {
      const id = slugify(forward) || newId(6)
      const existing = get().relationTypes.find((t) => t.id === id)
      if (existing) return existing.id
      const rt: RelationType = { id, forward, inverse: inverse || forward, color, directed }
      const relationTypes = [...get().relationTypes, rt]
      set({ relationTypes })
      void db.settings.put({ key: 'relationTypes', value: relationTypes.filter((t) => !t.builtin) })
      return id
    },

    exportMapPackage: (mapId) => {
      const s = get()
      const map = s.maps[mapId]
      const nodes = Object.values(s.nodes).filter((n) => n.mapId === mapId)
      const ids = new Set(nodes.map((n) => n.id))
      const links = Object.values(s.links).filter((l) => (l.fromKind === 'node' && ids.has(l.fromId)) || (l.toKind === 'node' && ids.has(l.toId)))
      const noteIds = new Set<ID>()
      for (const l of links) {
        if (l.fromKind === 'note') noteIds.add(l.fromId)
        if (l.toKind === 'note') noteIds.add(l.toId)
      }
      const notes = [...noteIds].map((id) => s.notes[id]).filter((n): n is Note => !!n && n.kind === 'note')
      const noteSet = new Set(notes.map((n) => n.id))
      const keep = (k: EntityKind, id: ID) => (k === 'node' ? ids.has(id) : noteSet.has(id))
      return {
        kind: 'mindmap-package',
        version: 1,
        map: { title: map.title },
        nodes: nodes.map(({ id, parentId, text, color, icon, collapsed, order, x, y, size, width }) => ({
          id,
          parentId,
          text,
          color,
          icon,
          collapsed,
          order,
          x,
          y,
          size,
          width,
        })),
        links: links
          .filter((l) => !l.auto && keep(l.fromKind, l.fromId) && keep(l.toKind, l.toId))
          .map(({ fromKind, fromId, toKind, toId, type, label }) => ({ fromKind, fromId, toKind, toId, type, label })),
        notes: notes.map(({ id, title, body, tags }) => ({ id, title, body, tags })),
        relationTypes: s.relationTypes.filter((t) => !t.builtin && links.some((l) => l.type === t.id)),
      }
    },
    importMapPackage: (pkg) => {
      if (!pkg || pkg.kind !== 'mindmap-package' || !Array.isArray(pkg.nodes) || !pkg.nodes.length) return null
      const t = now()
      const nodeMap = new Map<string, ID>()
      const noteMap = new Map<string, ID>()
      for (const n of pkg.nodes) nodeMap.set(n.id, newId())
      for (const n of pkg.notes ?? []) noteMap.set(n.id, newId())
      const rootSrc = pkg.nodes.find((n) => n.parentId === null) ?? pkg.nodes[0]
      const mapId = newId()
      const rootId = nodeMap.get(rootSrc.id)!
      const map: MindMap = { id: mapId, title: pkg.map?.title || rootSrc.text || 'Importovaná mapa', rootId, createdAt: t, updatedAt: t }
      const nodes: MapNode[] = pkg.nodes.map((n) => ({
        id: nodeMap.get(n.id)!,
        mapId,
        parentId: n.parentId && nodeMap.has(n.parentId) ? nodeMap.get(n.parentId)! : n.id === rootSrc.id ? null : n.parentId === null ? null : rootId,
        text: n.text ?? '',
        color: n.color ?? null,
        icon: n.icon ?? null,
        collapsed: !!n.collapsed,
        order: n.order ?? 0,
        x: n.x ?? null,
        y: n.y ?? null,
        size: n.size ?? null,
        width: n.width ?? null,
        createdAt: t,
        updatedAt: t,
      }))
      const notes: Note[] = (pkg.notes ?? []).map((n) => ({
        id: noteMap.get(n.id)!,
        kind: 'note',
        title: n.title ?? '',
        body: n.body ?? '',
        tags: n.tags ?? [],
        createdAt: t,
        updatedAt: t,
      }))
      const remap = (k: EntityKind, id: string) => (k === 'node' ? nodeMap.get(id) : noteMap.get(id))
      const links: Link[] = []
      for (const l of pkg.links ?? []) {
        const from = remap(l.fromKind, l.fromId)
        const to = remap(l.toKind, l.toId)
        if (!from || !to) continue
        links.push({ id: newId(), fromKind: l.fromKind, fromId: from, toKind: l.toKind, toId: to, type: l.type, label: l.label, createdAt: t })
      }
      const known = new Set(get().relationTypes.map((r) => r.id))
      const newTypes = (pkg.relationTypes ?? []).filter((r) => r && r.id && !known.has(r.id)).map((r) => ({ ...r, builtin: false }))
      if (newTypes.length) {
        const relationTypes = [...get().relationTypes, ...newTypes]
        set({ relationTypes })
        void db.settings.put({ key: 'relationTypes', value: relationTypes.filter((r) => !r.builtin) })
      }
      set((s) => ({
        maps: { ...s.maps, [mapId]: map },
        nodes: { ...s.nodes, ...Object.fromEntries(nodes.map((n) => [n.id, n])) },
        notes: { ...s.notes, ...Object.fromEntries(notes.map((n) => [n.id, n])) },
        links: { ...s.links, ...Object.fromEntries(links.map((l) => [l.id, l])) },
      }))
      void db.maps.put(map)
      persistNodes(nodes)
      void db.notes.bulkPut(notes)
      persistLinks(links)
      for (const n of notes) syncAutoLinks(n.id)
      return mapId
    },
    importOutline: (title, items) => {
      const mapId = get().createMap(title || 'Importovaná mapa')
      const rootId = get().maps[mapId].rootId
      const t = now()
      const out: MapNode[] = []
      const walk = (parentId: ID, list: { text: string; children: unknown[] }[]) => {
        list.forEach((it, i) => {
          const n: MapNode = { id: newId(), mapId, parentId, text: it.text, color: null, icon: null, collapsed: false, order: i, createdAt: t, updatedAt: t }
          out.push(n)
          walk(n.id, it.children as { text: string; children: unknown[] }[])
        })
      }
      walk(rootId, items)
      set((s) => ({ nodes: { ...s.nodes, ...Object.fromEntries(out.map((n) => [n.id, n])) } }))
      persistNodes(out)
      return mapId
    },
    exportAll: () => {
      const s = get()
      return {
        version: 1,
        exportedAt: new Date().toISOString(),
        maps: Object.values(s.maps),
        nodes: Object.values(s.nodes),
        notes: Object.values(s.notes),
        links: Object.values(s.links),
        relationTypes: s.relationTypes.filter((t) => !t.builtin),
        images: Object.values(s.images),
      }
    },
    importAll: async (b) => {
      await db.transaction('rw', [db.maps, db.nodes, db.notes, db.links, db.settings, db.images], async () => {
        await Promise.all([db.maps.clear(), db.nodes.clear(), db.notes.clear(), db.links.clear(), db.images.clear()])
        await db.maps.bulkPut(b.maps)
        await db.nodes.bulkPut(b.nodes)
        await db.notes.bulkPut(b.notes)
        await db.links.bulkPut(b.links)
        await db.images.bulkPut(b.images ?? [])
        await db.settings.put({ key: 'relationTypes', value: b.relationTypes ?? [] })
      })
      set({ undoStack: [], redoStack: [], selectedNodeId: null, editingNodeId: null })
      location.hash = ''
      await get().load()
    },
    resetAll: async () => {
      await Promise.all([db.maps.clear(), db.nodes.clear(), db.notes.clear(), db.links.clear(), db.images.clear()])
      set({ maps: {}, nodes: {}, notes: {}, links: {}, images: {}, undoStack: [], redoStack: [], selectedNodeId: null })
      location.hash = ''
      await get().load()
    },
  }
})

/* ---------- derived helpers (pure, used by components) ---------- */

export function linksOf(links: Record<ID, Link>, ref: EntityRef): { outgoing: Link[]; incoming: Link[] } {
  const outgoing: Link[] = []
  const incoming: Link[] = []
  for (const l of Object.values(links)) {
    if (l.fromKind === ref.kind && l.fromId === ref.id) outgoing.push(l)
    else if (l.toKind === ref.kind && l.toId === ref.id) incoming.push(l)
  }
  return { outgoing, incoming }
}

export function entityTitle(s: Pick<AppState, 'nodes' | 'notes' | 'maps'>, ref: EntityRef): string {
  if (ref.kind === 'node') return s.nodes[ref.id]?.text || '(bez názvu)'
  const n = s.notes[ref.id]
  if (!n) return '(zmazané)'
  return n.title || (n.kind === 'journal' ? n.date! : '(bez názvu)')
}

/** Notes (incl. journal) that are explicitly attached to or mention a node. */
export function notesForNode(s: Pick<AppState, 'links' | 'notes'>, nodeId: ID): Note[] {
  const ids = new Set<ID>()
  for (const l of Object.values(s.links)) {
    if (l.toKind === 'node' && l.toId === nodeId && l.fromKind === 'note') ids.add(l.fromId)
    if (l.fromKind === 'node' && l.fromId === nodeId && l.toKind === 'note') ids.add(l.toId)
  }
  return [...ids].map((id) => s.notes[id]).filter((n): n is Note => !!n)
}
