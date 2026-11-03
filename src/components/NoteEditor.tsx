import { useEffect, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'
import { Eye, Pencil, Plus, Trash2, X } from 'lucide-react'
import { entityTitle, linksOf, useStore } from '../lib/store'
import { normalizeTitle } from '../lib/wiki'
import { formatDate } from '../lib/ids'
import type { EntityRef, ID, Note } from '../lib/types'
import { EntityPicker, KindIcon, useEntitySearch } from './EntityPicker'

marked.setOptions({ gfm: true, breaks: true })

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Resolver used by the wiki-link renderer; set right before parsing. */
let currentResolve: (title: string) => EntityRef | null = () => null

marked.use({
  extensions: [
    {
      name: 'wikilink',
      level: 'inline',
      start(src: string) {
        const i = src.indexOf('[[')
        return i < 0 ? undefined : i
      },
      tokenizer(src: string) {
        const m = /^\[\[([^\]\n]+?)\]\]/.exec(src)
        if (m) return { type: 'wikilink', raw: m[0], title: m[1].trim() }
        return undefined
      },
      renderer(token) {
        const t = token.title as string
        const r = currentResolve(t)
        if (!r) return `<span class="wiki-link missing">${escapeHtml(t)}</span>`
        return `<a class="wiki-link" data-kind="${r.kind}" data-id="${r.id}" href="#">${escapeHtml(t)}</a>`
      },
    },
  ],
})

/** Autocomplete for [[wiki links]] inside the textarea. */
function useWikiAutocomplete(textareaRef: React.RefObject<HTMLTextAreaElement | null>, value: string, setValue: (v: string) => void) {
  const [q, setQ] = useState<string | null>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [active, setActive] = useState(0)
  const results = useEntitySearch(q ?? '', ['node', 'note'], undefined, 8)

  const check = () => {
    const el = textareaRef.current
    if (!el) return setQ(null)
    const caret = el.selectionStart
    const before = value.slice(0, caret)
    const m = before.match(/\[\[([^\]\n]*)$/)
    if (!m) return setQ(null)
    setQ(m[1])
    // approximate position: below the caret line
    const lines = before.split('\n').length
    const lh = 23
    setPos({ top: Math.min(lines * lh + 24, el.clientHeight - 20), left: 24 })
  }

  const insert = (title: string) => {
    const el = textareaRef.current
    if (!el) return
    const caret = el.selectionStart
    const before = value.slice(0, caret).replace(/\[\[([^\]\n]*)$/, '')
    const afterRaw = value.slice(caret)
    const after = afterRaw.startsWith(']]') ? afterRaw.slice(2) : afterRaw
    const next = `${before}[[${title}]]${after}`
    setValue(next)
    setQ(null)
    requestAnimationFrame(() => {
      el.focus()
      const p = before.length + title.length + 4
      el.setSelectionRange(p, p)
    })
  }

  useEffect(() => setActive(0), [q])
  return { q, pos, results, active, setActive, check, insert, close: () => setQ(null) }
}

export function NoteEditor({ note, onDelete }: { note: Note; onDelete?: () => void }) {
  const { updateNote, goToEntity, addLink, removeLink } = useStore()
  const nodes = useStore((s) => s.nodes)
  const notes = useStore((s) => s.notes)
  const maps = useStore((s) => s.maps)
  const links = useStore((s) => s.links)
  const [mode, setMode] = useState<'edit' | 'preview'>(note.body ? 'preview' : 'edit')
  const [body, setBody] = useState(note.body)
  const [picker, setPicker] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)
  const ac = useWikiAutocomplete(ref, body, setBody)

  // reset local state when switching notes
  useEffect(() => {
    setBody(note.body)
    setMode(note.body ? 'preview' : 'edit')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id])

  // debounced save
  useEffect(() => {
    if (body === note.body) return
    const t = setTimeout(() => updateNote(note.id, { body }), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body])

  const resolve = useMemo(() => {
    const byTitle = new Map<string, EntityRef>()
    for (const n of Object.values(nodes)) byTitle.set(normalizeTitle(n.text), { kind: 'node', id: n.id })
    for (const n of Object.values(notes)) if (n.id !== note.id) byTitle.set(normalizeTitle(n.title), { kind: 'note', id: n.id })
    return (t: string) => byTitle.get(normalizeTitle(t)) ?? null
  }, [nodes, notes, note.id])

  const html = useMemo(() => {
    if (mode !== 'preview') return ''
    currentResolve = resolve
    return marked.parse(body) as string
  }, [body, mode, resolve])

  const { outgoing, incoming } = useMemo(() => linksOf(links, { kind: 'note', id: note.id }), [links, note.id])
  const attached = outgoing.filter((l) => !l.auto && l.toKind === 'node')
  const mentioned = outgoing.filter((l) => l.auto)
  const backlinks = incoming

  return (
    <div className="note-editor">
      <div className="bar">
        <button className={`btn small ${mode === 'edit' ? 'primary' : 'ghost'}`} onClick={() => setMode('edit')}>
          <Pencil size={13} /> Písať
        </button>
        <button className={`btn small ${mode === 'preview' ? 'primary' : 'ghost'}`} onClick={() => setMode('preview')}>
          <Eye size={13} /> Náhľad
        </button>
        <span className="spacer" />
        <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
          uložené {new Date(note.updatedAt).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}
        </span>
        {onDelete && (
          <button className="icon-btn danger" title="Zmazať poznámku" onClick={onDelete}>
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div className="body">
        {note.kind === 'journal' ? (
          <div className="date-title">{formatDate(note.date!)}</div>
        ) : (
          <input className="ntitle" placeholder="Názov poznámky" value={note.title} onChange={(e) => updateNote(note.id, { title: e.target.value })} />
        )}
        <div className="tags-input">
          {note.tags.map((t) => (
            <span className="chip" key={t}>
              <span className="n">#{t}</span>
              <button className="x" onClick={() => updateNote(note.id, { tags: note.tags.filter((x) => x !== t) })}>
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            placeholder="+ tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                e.preventDefault()
                const t = tagInput.trim().replace(/^#/, '')
                if (!note.tags.includes(t)) updateNote(note.id, { tags: [...note.tags, t] })
                setTagInput('')
              }
            }}
          />
        </div>
        {mode === 'edit' ? (
          <div className="editor-wrap">
            <textarea
              ref={ref}
              value={body}
              placeholder={'Píš v Markdowne. Napíš [[ a vyber uzol alebo poznámku, na ktorú chceš odkázať.'}
              onChange={(e) => {
                setBody(e.target.value)
                requestAnimationFrame(ac.check)
              }}
              onKeyUp={(e) => {
                if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) ac.check()
              }}
              onClick={ac.check}
              onKeyDown={(e) => {
                if (ac.q === null) return
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  ac.setActive((a) => Math.min(a + 1, ac.results.length - 1))
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  ac.setActive((a) => Math.max(a - 1, 0))
                } else if (e.key === 'Enter' || e.key === 'Tab') {
                  if (ac.results[ac.active]) {
                    e.preventDefault()
                    ac.insert(ac.results[ac.active].title)
                  }
                } else if (e.key === 'Escape') ac.close()
              }}
              onBlur={() => setTimeout(ac.close, 150)}
            />
            {ac.q !== null && ac.results.length > 0 && (
              <div className="autocomplete" style={{ top: ac.pos.top, left: ac.pos.left }}>
                {ac.results.map((r, i) => (
                  <button
                    key={`${r.kind}:${r.ref.id}`}
                    className={i === ac.active ? 'active' : ''}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => ac.insert(r.title)}
                  >
                    <KindIcon r={r} />
                    {r.title}
                    <span className="meta">{r.meta}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            className="preview"
            dangerouslySetInnerHTML={{ __html: html || '<p style="color:var(--text-faint)">Prázdna poznámka. Klikni na „Písať“.</p>' }}
            onClick={(e) => {
              const a = (e.target as HTMLElement).closest('a.wiki-link') as HTMLElement | null
              if (!a) return
              e.preventDefault()
              goToEntity({ kind: a.dataset.kind as 'node' | 'note', id: a.dataset.id! })
            }}
            onDoubleClick={() => setMode('edit')}
          />
        )}

        <div className="note-links">
          <div>
            <h4>
              Priložené k uzlom
              <button className="btn small ghost" onClick={() => setPicker(!picker)}>
                <Plus size={12} /> prepojiť
              </button>
            </h4>
            {picker && (
              <EntityPicker
                kinds={['node']}
                placeholder="Uzol v ľubovoľnej mape…"
                onPick={(ref) => {
                  addLink({ kind: 'note', id: note.id }, ref, 'about')
                  setPicker(false)
                }}
                onClose={() => setPicker(false)}
              />
            )}
            <div className="chips" style={{ marginTop: picker ? 8 : 0 }}>
              {attached.length === 0 && !picker && <span className="empty">Poznámka nie je priložená k žiadnemu uzlu.</span>}
              {attached.map((l) => (
                <Chip key={l.id} r={{ kind: 'node', id: l.toId }} onRemove={() => removeLink(l.id)} />
              ))}
            </div>
          </div>
          <div>
            <h4>Spomína ([[odkazy]])</h4>
            <div className="chips">
              {mentioned.length === 0 && <span className="empty">Žiadne odkazy v texte.</span>}
              {mentioned.map((l) => (
                <Chip key={l.id} r={{ kind: l.toKind, id: l.toId }} />
              ))}
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <h4>Odkazuje sem</h4>
            <div className="chips">
              {backlinks.length === 0 && <span className="empty">Nič sa na túto poznámku neodkazuje.</span>}
              {backlinks.map((l) => (
                <Chip key={l.id} r={{ kind: l.fromKind, id: l.fromId }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  function Chip({ r, onRemove }: { r: EntityRef; onRemove?: () => void }) {
    const title = entityTitle({ nodes, notes, maps }, r)
    const meta = r.kind === 'node' ? maps[nodes[r.id]?.mapId]?.title : notes[r.id]?.kind === 'journal' ? 'denník' : 'poznámka'
    const isJournal = r.kind === 'note' && notes[r.id]?.kind === 'journal'
    return (
      <span className="chip">
        <KindIcon r={{ kind: r.kind, isJournal }} />
        <span className="n" onClick={() => goToEntity(r)}>
          {title}
        </span>
        {meta && <span className="m">{meta}</span>}
        {onRemove && (
          <button className="x" onClick={onRemove} title="Odpojiť">
            <X size={11} />
          </button>
        )}
      </span>
    )
  }
}

export function noteExcerpt(n: Note, len = 60): string {
  return n.body
    .replace(/[#*_`>\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, len)
}

export type { ID }
