import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  applyNodeChanges,
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
  type Edge,
  type Node,
  type NodeChange,
  type OnNodeDrag,
} from '@xyflow/react'
import { toPng } from 'html-to-image'
import {
  ChevronsDownUp,
  ChevronsUpDown,
  Download,
  GitBranch,
  Image as ImageIcon,
  Keyboard,
  Link2,
  Maximize,
  PanelRightOpen,
  Plus,
  Redo2,
  Trash2,
  Undo2,
} from 'lucide-react'
import { childrenOf, subtreeIds, useStore } from '../lib/store'
import { clearMeasureCache, fontFor, layoutMindMap, measureNode, type LaidOutNode } from '../lib/layout'
import { BRANCH_COLORS } from '../lib/relations'
import { download, mapToMarkdown, mapToOPML, safeName } from '../lib/export'
import type { ID, MapNode } from '../lib/types'
import { MindNode, type MindNodeType } from './MindNode'
import { RelEdge, TreeEdge } from './Edges'

const nodeTypes = { mind: MindNode }
const edgeTypes = { tree: TreeEdge, rel: RelEdge }

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

interface Computed {
  nodes: MindNodeType[]
  edges: Edge[]
  layout: Map<ID, LaidOutNode>
}

function Canvas({ mapId, onHelp }: { mapId: ID; onHelp: () => void }) {
  const map = useStore((s) => s.maps[mapId])
  const allNodes = useStore((s) => s.nodes)
  const links = useStore((s) => s.links)
  const notes = useStore((s) => s.notes)
  const relationTypes = useStore((s) => s.relationTypes)
  const selectedNodeId = useStore((s) => s.selectedNodeId)
  const editingNodeId = useStore((s) => s.editingNodeId)
  const showRelations = useStore((s) => s.showRelations)
  const focusTick = useStore((s) => s.focusTick)
  const theme = useStore((s) => s.theme)
  const paletteOpen = useStore((s) => s.paletteOpen)
  const inspectorOpen = useStore((s) => s.inspectorOpen)
  const undoStack = useStore((s) => s.undoStack)
  const defaultNodeSize = useStore((s) => s.defaultNodeSize)
  const nodeMaxWidth = useStore((s) => s.nodeMaxWidth)
  const redoStack = useStore((s) => s.redoStack)
  const {
    selectNode,
    setEditing,
    addChild,
    addSibling,
    deleteNode,
    moveNode,
    reorderNode,
    toggleCollapse,
    updateNode,
    undo,
    redo,
    setShowRelations,
    setInspectorOpen,
    renameMap,
  } = useStore()
  const rf = useReactFlow()
  const [dropTargetId, setDropTargetId] = useState<ID | null>(null)
  const [fontEpoch, setFontEpoch] = useState(0)
  useEffect(() => {
    let alive = true
    void document.fonts.ready.then(() => {
      if (!alive) return
      clearMeasureCache()
      setFontEpoch((e) => e + 1)
    })
    return () => {
      alive = false
    }
  }, [])
  const wrapRef = useRef<HTMLDivElement>(null)

  const mapNodes = useMemo(() => Object.values(allNodes).filter((n) => n.mapId === mapId), [allNodes, mapId])

  const computed = useMemo<Computed>(() => {
    if (!map) return { nodes: [], edges: [], layout: new Map() }
    const byId: Record<ID, MapNode> = {}
    for (const n of mapNodes) byId[n.id] = n

    // counts of notes / relations per node
    const notesCount: Record<ID, number> = {}
    const relCount: Record<ID, number> = {}
    const noteSeen = new Set<string>()
    for (const l of Object.values(links)) {
      const fromNode = l.fromKind === 'node' && byId[l.fromId]
      const toNode = l.toKind === 'node' && byId[l.toId]
      if (fromNode && toNode) {
        relCount[l.fromId] = (relCount[l.fromId] ?? 0) + 1
        relCount[l.toId] = (relCount[l.toId] ?? 0) + 1
      } else if (fromNode && l.toKind === 'node') relCount[l.fromId] = (relCount[l.fromId] ?? 0) + 1
      else if (toNode && l.fromKind === 'node') relCount[l.toId] = (relCount[l.toId] ?? 0) + 1
      else if (toNode && l.fromKind === 'note' && notes[l.fromId]) {
        const k = `${l.toId}:${l.fromId}`
        if (!noteSeen.has(k)) {
          noteSeen.add(k)
          notesCount[l.toId] = (notesCount[l.toId] ?? 0) + 1
        }
      } else if (fromNode && l.toKind === 'note' && notes[l.toId]) {
        const k = `${l.fromId}:${l.toId}`
        if (!noteSeen.has(k)) {
          noteSeen.add(k)
          notesCount[l.fromId] = (notesCount[l.fromId] ?? 0) + 1
        }
      }
    }

    const sizeOfNode = (n: MapNode, isRoot: boolean) => n.size ?? (isRoot ? (defaultNodeSize === 'md' ? 'lg' : defaultNodeSize) : defaultNodeSize)
    const layout = layoutMindMap({
      nodes: mapNodes,
      rootId: map.rootId,
      sizeOf: (n, isRoot) =>
        measureNode(n.text, {
          isRoot,
          hasBadges: (notesCount[n.id] ?? 0) + (relCount[n.id] ?? 0) > 0,
          hasIcon: !!n.icon,
          size: sizeOfNode(n, isRoot),
          maxTextWidth: nodeMaxWidth,
          fixedWidth: n.width ?? null,
        }),
    })

    // colour: explicit colour on the nearest ancestor, else branch palette
    const colorCache = new Map<ID, string>()
    const colorOf = (id: ID): string => {
      const cached = colorCache.get(id)
      if (cached) return cached
      const n = byId[id]
      const lo = layout.get(id)
      let c: string
      if (!n) c = 'var(--text-muted)'
      else if (n.color) c = n.color
      else if (!n.parentId) c = 'var(--text-muted)'
      else if (lo && lo.depth === 1) c = BRANCH_COLORS[lo.branch % BRANCH_COLORS.length]
      else c = colorOf(n.parentId)
      colorCache.set(id, c)
      return c
    }

    // highlight nodes related to the selection
    const relatedColor = new Map<ID, string>()
    if (selectedNodeId) {
      for (const l of Object.values(links)) {
        if (l.fromKind !== 'node' || l.toKind !== 'node') continue
        const other = l.fromId === selectedNodeId ? l.toId : l.toId === selectedNodeId ? l.fromId : null
        if (other && layout.has(other)) relatedColor.set(other, relationTypes.find((t) => t.id === l.type)?.color ?? '#94a3b8')
      }
    }

    const nodes: MindNodeType[] = []
    const edges: Edge[] = []
    for (const lo of layout.values()) {
      const n = byId[lo.id]
      const f = fontFor({ isRoot: lo.depth === 0, size: sizeOfNode(n, lo.depth === 0) })
      nodes.push({
        id: lo.id,
        type: 'mind',
        position: { x: lo.x, y: lo.y },
        selected: lo.id === selectedNodeId,
        data: {
          text: n.text,
          color: colorOf(lo.id),
          icon: n.icon,
          isRoot: lo.depth === 0,
          side: lo.side,
          collapsed: n.collapsed,
          hasChildren: lo.hasChildren,
          childCount: lo.childCount,
          notesCount: notesCount[lo.id] ?? 0,
          relCount: relCount[lo.id] ?? 0,
          width: lo.width,
          fixedWidth: n.width ?? null,
          fontPx: f.font,
          lineH: f.line,
          editing: editingNodeId === lo.id,
          dropTarget: dropTargetId === lo.id,
          relatedColor: relatedColor.get(lo.id) ?? null,
        },
      })
      if (n.parentId && layout.has(n.parentId)) {
        const right = lo.side === 'right'
        edges.push({
          id: `t-${lo.id}`,
          type: 'tree',
          source: n.parentId,
          target: lo.id,
          sourceHandle: right ? 'sr' : 'sl',
          targetHandle: right ? 'tl' : 'tr',
          data: { color: colorOf(lo.id), depth: lo.depth },
          selectable: false,
          focusable: false,
        })
      }
    }
    if (showRelations) {
      for (const l of Object.values(links)) {
        if (l.fromKind !== 'node' || l.toKind !== 'node') continue
        const a = layout.get(l.fromId)
        const b = layout.get(l.toId)
        if (!a || !b) continue
        const rt = relationTypes.find((t) => t.id === l.type)
        const leftToRight = a.cx <= b.cx
        edges.push({
          id: `r-${l.id}`,
          type: 'rel',
          source: l.fromId,
          target: l.toId,
          sourceHandle: leftToRight ? 'sr' : 'sl',
          targetHandle: leftToRight ? 'tl' : 'tr',
          data: {
            color: rt?.color ?? '#94a3b8',
            label: l.label || rt?.forward || l.type,
            linkId: l.id,
            directed: rt?.directed ?? true,
            emphasized: !selectedNodeId || l.fromId === selectedNodeId || l.toId === selectedNodeId,
          },
          interactionWidth: 8,
        })
      }
    }
    return { nodes, edges, layout }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, mapNodes, links, notes, relationTypes, selectedNodeId, editingNodeId, showRelations, dropTargetId, fontEpoch, defaultNodeSize, nodeMaxWidth])

  const [rfNodes, setRfNodes] = useState<MindNodeType[]>(computed.nodes)
  useEffect(() => setRfNodes(computed.nodes), [computed.nodes])

  const onNodesChange = useCallback((changes: NodeChange<MindNodeType>[]) => {
    setRfNodes((ns) =>
      applyNodeChanges(
        changes.filter((c) => c.type !== 'select' && c.type !== 'remove'),
        ns,
      ),
    )
  }, [])

  // fit view when the map changes
  useEffect(() => {
    const t = setTimeout(() => rf.fitView({ padding: 0.2, duration: 0, maxZoom: 1.1 }), 30)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId])

  // centre on the selected node when asked to
  useEffect(() => {
    if (!focusTick || !selectedNodeId) return
    const t = setTimeout(() => {
      const lo = useStore.getState().nodes[selectedNodeId]
      if (!lo || lo.mapId !== mapId) return
      const laid = computed.layout.get(selectedNodeId)
      if (laid) rf.setCenter(laid.cx, laid.cy, { zoom: Math.max(rf.getZoom(), 1), duration: 450 })
    }, 80)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusTick])

  /* ---------- drag to re-parent ---------- */
  const onNodeDrag: OnNodeDrag<MindNodeType> = useCallback(
    (_e, node) => {
      const sub = new Set(subtreeIds(useStore.getState().nodes, node.id))
      const hits = rf.getIntersectingNodes(node).filter((n) => !sub.has(n.id))
      setDropTargetId(hits[0]?.id ?? null)
    },
    [rf],
  )
  const onNodeDragStop: OnNodeDrag<MindNodeType> = useCallback(
    (_e, node) => {
      const target = dropTargetId
      setDropTargetId(null)
      if (target && target !== node.id) moveNode(node.id, target)
      else setRfNodes(computed.nodes.map((n) => ({ ...n })))
    },
    [dropTargetId, moveNode, computed.nodes],
  )

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (paletteOpen || isTypingTarget(e.target)) return
      const state = useStore.getState()
      const mod = e.ctrlKey || e.metaKey
      if (state.editingNodeId) {
        // The editor is mounting but not focused yet (fast typists): buffer printable keys
        // and apply Enter / Tab / Escape the same way the editor itself would.
        const id = state.editingNodeId
        const n = state.nodes[id]
        if (e.key === 'Escape') {
          setEditing(null)
          if (n && !n.text && n.parentId) deleteNode(id)
        } else if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault()
          const text = (state.editingSeed ?? n?.text ?? '').trim()
          setEditing(null)
          if (!text) {
            if (n && !n.text && n.parentId) deleteNode(id)
            return
          }
          if (n && text !== n.text) updateNode(id, { text })
          if (e.key === 'Tab') addChild(id)
        } else if (!mod && !e.altKey && e.key.length === 1) {
          e.preventDefault()
          setEditing(id, e.key)
        }
        return
      }
      const sel = state.selectedNodeId
      const node = sel ? state.nodes[sel] : null
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }
      if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
        return
      }
      if (!node || node.mapId !== mapId) {
        if (e.key === 'Tab' || e.key === 'Enter') {
          e.preventDefault()
          selectNode(map.rootId)
        }
        return
      }
      const lo = computed.layout.get(node.id)
      switch (e.key) {
        case 'Tab':
          e.preventDefault()
          addChild(node.id)
          return
        case 'Enter':
          e.preventDefault()
          if (mod) addChild(node.id)
          else addSibling(node.id)
          return
        case 'F2':
        case ' ':
          e.preventDefault()
          setEditing(node.id)
          return
        case 'Delete':
        case 'Backspace':
          e.preventDefault()
          deleteNode(node.id)
          return
        case 'Escape':
          selectNode(null)
          return
        case '.':
        case '/':
          if (mod) {
            e.preventDefault()
            toggleCollapse(node.id)
          }
          return
        case 'ArrowUp':
        case 'ArrowDown': {
          e.preventDefault()
          const delta = e.key === 'ArrowUp' ? -1 : 1
          if (mod) {
            reorderNode(node.id, delta)
            return
          }
          if (!node.parentId) {
            const kids = childrenOf(state.nodes, node.id)
            if (kids.length) selectNode(kids[0].id)
            return
          }
          const sibs = childrenOf(state.nodes, node.parentId)
          const i = sibs.findIndex((s) => s.id === node.id)
          const next = sibs[i + delta]
          if (next) selectNode(next.id)
          else {
            // jump to the nearest visible node in that direction
            const cand = [...computed.layout.values()]
              .filter((l) => l.id !== node.id && lo && Math.sign(l.cy - lo.cy) === delta && Math.abs(l.cx - lo.cx) < 200)
              .sort((a, b) => Math.abs(a.cy - lo!.cy) - Math.abs(b.cy - lo!.cy))
            if (cand[0]) selectNode(cand[0].id)
          }
          return
        }
        case 'ArrowLeft':
        case 'ArrowRight': {
          e.preventDefault()
          const dir = e.key === 'ArrowRight' ? 'right' : 'left'
          if (!lo) return
          const goChild = lo.side === 'root' || lo.side === dir
          if (goChild) {
            if (node.collapsed) {
              toggleCollapse(node.id)
              return
            }
            const kids = childrenOf(state.nodes, node.id).filter((k) => computed.layout.get(k.id)?.side === dir)
            if (kids.length) selectNode(kids[Math.floor((kids.length - 1) / 2)].id)
          } else if (node.parentId) selectNode(node.parentId)
          return
        }
        default:
          if (!mod && !e.altKey && e.key.length === 1) {
            e.preventDefault()
            setEditing(node.id, e.key)
          }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mapId, map, computed.layout, paletteOpen, addChild, addSibling, deleteNode, selectNode, setEditing, toggleCollapse, reorderNode, updateNode, undo, redo])

  /* ---------- export ---------- */
  const exportPng = async () => {
    const el = wrapRef.current?.querySelector<HTMLElement>('.react-flow__viewport')
    if (!el) return
    const bounds = getNodesBounds(rf.getNodes())
    const pad = 80
    const w = Math.ceil(bounds.width + pad * 2)
    const h = Math.ceil(bounds.height + pad * 2)
    const vp = getViewportForBounds(bounds, w, h, 0.5, 2, pad / Math.max(w, h))
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    const opts = {
      backgroundColor: bg,
      width: w,
      height: h,
      pixelRatio: 2,
      style: { width: `${w}px`, height: `${h}px`, transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})` },
      filter: (n: HTMLElement) => !(n.classList?.contains('react-flow__minimap') || n.classList?.contains('react-flow__controls')),
    }
    let url: string
    try {
      url = await toPng(el, opts)
    } catch {
      url = await toPng(el, { ...opts, skipFonts: true })
    }
    const a = document.createElement('a')
    a.href = url
    a.download = `${safeName(map.title)}.png`
    a.click()
  }

  const collapseAll = (collapsed: boolean) => {
    for (const n of mapNodes) if (n.parentId && n.collapsed !== collapsed && childrenOf(allNodes, n.id).length) toggleCollapse(n.id)
  }

  if (!map) return null
  const canUndo = undoStack.some((s) => s.mapId === mapId)
  const canRedo = redoStack.some((s) => s.mapId === mapId)
  const sel = selectedNodeId ? allNodes[selectedNodeId] : null

  return (
    <div className="map-wrap" ref={wrapRef}>
      <div className="map-title-bar">
        <input value={map.title} onChange={(e) => renameMap(map.id, e.target.value)} aria-label="Názov mapy" />
      </div>
      <div className="toolbar">
        <button className="icon-btn" title="Pridať podradený uzol (Tab)" disabled={!sel} onClick={() => sel && addChild(sel.id)}>
          <Plus size={17} />
        </button>
        <button className="icon-btn" title="Pridať súrodenca (Enter)" disabled={!sel || !sel.parentId} onClick={() => sel && addSibling(sel.id)}>
          <GitBranch size={17} />
        </button>
        <button className="icon-btn danger" title="Zmazať (Delete)" disabled={!sel || !sel.parentId} onClick={() => sel && deleteNode(sel.id)}>
          <Trash2 size={17} />
        </button>
        <span className="sep" />
        <button className="icon-btn" title="Späť (Ctrl+Z)" disabled={!canUndo} onClick={undo}>
          <Undo2 size={17} />
        </button>
        <button className="icon-btn" title="Znova (Ctrl+Shift+Z)" disabled={!canRedo} onClick={redo}>
          <Redo2 size={17} />
        </button>
        <span className="sep" />
        <button className={`icon-btn ${showRelations ? 'active' : ''}`} title="Zobraziť vzťahy na plátne" onClick={() => setShowRelations(!showRelations)}>
          <Link2 size={17} />
        </button>
        <button className="icon-btn" title="Rozbaliť všetko" onClick={() => collapseAll(false)}>
          <ChevronsUpDown size={17} />
        </button>
        <button className="icon-btn" title="Zbaliť všetko" onClick={() => collapseAll(true)}>
          <ChevronsDownUp size={17} />
        </button>
        <button className="icon-btn" title="Prispôsobiť zobrazenie" onClick={() => rf.fitView({ padding: 0.2, duration: 400 })}>
          <Maximize size={17} />
        </button>
        <span className="sep" />
        <button className="icon-btn" title="Exportovať PNG" onClick={exportPng}>
          <ImageIcon size={17} />
        </button>
        <button
          className="icon-btn"
          title="Exportovať Markdown osnovu (Shift: OPML)"
          onClick={(e) =>
            e.shiftKey
              ? download(`${safeName(map.title)}.opml`, mapToOPML(map, allNodes), 'text/xml')
              : download(`${safeName(map.title)}.md`, mapToMarkdown(map, allNodes), 'text/markdown')
          }
        >
          <Download size={17} />
        </button>
        <span className="sep" />
        <button className="icon-btn" title="Klávesové skratky (?)" onClick={onHelp}>
          <Keyboard size={17} />
        </button>
        {!inspectorOpen && (
          <button className="icon-btn" title="Otvoriť inšpektor" onClick={() => setInspectorOpen(true)}>
            <PanelRightOpen size={17} />
          </button>
        )}
      </div>
      <ReactFlow
        nodes={rfNodes}
        edges={computed.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={(_e, n) => selectNode(n.id)}
        onNodeDoubleClick={(_e, n) => setEditing(n.id)}
        onPaneClick={() => {
          selectNode(null)
          if (editingNodeId) setEditing(null)
        }}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        selectNodesOnDrag={false}
        panOnScroll
        zoomOnDoubleClick={false}
        minZoom={0.15}
        maxZoom={2.5}
        colorMode={theme}
        deleteKeyCode={null}
        multiSelectionKeyCode={null}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="var(--grid)" />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          pannable
          zoomable
          position="bottom-right"
          nodeColor={(n: Node) => (n.data as { color: string }).color}
          nodeStrokeWidth={0}
          maskColor="rgba(0,0,0,0.2)"
        />
      </ReactFlow>
      <div className="hint">
        <span>
          <kbd>Tab</kbd> podradený
        </span>
        <span>
          <kbd>Enter</kbd> súrodenec
        </span>
        <span>
          <kbd>Space</kbd> upraviť
        </span>
        <span>
          <kbd>Ctrl</kbd>+<kbd>K</kbd> hľadať
        </span>
        <span>ťahaj uzol na iný = presun</span>
      </div>
    </div>
  )
}

export function MapView({ mapId, onHelp }: { mapId: ID; onHelp: () => void }) {
  return (
    <ReactFlowProvider>
      <Canvas mapId={mapId} onHelp={onHelp} />
    </ReactFlowProvider>
  )
}
