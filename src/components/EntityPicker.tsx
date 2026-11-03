import { useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Calendar, Circle } from 'lucide-react'
import { useStore } from '../lib/store'
import type { EntityKind, EntityRef } from '../lib/types'
import { formatDateShort } from '../lib/ids'

export interface PickerResult {
  ref: EntityRef
  title: string
  meta: string
  kind: EntityKind
  isJournal: boolean
}

export function useEntitySearch(query: string, kinds: EntityKind[], exclude?: EntityRef, limit = 30): PickerResult[] {
  const nodes = useStore((s) => s.nodes)
  const notes = useStore((s) => s.notes)
  const maps = useStore((s) => s.maps)
  return useMemo(() => {
    const q = query.trim().toLowerCase()
    const out: PickerResult[] = []
    if (kinds.includes('node')) {
      for (const n of Object.values(nodes)) {
        if (exclude?.kind === 'node' && exclude.id === n.id) continue
        if (q && !n.text.toLowerCase().includes(q)) continue
        out.push({ ref: { kind: 'node', id: n.id }, title: n.text || '(bez názvu)', meta: maps[n.mapId]?.title ?? '', kind: 'node', isJournal: false })
      }
    }
    if (kinds.includes('note')) {
      for (const n of Object.values(notes)) {
        if (exclude?.kind === 'note' && exclude.id === n.id) continue
        const title = n.kind === 'journal' && n.date ? formatDateShort(n.date) : n.title
        if (q && !title.toLowerCase().includes(q) && !(n.date ?? '').includes(q) && !n.body.toLowerCase().includes(q)) continue
        out.push({
          ref: { kind: 'note', id: n.id },
          title: title || '(bez názvu)',
          meta: n.kind === 'journal' ? 'denník' : 'poznámka',
          kind: 'note',
          isJournal: n.kind === 'journal',
        })
      }
    }
    out.sort((a, b) => {
      const as = a.title.toLowerCase().startsWith(q) ? 0 : 1
      const bs = b.title.toLowerCase().startsWith(q) ? 0 : 1
      return as - bs || a.title.localeCompare(b.title)
    })
    return out.slice(0, limit)
  }, [query, kinds, exclude, nodes, notes, maps, limit])
}

export function KindIcon({ r }: { r: Pick<PickerResult, 'kind' | 'isJournal'> }) {
  if (r.kind === 'node') return <Circle size={13} />
  return r.isJournal ? <Calendar size={13} /> : <BookOpen size={13} />
}

interface Props {
  kinds: EntityKind[]
  exclude?: EntityRef
  /** when true, the picker also asks for a relation type */
  withType?: boolean
  placeholder?: string
  onPick: (ref: EntityRef, type: string) => void
  onClose: () => void
}

export function EntityPicker({ kinds, exclude, withType, placeholder, onPick, onClose }: Props) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const [type, setType] = useState('relates_to')
  const [newType, setNewType] = useState(false)
  const [fwd, setFwd] = useState('')
  const [inv, setInv] = useState('')
  const [color, setColor] = useState('#14b8a6')
  const relationTypes = useStore((s) => s.relationTypes)
  const addRelationType = useStore((s) => s.addRelationType)
  const inputRef = useRef<HTMLInputElement>(null)
  const results = useEntitySearch(q, kinds, exclude)

  useEffect(() => inputRef.current?.focus(), [])
  useEffect(() => setActive(0), [q])

  const pick = (r: PickerResult) => {
    let t = type
    if (withType && newType) {
      if (!fwd.trim()) return
      t = addRelationType(fwd.trim(), inv.trim() || undefined, color, true)
    }
    onPick(r.ref, t)
  }

  return (
    <div className="picker" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      {withType && (
        <div className="row">
          <select
            value={newType ? '__new' : type}
            onChange={(e) => {
              if (e.target.value === '__new') setNewType(true)
              else {
                setNewType(false)
                setType(e.target.value)
              }
            }}
          >
            {relationTypes
              .filter((t) => t.id !== 'mentions')
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.forward}
                  {t.directed ? ' →' : ' ↔'}
                </option>
              ))}
            <option value="__new">+ nový typ vzťahu…</option>
          </select>
        </div>
      )}
      {withType && newType && (
        <div className="new-type">
          <input type="text" placeholder="názov (napr. inšpiruje)" value={fwd} onChange={(e) => setFwd(e.target.value)} />
          <input type="text" placeholder="opačný smer (voliteľné)" value={inv} onChange={(e) => setInv(e.target.value)} />
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} title="Farba" />
        </div>
      )}
      <div className="row">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder ?? 'Hľadať uzol alebo poznámku…'}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(a + 1, results.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(a - 1, 0))
            } else if (e.key === 'Enter' && results[active]) {
              e.preventDefault()
              pick(results[active])
            }
          }}
        />
        <button className="btn small ghost" onClick={onClose}>
          Zrušiť
        </button>
      </div>
      <div className="results">
        {results.length === 0 && <div className="empty">Nič sa nenašlo.</div>}
        {results.map((r, i) => (
          <button key={`${r.kind}:${r.ref.id}`} className={`result ${i === active ? 'active' : ''}`} onMouseEnter={() => setActive(i)} onClick={() => pick(r)}>
            <span className="kind">
              <KindIcon r={r} />
            </span>
            <span className="name">{r.title}</span>
            <span className="meta">{r.meta}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
