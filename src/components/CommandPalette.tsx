import { useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, Map as MapIcon, Plus } from 'lucide-react'
import { useStore } from '../lib/store'
import { todayISO } from '../lib/ids'
import { KindIcon, useEntitySearch } from './EntityPicker'

interface Item {
  key: string
  group: string
  icon: React.ReactNode
  title: string
  meta?: string
  run: () => void
}

export function CommandPalette() {
  const open = useStore((s) => s.paletteOpen)
  const maps = useStore((s) => s.maps)
  const { setPaletteOpen, goToMap, goToEntity, createMap, createNote, openNote, openJournal } = useStore()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLInputElement>(null)
  const entities = useEntitySearch(q, ['node', 'note'], undefined, 40)

  useEffect(() => {
    if (open) {
      setQ('')
      setActive(0)
      setTimeout(() => ref.current?.focus(), 10)
    }
  }, [open])
  useEffect(() => setActive(0), [q])

  const items = useMemo<Item[]>(() => {
    const ql = q.trim().toLowerCase()
    const out: Item[] = []
    const actions: Item[] = [
      {
        key: 'a-map',
        group: 'Akcie',
        icon: <Plus size={14} />,
        title: 'Nová mapa',
        run: () => goToMap(createMap(ql && !/^nov/.test(ql) ? q.trim() : 'Nová mapa')),
      },
      {
        key: 'a-note',
        group: 'Akcie',
        icon: <Plus size={14} />,
        title: 'Nová poznámka',
        run: () => openNote(createNote({ title: ql && !/^nov/.test(ql) ? q.trim() : '' })),
      },
      { key: 'a-journal', group: 'Akcie', icon: <Calendar size={14} />, title: 'Dnešný zápis v denníku', run: () => openJournal(todayISO()) },
    ]
    for (const m of Object.values(maps)) {
      if (ql && !m.title.toLowerCase().includes(ql)) continue
      out.push({ key: 'm-' + m.id, group: 'Mapy', icon: <MapIcon size={14} />, title: m.title, run: () => goToMap(m.id) })
    }
    for (const e of entities) {
      out.push({
        key: `${e.kind}-${e.ref.id}`,
        group: e.kind === 'node' ? 'Uzly' : e.isJournal ? 'Denník' : 'Poznámky',
        icon: <KindIcon r={e} />,
        title: e.title,
        meta: e.meta,
        run: () => goToEntity(e.ref),
      })
    }
    const filteredActions = actions.filter((a) => !ql || a.title.toLowerCase().includes(ql) || a.key !== 'a-journal')
    const order = ['Akcie', 'Mapy', 'Uzly', 'Poznámky', 'Denník']
    const grouped = (items: Item[]) => [...items].sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group))
    return (ql ? [...grouped(out), ...filteredActions] : [...filteredActions, ...grouped(out)]).slice(0, 60)
  }, [q, maps, entities, goToMap, createMap, openNote, createNote, openJournal, goToEntity])

  if (!open) return null
  const close = () => setPaletteOpen(false)
  const run = (it: Item) => {
    close()
    it.run()
  }
  let lastGroup = ''
  return (
    <div className="overlay" onMouseDown={close}>
      <div className="palette" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={ref}
          placeholder="Hľadať alebo vytvoriť"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') close()
            else if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(a + 1, items.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(a - 1, 0))
            } else if (e.key === 'Enter' && items[active]) run(items[active])
          }}
        />
        <div className="results">
          {items.map((it, i) => {
            const header = it.group !== lastGroup ? <div className="group">{it.group}</div> : null
            lastGroup = it.group
            return (
              <div key={it.key}>
                {header}
                <button className={`result ${i === active ? 'active' : ''}`} onMouseEnter={() => setActive(i)} onClick={() => run(it)}>
                  <span className="kind">{it.icon}</span>
                  <span className="name">{it.title}</span>
                  {it.meta && <span className="meta">{it.meta}</span>}
                </button>
              </div>
            )
          })}
          {items.length === 0 && (
            <div className="empty" style={{ padding: 12 }}>
              Nič sa nenašlo.
            </div>
          )}
        </div>
        <div className="foot">
          <span>
            <kbd>↑↓</kbd> výber
          </span>
          <span>
            <kbd>Enter</kbd> otvoriť
          </span>
          <span>
            <kbd>Esc</kbd> zavrieť
          </span>
        </div>
      </div>
    </div>
  )
}
