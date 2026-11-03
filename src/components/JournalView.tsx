import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../lib/store'
import { formatDateShort, shiftDate, todayISO } from '../lib/ids'
import { NoteEditor, noteExcerpt } from './NoteEditor'

export function JournalView({ date }: { date: string }) {
  const notes = useStore((s) => s.notes)
  const { openJournal, getOrCreateJournal, deleteNote } = useStore()
  const entry = useMemo(() => Object.values(notes).find((n) => n.kind === 'journal' && n.date === date), [notes, date])
  const entries = useMemo(
    () =>
      Object.values(notes)
        .filter((n) => n.kind === 'journal' && n.date)
        .sort((a, b) => b.date!.localeCompare(a.date!)),
    [notes],
  )
  const today = todayISO()

  return (
    <div className="notes-layout">
      <div className="notes-list">
        <div className="top journal-nav">
          <button className="icon-btn" onClick={() => openJournal(shiftDate(date, -1))} title="Predchádzajúci deň">
            <ChevronLeft size={16} />
          </button>
          <input type="date" value={date} onChange={(e) => e.target.value && openJournal(e.target.value)} />
          <button className="icon-btn" onClick={() => openJournal(shiftDate(date, 1))} title="Nasledujúci deň">
            <ChevronRight size={16} />
          </button>
          <button className="btn small ghost" onClick={() => openJournal(today)} disabled={date === today}>
            Dnes
          </button>
        </div>
        <div className="items">
          {entries.map((n) => (
            <button key={n.id} className={`note-row ${n.date === date ? 'active' : ''}`} onClick={() => openJournal(n.date!)}>
              <div className="t">
                {formatDateShort(n.date!)}
                {n.date === today ? ' · dnes' : ''}
              </div>
              <div className="p">{noteExcerpt(n) || '…'}</div>
            </button>
          ))}
          {entries.length === 0 && (
            <div className="empty" style={{ padding: 8 }}>
              Denník je zatiaľ prázdny.
            </div>
          )}
        </div>
      </div>
      {entry ? (
        <NoteEditor
          note={entry}
          onDelete={() => {
            if (confirm('Zmazať tento zápis v denníku?')) deleteNote(entry.id)
          }}
        />
      ) : (
        <div className="empty-state">
          <div>
            <h2>{formatDateShort(date)}</h2>
            <p>Pre tento deň zatiaľ nie je žiadny zápis.</p>
            <button className="btn primary" onClick={() => getOrCreateJournal(date)}>
              Začať písať
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
