import { useMemo, useState } from 'react'
import { ArrowRight, BookOpen, Calendar, Circle, ExternalLink, PanelRightClose, Plus, X } from 'lucide-react'
import { childrenOf, entityTitle, linksOf, useStore } from '../lib/store'
import { BRANCH_COLORS, DEPENDENCY_TYPES, NODE_ICONS } from '../lib/relations'
import { DEFAULT_MAX_TEXT_WIDTH, MAX_NODE_WIDTH, MIN_NODE_WIDTH } from '../lib/layout'
import type { NodeSize } from '../lib/types'
import { formatDateShort } from '../lib/ids'
import { exportBackup } from '../lib/export'
import type { EntityRef, ID, Link, Note } from '../lib/types'

const SIZES: { id: NodeSize; label: string }[] = [
  { id: 'sm', label: 'S' },
  { id: 'md', label: 'M' },
  { id: 'lg', label: 'L' },
  { id: 'xl', label: 'XL' },
]
import { EntityPicker } from './EntityPicker'
import { NodeIcon } from './NodeIcon'

function EntityItem({ r, label, meta, onRemove }: { r: EntityRef; label: string; meta?: string; onRemove?: () => void }) {
  const goToEntity = useStore((s) => s.goToEntity)
  const notes = useStore((s) => s.notes)
  const isJournal = r.kind === 'note' && notes[r.id]?.kind === 'journal'
  return (
    <div className="entity-item">
      <span className="kind">{r.kind === 'node' ? <Circle size={13} /> : isJournal ? <Calendar size={13} /> : <BookOpen size={13} />}</span>
      <button className="go" onClick={() => goToEntity(r)} title="Prejsť">
        <span className="name">{label}</span>
        {meta && <span className="meta">{meta}</span>}
      </button>
      {onRemove && (
        <button className="x" onClick={onRemove} title="Odstrániť väzbu">
          <X size={13} />
        </button>
      )}
    </div>
  )
}

function DependencyTree({ nodeId, direction }: { nodeId: ID; direction: 'out' | 'in' }) {
  const links = useStore((s) => s.links)
  const nodes = useStore((s) => s.nodes)
  const maps = useStore((s) => s.maps)
  const goToEntity = useStore((s) => s.goToEntity)
  const relationTypes = useStore((s) => s.relationTypes)

  const next = (id: ID): { id: ID; type: string }[] =>
    Object.values(links)
      .filter((l) => DEPENDENCY_TYPES.includes(l.type) && l.fromKind === 'node' && l.toKind === 'node')
      .filter((l) => (direction === 'out' ? l.fromId === id : l.toId === id))
      .map((l) => ({ id: direction === 'out' ? l.toId : l.fromId, type: l.type }))

  const render = (id: ID, seen: Set<ID>, depth: number): React.ReactNode => {
    const items = next(id)
    if (!items.length || depth > 6) return null
    return (
      <ul>
        {items.map((it) => {
          const n = nodes[it.id]
          if (!n) return null
          const rt = relationTypes.find((t) => t.id === it.type)
          const cyc = seen.has(it.id)
          const label = direction === 'out' ? rt?.forward : rt?.inverse
          return (
            <li key={it.id + it.type}>
              <button onClick={() => goToEntity({ kind: 'node', id: it.id })}>
                <span style={{ color: rt?.color, fontSize: 11, marginRight: 6 }}>{label}</span>
                {n.text}
                {n.mapId !== nodes[nodeId]?.mapId && <span className="cyc"> · {maps[n.mapId]?.title}</span>}
                {cyc && <span className="cyc"> (cyklus)</span>}
              </button>
              {!cyc && render(it.id, new Set([...seen, it.id]), depth + 1)}
            </li>
          )
        })}
      </ul>
    )
  }
  const tree = render(nodeId, new Set([nodeId]), 0)
  if (!tree) return <div className="empty">{direction === 'out' ? 'Tento uzol od ničoho nezávisí.' : 'Od tohto uzla nič nezávisí.'}</div>
  return <div className="dep-tree">{tree}</div>
}

function NodeInspector({ nodeId }: { nodeId: ID }) {
  const node = useStore((s) => s.nodes[nodeId])
  const nodes = useStore((s) => s.nodes)
  const maps = useStore((s) => s.maps)
  const notes = useStore((s) => s.notes)
  const links = useStore((s) => s.links)
  const relationTypes = useStore((s) => s.relationTypes)
  const { updateNode, setNodeWidth, selectNode, addLink, removeLink, createNote, openNote, goToEntity, setInspectorOpen } = useStore()
  const [picker, setPicker] = useState<null | 'relation' | 'note'>(null)

  const { outgoing, incoming } = useMemo(() => linksOf(links, { kind: 'node', id: nodeId }), [links, nodeId])

  const relGroups = useMemo(() => {
    const groups = new Map<string, { link: Link; other: EntityRef; label: string }[]>()
    const push = (l: Link, other: EntityRef, label: string) => {
      if (other.kind === 'note') return
      const arr = groups.get(l.type) ?? []
      arr.push({ link: l, other, label })
      groups.set(l.type, arr)
    }
    for (const l of outgoing) push(l, { kind: l.toKind, id: l.toId }, l.label || relationTypes.find((t) => t.id === l.type)?.forward || l.type)
    for (const l of incoming) push(l, { kind: l.fromKind, id: l.fromId }, relationTypes.find((t) => t.id === l.type)?.inverse || l.label || l.type)
    return groups
  }, [outgoing, incoming, relationTypes])

  const noteLinks = useMemo(() => {
    const m = new Map<ID, { note: Note; links: Link[] }>()
    for (const l of [...outgoing, ...incoming]) {
      const other = l.fromKind === 'note' ? l.fromId : l.toKind === 'note' ? l.toId : null
      if (!other) continue
      const note = notes[other]
      if (!note) continue
      const e = m.get(other) ?? { note, links: [] }
      e.links.push(l)
      m.set(other, e)
    }
    const all = [...m.values()]
    return {
      notes: all.filter((e) => e.note.kind === 'note').sort((a, b) => b.note.updatedAt - a.note.updatedAt),
      journal: all.filter((e) => e.note.kind === 'journal').sort((a, b) => (b.note.date ?? '').localeCompare(a.note.date ?? '')),
    }
  }, [outgoing, incoming, notes])

  if (!node) return null
  const crumbs: ID[] = []
  let cur = node.parentId
  while (cur) {
    crumbs.unshift(cur)
    cur = nodes[cur]?.parentId ?? null
  }
  const kids = childrenOf(nodes, node.id)
  const hasDeps = [...outgoing, ...incoming].some((l) => DEPENDENCY_TYPES.includes(l.type) && l.fromKind === 'node' && l.toKind === 'node')

  const newNote = () => {
    const id = createNote({ title: node.text })
    addLink({ kind: 'note', id }, { kind: 'node', id: node.id }, 'about')
    openNote(id)
  }

  return (
    <>
      <div className="head">
        <div className="title-row">
          <input className="title" value={node.text} onChange={(e) => updateNode(node.id, { text: e.target.value })} placeholder="Text uzla" />
          <button className="icon-btn" title="Skryť inšpektor" onClick={() => setInspectorOpen(false)}>
            <PanelRightClose size={16} />
          </button>
        </div>
        <div className="crumbs">
          <span>{maps[node.mapId]?.title}</span>
          {crumbs.map((id) => (
            <span key={id}>
              › <button onClick={() => selectNode(id)}>{nodes[id]?.text}</button>
            </span>
          ))}
          {kids.length > 0 && <span>· {kids.length} podradených</span>}
        </div>
      </div>

      <div className="section">
        <h4>Vzhľad</h4>
        <div className="swatches">
          <button className={`swatch none ${!node.color ? 'active' : ''}`} title="Farba vetvy" onClick={() => updateNode(node.id, { color: null })} />
          {BRANCH_COLORS.map((c) => (
            <button
              key={c}
              className={`swatch ${node.color === c ? 'active' : ''}`}
              style={{ '--sc': c } as React.CSSProperties}
              onClick={() => updateNode(node.id, { color: c })}
            />
          ))}
        </div>
        <div className="icons" style={{ marginTop: 8 }}>
          {NODE_ICONS.map((ic) => (
            <button
              key={ic || 'none'}
              className={`${(node.icon ?? '') === ic ? 'active' : ''} ${ic ? '' : 'none'}`}
              onClick={() => updateNode(node.id, { icon: ic || null })}
            >
              {ic ? <NodeIcon name={ic} /> : 'bez'}
            </button>
          ))}
        </div>
        <div className="size-row" style={{ marginTop: 10 }}>
          <button className={!node.size ? 'active' : ''} title="Predvolená veľkosť mapy" onClick={() => updateNode(node.id, { size: null })}>
            auto
          </button>
          {SIZES.map((sz) => (
            <button key={sz.id} className={node.size === sz.id ? 'active' : ''} onClick={() => updateNode(node.id, { size: sz.id })}>
              {sz.label}
            </button>
          ))}
        </div>
        <div className="range-row" style={{ marginTop: 10 }}>
          <span>Šírka</span>
          <input
            type="range"
            min={MIN_NODE_WIDTH}
            max={MAX_NODE_WIDTH}
            step={4}
            value={node.width ?? MIN_NODE_WIDTH}
            onChange={(e) => setNodeWidth(node.id, Number(e.target.value))}
          />
          <span className="val">{node.width ? `${node.width}px` : 'auto'}</span>
          {node.width && (
            <button className="btn small ghost" onClick={() => updateNode(node.id, { width: null })}>
              auto
            </button>
          )}
        </div>
      </div>

      <div className="section">
        <h4>
          Vzťahy
          <button className="btn small ghost" onClick={() => setPicker(picker === 'relation' ? null : 'relation')}>
            <Plus size={13} /> pridať
          </button>
        </h4>
        {picker === 'relation' && (
          <EntityPicker
            kinds={['node']}
            exclude={{ kind: 'node', id: node.id }}
            withType
            placeholder="Cieľový uzol (aj z iných máp)…"
            onPick={(ref, type) => {
              addLink({ kind: 'node', id: node.id }, ref, type)
              setPicker(null)
            }}
            onClose={() => setPicker(null)}
          />
        )}
        {relGroups.size === 0 && !picker && <div className="empty">Žiadne vzťahy. Pridaj väzbu na iný uzol – aj v inej mape.</div>}
        {[...relGroups.entries()].map(([type, items]) => {
          const rt = relationTypes.find((t) => t.id === type)
          return (
            <div className="rel-group" key={type} style={{ '--rc': rt?.color ?? '#94a3b8' } as React.CSSProperties}>
              <div className="rel-type">{rt?.forward ?? type}</div>
              <div className="entity-list">
                {items.map(({ link, other, label }) => {
                  const otherNode = other.kind === 'node' ? nodes[other.id] : null
                  const otherMap = otherNode && otherNode.mapId !== node.mapId ? maps[otherNode.mapId]?.title : undefined
                  return (
                    <EntityItem
                      key={link.id}
                      r={other}
                      label={entityTitle({ nodes, notes, maps }, other)}
                      meta={[label, otherMap ? `mapa: ${otherMap}` : null].filter(Boolean).join(' · ')}
                      onRemove={() => removeLink(link.id)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {hasDeps && (
        <div className="section">
          <h4>Závislosti (reťazovo)</h4>
          <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 4 }}>
            <ArrowRight size={11} /> tento uzol závisí od:
          </div>
          <DependencyTree nodeId={node.id} direction="out" />
          <div style={{ fontSize: 12, color: 'var(--text-faint)', margin: '10px 0 4px' }}>
            <ArrowRight size={11} /> od tohto uzla závisí:
          </div>
          <DependencyTree nodeId={node.id} direction="in" />
        </div>
      )}

      <div className="section">
        <h4>
          Poznámky
          <span style={{ display: 'flex', gap: 4 }}>
            <button className="btn small ghost" onClick={() => setPicker(picker === 'note' ? null : 'note')}>
              prepojiť
            </button>
            <button className="btn small ghost" onClick={newNote}>
              <Plus size={13} /> nová
            </button>
          </span>
        </h4>
        {picker === 'note' && (
          <EntityPicker
            kinds={['note']}
            placeholder="Existujúca poznámka…"
            onPick={(ref) => {
              addLink(ref, { kind: 'node', id: node.id }, 'about')
              setPicker(null)
            }}
            onClose={() => setPicker(null)}
          />
        )}
        {noteLinks.notes.length === 0 && !picker && <div className="empty">Zatiaľ žiadne poznámky. Alebo napíš do poznámky [[{node.text}]].</div>}
        <div className="entity-list">
          {noteLinks.notes.map(({ note, links: ls }) => (
            <EntityItem
              key={note.id}
              r={{ kind: 'note', id: note.id }}
              label={note.title || '(bez názvu)'}
              meta={ls.some((l) => l.auto) && !ls.some((l) => !l.auto) ? 'spomína v texte' : 'priložená'}
              onRemove={ls.some((l) => !l.auto) ? () => ls.filter((l) => !l.auto).forEach((l) => removeLink(l.id)) : undefined}
            />
          ))}
        </div>
      </div>

      <div className="section">
        <h4>Denník</h4>
        {noteLinks.journal.length === 0 && <div className="empty">V denníku sa tento uzol zatiaľ nespomína. Napíš [[{node.text}]] do dnešného zápisu.</div>}
        <div className="entity-list">
          {noteLinks.journal.map(({ note }) => (
            <EntityItem
              key={note.id}
              r={{ kind: 'note', id: note.id }}
              label={formatDateShort(note.date!)}
              meta={note.body.replace(/\s+/g, ' ').slice(0, 70)}
            />
          ))}
        </div>
      </div>

      {node.parentId === null && (
        <div className="section">
          <button className="btn ghost small" onClick={() => goToEntity({ kind: 'node', id: node.id })}>
            <ExternalLink size={13} /> vycentrovať koreň
          </button>
        </div>
      )}
    </>
  )
}

function MapInspector({ mapId }: { mapId: ID }) {
  const map = useStore((s) => s.maps[mapId])
  const nodes = useStore((s) => s.nodes)
  const links = useStore((s) => s.links)
  const notes = useStore((s) => s.notes)
  const relationTypes = useStore((s) => s.relationTypes)
  const showRelations = useStore((s) => s.showRelations)
  const { setShowRelations, setInspectorOpen, exportAll, deleteMap, ask, setDefaultNodeSize, setNodeMaxWidth } = useStore()
  const defaultNodeSize = useStore((s) => s.defaultNodeSize)
  const nodeMaxWidth = useStore((s) => s.nodeMaxWidth)
  const stats = useMemo(() => {
    const ids = new Set(
      Object.values(nodes)
        .filter((n) => n.mapId === mapId)
        .map((n) => n.id),
    )
    const rel = new Map<string, number>()
    let noteIds = new Set<ID>()
    for (const l of Object.values(links)) {
      const a = l.fromKind === 'node' && ids.has(l.fromId)
      const b = l.toKind === 'node' && ids.has(l.toId)
      if (a && l.toKind === 'node' && b) rel.set(l.type, (rel.get(l.type) ?? 0) + 1)
      else if ((a || b) && (l.fromKind === 'note' || l.toKind === 'note')) noteIds.add(l.fromKind === 'note' ? l.fromId : l.toId)
    }
    noteIds = new Set([...noteIds].filter((id) => notes[id]))
    return { nodeCount: ids.size, rel, noteCount: noteIds.size }
  }, [nodes, links, notes, mapId])
  if (!map) return null
  return (
    <>
      <div className="head">
        <div className="title-row">
          <div className="title-static" style={{ display: 'flex', alignItems: 'center' }}>
            {map.title}
          </div>
          <button className="icon-btn" title="Skryť inšpektor" onClick={() => setInspectorOpen(false)}>
            <PanelRightClose size={16} />
          </button>
        </div>
        <div className="crumbs">Vyber uzol a uvidíš jeho vzťahy, závislosti a poznámky.</div>
      </div>
      <div className="section">
        <div className="stats">
          <div className="stat">
            <b>{stats.nodeCount}</b>
            <span>uzlov</span>
          </div>
          <div className="stat">
            <b>{[...stats.rel.values()].reduce((a, b) => a + b, 0)}</b>
            <span>vzťahov</span>
          </div>
          <div className="stat">
            <b>{stats.noteCount}</b>
            <span>prepojených poznámok</span>
          </div>
          <div className="stat">
            <b>{new Date(map.updatedAt).toLocaleDateString('sk-SK')}</b>
            <span>posledná zmena</span>
          </div>
        </div>
      </div>
      <div className="section">
        <h4>Uzly</h4>
        <div className="size-row">
          {SIZES.map((sz) => (
            <button key={sz.id} className={defaultNodeSize === sz.id ? 'active' : ''} onClick={() => setDefaultNodeSize(sz.id)}>
              {sz.label}
            </button>
          ))}
        </div>
        <div className="range-row" style={{ marginTop: 10 }}>
          <span>Zalamovať od</span>
          <input type="range" min={120} max={600} step={10} value={nodeMaxWidth} onChange={(e) => setNodeMaxWidth(Number(e.target.value))} />
          <span className="val">{nodeMaxWidth}px</span>
          {nodeMaxWidth !== DEFAULT_MAX_TEXT_WIDTH && (
            <button className="btn small ghost" onClick={() => setNodeMaxWidth(DEFAULT_MAX_TEXT_WIDTH)}>
              reset
            </button>
          )}
        </div>
        <div className="empty" style={{ marginTop: 6 }}>
          Veľkosť textu a šírka zalamovania pre uzly bez vlastného nastavenia. Šírku jedného uzla zmeníš ťahaním jeho okraja.
        </div>
      </div>
      <div className="section">
        <h4>Vzťahy na plátne</h4>
        <label className="toggle" style={{ marginBottom: 10 }}>
          <input type="checkbox" checked={showRelations} onChange={(e) => setShowRelations(e.target.checked)} /> kresliť vzťahy medzi uzlami
        </label>
        <div className="legend">
          {relationTypes
            .filter((t) => t.id !== 'mentions' && t.id !== 'about')
            .map((t) => (
              <div className="row" key={t.id}>
                <span className="dot" style={{ background: t.color }} />
                <span>
                  {t.forward}
                  {t.directed && t.inverse !== t.forward ? ` / ${t.inverse}` : ''}
                </span>
                <span className="n">{stats.rel.get(t.id) ?? 0}</span>
              </div>
            ))}
        </div>
      </div>
      <div className="section">
        <h4>Správa</h4>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="btn small" onClick={() => exportBackup(exportAll())}>
            Zálohovať všetko (JSON)
          </button>
          <button
            className="btn small"
            style={{ color: 'var(--danger)' }}
            onClick={async () => (await ask(`Naozaj zmazať mapu „${map.title}“ aj so všetkými uzlami?`)) && deleteMap(map.id)}
          >
            Zmazať mapu
          </button>
        </div>
      </div>
    </>
  )
}

export function Inspector({ mapId }: { mapId: ID }) {
  const selectedNodeId = useStore((s) => s.selectedNodeId)
  const node = useStore((s) => (selectedNodeId ? s.nodes[selectedNodeId] : undefined))
  return <aside className="inspector">{node && node.mapId === mapId ? <NodeInspector nodeId={node.id} /> : <MapInspector mapId={mapId} />}</aside>
}
