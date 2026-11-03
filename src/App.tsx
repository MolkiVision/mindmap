import { useEffect, useState } from 'react'
import { useStore } from './lib/store'
import { Sidebar } from './components/Sidebar'
import { MapView } from './components/MapView'
import { Inspector } from './components/Inspector'
import { NotesView } from './components/NotesView'
import { JournalView } from './components/JournalView'
import { CommandPalette } from './components/CommandPalette'
import { HelpDialog } from './components/HelpDialog'

export default function App() {
  const loaded = useStore((s) => s.loaded)
  const view = useStore((s) => s.view)
  const theme = useStore((s) => s.theme)
  const inspectorOpen = useStore((s) => s.inspectorOpen)
  const paletteOpen = useStore((s) => s.paletteOpen)
  const { load, setPaletteOpen } = useStore()
  const [help, setHelp] = useState(false)

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(!useStore.getState().paletteOpen)
      } else if (e.key === 'Escape' && help) setHelp(false)
      else if (e.key === '?' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        setHelp((h) => !h)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setPaletteOpen, help])

  useEffect(() => {
    const onHash = () => {
      const h = location.hash
      const s = useStore.getState()
      const m = h.match(/^#\/map\/([a-z0-9]+)(?:\/node\/([a-z0-9]+))?/)
      if (m && s.maps[m[1]]) {
        if (s.view.kind !== 'map' || s.view.mapId !== m[1] || (m[2] && m[2] !== s.selectedNodeId)) s.goToMap(m[1], m[2] ?? null)
        return
      }
      const n = h.match(/^#\/note\/([a-z0-9]+)/)
      if (n && s.notes[n[1]] && !(s.view.kind === 'notes' && s.view.noteId === n[1])) s.openNote(n[1])
      const j = h.match(/^#\/journal\/(\d{4}-\d{2}-\d{2})/)
      if (j && !(s.view.kind === 'journal' && s.view.date === j[1])) s.openJournal(j[1])
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (!loaded) return <div className="loading">Načítavam…</div>

  const showInspector = view.kind === 'map' && inspectorOpen
  return (
    <div className={`app ${showInspector ? 'inspector-open' : ''}`}>
      <Sidebar onHelp={() => setHelp(true)} />
      <main className="main">
        {view.kind === 'map' && <MapView key={view.mapId} mapId={view.mapId} onHelp={() => setHelp(true)} />}
        {view.kind === 'notes' && <NotesView noteId={view.noteId} />}
        {view.kind === 'journal' && <JournalView date={view.date} />}
      </main>
      {showInspector && <Inspector mapId={view.mapId} />}
      {paletteOpen && <CommandPalette />}
      {help && <HelpDialog onClose={() => setHelp(false)} />}
    </div>
  )
}
