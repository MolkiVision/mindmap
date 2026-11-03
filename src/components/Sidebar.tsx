import { useRef } from 'react'
import { BookOpen, Calendar, Download, FileInput, HelpCircle, Map as MapIcon, Moon, PanelLeftClose, Plus, Search, Sun, Trash2, Upload } from 'lucide-react'
import { parseOutline } from '../lib/export'
import type { MapPackage } from '../lib/types'
import { useStore } from '../lib/store'
import { todayISO } from '../lib/ids'
import { exportBackup } from '../lib/export'
import type { Backup } from '../lib/types'

export function Sidebar({ onHelp }: { onHelp: () => void }) {
  const maps = useStore((s) => s.maps)
  const notes = useStore((s) => s.notes)
  const view = useStore((s) => s.view)
  const theme = useStore((s) => s.theme)
  const {
    goToMap,
    setView,
    createMap,
    deleteMap,
    setPaletteOpen,
    setTheme,
    exportAll,
    importAll,
    importMapPackage,
    importOutline,
    ask,
    notify,
    setEditing,
    setSidebarOpen,
  } = useStore()
  const mapFileRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const mapList = Object.values(maps).sort((a, b) => b.updatedAt - a.updatedAt)
  const noteCount = Object.values(notes).filter((n) => n.kind === 'note').length
  const journalCount = Object.values(notes).filter((n) => n.kind === 'journal').length

  const onImport = async (file: File) => {
    try {
      const b = JSON.parse(await file.text()) as Backup
      if (!b.maps || !b.nodes) throw new Error('bad')
      if (await ask('Import nahradí všetky súčasné dáta. Pokračovať?')) await importAll(b)
    } catch {
      await notify('Súbor sa nepodarilo načítať. Očakávam JSON zálohu z tejto aplikácie.')
    }
  }

  const onImportMap = async (file: File) => {
    const text = await file.text()
    let id: string | null = null
    if (file.name.endsWith('.json')) {
      try {
        id = importMapPackage(JSON.parse(text) as MapPackage)
      } catch {
        id = null
      }
    } else {
      const o = parseOutline(text)
      if (o.items.length) id = importOutline(o.title || file.name.replace(/\.[^.]+$/, ''), o.items)
    }
    if (id) goToMap(id)
    else await notify('Súbor sa nepodarilo načítať. Očakávam mapu vo formáte JSON z tejto aplikácie alebo Markdown osnovu.')
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="logo">
          <MapIcon size={15} />
        </span>
        <span className="brand-name">Mapa myšlienok</span>
        <button className="icon-btn" title="Zasunúť panel (Ctrl+B)" onClick={() => setSidebarOpen(false)}>
          <PanelLeftClose size={16} />
        </button>
      </div>
      <button className="search-btn" onClick={() => setPaletteOpen(true)}>
        <Search size={14} /> Hľadať <kbd>Ctrl K</kbd>
      </button>
      <div className="scroll">
        <div className="section-title">
          Mapy
          <span style={{ display: 'flex', gap: 2 }}>
            <button title="Importovať mapu (JSON alebo Markdown osnova)" onClick={() => mapFileRef.current?.click()}>
              <FileInput size={14} />
            </button>
            <input
              ref={mapFileRef}
              type="file"
              accept=".json,.md,.markdown,.txt,application/json,text/markdown"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void onImportMap(f)
                e.target.value = ''
              }}
            />
            <button
              title="Nová mapa"
              onClick={(e) => {
                e.currentTarget.blur()
                const id = createMap('Nová mapa')
                goToMap(id)
                const root = useStore.getState().maps[id]?.rootId
                if (root) setEditing(root)
              }}
            >
              <Plus size={14} />
            </button>
          </span>
        </div>
        {mapList.map((m) => (
          <div
            key={m.id}
            className={`nav-item ${view.kind === 'map' && view.mapId === m.id ? 'active' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => goToMap(m.id)}
            onKeyDown={(e) => e.key === 'Enter' && goToMap(m.id)}
          >
            <MapIcon size={14} />
            <span className="label">{m.title}</span>
            <button
              className="icon-btn danger"
              style={{ width: 22, height: 22 }}
              title="Zmazať mapu"
              onClick={async (e) => {
                e.stopPropagation()
                if (await ask(`Zmazať mapu „${m.title}“ aj so všetkými uzlami?`)) deleteMap(m.id)
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {mapList.length === 0 && (
          <div className="empty" style={{ padding: '4px 8px' }}>
            Žiadne mapy. Vytvor prvú cez +.
          </div>
        )}

        <div className="section-title">Zápisky</div>
        <button
          className={`nav-item ${view.kind === 'notes' ? 'active' : ''}`}
          onClick={() => setView({ kind: 'notes', noteId: view.kind === 'notes' ? view.noteId : null })}
        >
          <BookOpen size={14} />
          <span className="label">Poznámky</span>
          <span className="count">{noteCount}</span>
        </button>
        <button className={`nav-item ${view.kind === 'journal' ? 'active' : ''}`} onClick={() => setView({ kind: 'journal', date: todayISO() })}>
          <Calendar size={14} />
          <span className="label">Denník</span>
          <span className="count">{journalCount}</span>
        </button>
      </div>
      <div className="footer">
        <button className="icon-btn" title={theme === 'dark' ? 'Svetlý režim' : 'Tmavý režim'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="icon-btn" title="Zálohovať všetko (JSON)" onClick={() => exportBackup(exportAll())}>
          <Download size={16} />
        </button>
        <button className="icon-btn" title="Obnoviť zo zálohy (JSON)" onClick={() => fileRef.current?.click()}>
          <Upload size={16} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void onImport(f)
            e.target.value = ''
          }}
        />
        <button className="icon-btn" title="Klávesové skratky" onClick={onHelp}>
          <HelpCircle size={16} />
        </button>
      </div>
    </aside>
  )
}
