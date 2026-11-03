import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '../lib/store'
import { NoteEditor, noteExcerpt } from './NoteEditor'
import type { ID } from '../lib/types'

export function NotesView({ noteId }: { noteId: ID | null }) {
  const notes = useStore((s) => s.notes)
  const { openNote, createNote, deleteNote, ask } = useStore()
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const ql = q.trim().toLowerCase()
    return Object.values(notes)
      .filter((n) => n.kind === 'note')
      .filter((n) => !ql || n.title.toLowerCase().includes(ql) || n.body.toLowerCase().includes(ql) || n.tags.some((t) => t.toLowerCase().includes(ql)))
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }, [notes, q])
  const note = noteId ? notes[noteId] : null

  return (
    <div className="notes-layout">
      <div className="notes-list">
        <div className="top">
          <input placeholder="Hľadať v poznámkach…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn primary small" title="Nová poznámka" onClick={() => openNote(createNote())}>
            <Plus size={14} />
          </button>
        </div>
        <div className="items">
          {list.map((n) => (
            <button key={n.id} className={`note-row ${n.id === noteId ? 'active' : ''}`} onClick={() => openNote(n.id)}>
              <div className={`t ${n.title ? '' : 'untitled'}`}>{n.title || 'Bez názvu'}</div>
              <div className="p">{noteExcerpt(n) || '…'}</div>
              <div className="d">
                {new Date(n.updatedAt).toLocaleDateString('sk-SK')}
                {n.tags.length > 0 && ' · ' + n.tags.map((t) => '#' + t).join(' ')}
              </div>
            </button>
          ))}
          {list.length === 0 && (
            <div className="empty" style={{ padding: 8 }}>
              Žiadne poznámky.
            </div>
          )}
        </div>
      </div>
      {note ? (
        <NoteEditor
          note={note}
          onDelete={async () => {
            if (await ask(`Zmazať poznámku „${note.title || 'bez názvu'}“?`)) deleteNote(note.id)
          }}
        />
      ) : (
        <div className="empty-state">
          <div>
            <h2>Poznámky</h2>
            <p>Vyber poznámku vľavo alebo vytvor novú. Odkaz na uzol mapy vložíš cez [[názov uzla]].</p>
            <button className="btn primary" onClick={() => openNote(createNote())}>
              <Plus size={14} /> Nová poznámka
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
