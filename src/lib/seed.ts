import { db } from './db'
import { newId, todayISO } from './ids'
import type { Link, MapNode, MindMap, Note } from './types'

/** Creates a small demo map, a couple of notes and a journal entry on first run. */
export async function seedDemo() {
  const t = Date.now()
  const mapId = newId()
  const rootId = newId()
  const nodes: MapNode[] = []
  const links: Link[] = []
  const notes: Note[] = []

  const mk = (parentId: string | null, text: string, order: number, extra: Partial<MapNode> = {}): MapNode => {
    const n: MapNode = {
      id: newId(),
      mapId,
      parentId,
      text,
      color: null,
      icon: null,
      collapsed: false,
      order,
      createdAt: t,
      updatedAt: t,
      ...extra,
    }
    nodes.push(n)
    return n
  }

  const root = mk(null, 'Vlastná mind-map appka', 0, { id: rootId })
  const fn = mk(root.id, 'Funkcie', 0, { icon: 'star' })
  const tech = mk(root.id, 'Technológie', 1, { icon: 'wrench' })
  const data = mk(root.id, 'Dátový model', 2, { icon: 'brain' })
  const design = mk(root.id, 'Dizajn', 3, { icon: 'target' })
  const open = mk(root.id, 'Otvorené otázky', 4, { icon: 'help-circle' })

  const editing = mk(fn.id, 'Editovanie klávesnicou (Tab / Enter)', 0)
  const relations = mk(fn.id, 'Vzťahy medzi uzlami', 1)
  const notesF = mk(fn.id, 'Poznámky k uzlu', 2)
  const journal = mk(fn.id, 'Denník', 3)
  const exportF = mk(fn.id, 'Export', 4)
  mk(exportF.id, 'PNG', 0)
  mk(exportF.id, 'Markdown osnova', 1)
  mk(exportF.id, 'OPML (XMind, Freeplane)', 2)
  mk(exportF.id, 'JSON záloha', 3)

  const canvas = mk(tech.id, 'Plátno: React Flow', 0)
  const store = mk(tech.id, 'Stav: Zustand', 1)
  const dbN = mk(tech.id, 'Ukladanie: IndexedDB (Dexie)', 2)
  mk(tech.id, 'Vite + React + TypeScript', 3)

  const entity = mk(data.id, 'Entity: uzol, poznámka, denník', 0)
  const link = mk(data.id, 'Typované väzby (depends_on, relates_to…)', 1)
  const wiki = mk(data.id, '[[wiki linky]] v poznámkach', 2)

  mk(design.id, 'Farba podľa vetvy', 0)
  mk(design.id, 'Tmavý a svetlý režim', 1)
  mk(design.id, 'Plynulé prekreslenie layoutu', 2)
  mk(design.id, 'Inspector vpravo', 3)

  mk(open.id, 'Synchronizácia medzi zariadeniami?', 0)
  mk(open.id, 'Mobilná verzia?', 1)
  mk(open.id, 'Vlastné typy vzťahov', 2)

  const rel = (from: MapNode, to: MapNode, type: string) =>
    links.push({ id: newId(), fromKind: 'node', fromId: from.id, toKind: 'node', toId: to.id, type, createdAt: t })

  rel(relations, link, 'depends_on')
  rel(notesF, entity, 'depends_on')
  rel(journal, notesF, 'relates_to')
  rel(wiki, notesF, 'part_of')
  rel(editing, canvas, 'depends_on')
  rel(exportF, store, 'depends_on')
  rel(store, dbN, 'relates_to')

  const note1: Note = {
    id: newId(),
    kind: 'note',
    title: 'Prečo typované vzťahy a nie len bubliny',
    body: `Klasická mind mapa je strom. Strom je skvelý na rozklad témy, ale skutočné nápady sú graf.

Preto má každý uzol okrem rodiča a detí aj **typované väzby** na čokoľvek iné – na uzol v inej mape, na poznámku alebo na zápis v denníku. Napríklad [[Vzťahy medzi uzlami]] závisia od toho, že máme [[Typované väzby (depends_on, relates_to…)]] v dátovom modeli.

Z inšpektora uzla sa potom dá:

- prejsť na všetky závislosti (aj reťazovo),
- otvoriť poznámky, ktoré sa uzla týkajú,
- vidieť, v ktorých dňoch denníka sa uzol spomína.

Tip: do poznámky napíš \`[[názov uzla]]\` a väzba sa vytvorí sama.`,
    tags: ['koncept'],
    createdAt: t,
    updatedAt: t,
  }
  notes.push(note1)
  links.push({ id: newId(), fromKind: 'note', fromId: note1.id, toKind: 'node', toId: relations.id, type: 'about', createdAt: t })
  links.push({ id: newId(), fromKind: 'note', fromId: note1.id, toKind: 'node', toId: relations.id, type: 'mentions', auto: true, createdAt: t })
  links.push({ id: newId(), fromKind: 'note', fromId: note1.id, toKind: 'node', toId: link.id, type: 'mentions', auto: true, createdAt: t })

  const note2: Note = {
    id: newId(),
    kind: 'note',
    title: 'Klávesové skratky',
    body: `| Skratka | Akcia |
|---|---|
| **Tab** | nový podradený uzol |
| **Enter** | nový súrodenec (po ukončení editácie) |
| **Space / F2** | editovať text |
| **Delete** | zmazať uzol aj s podstromom |
| **Šípky** | pohyb po mape |
| **Ctrl + .** | zbaliť / rozbaliť |
| **Ctrl + Z / Y** | späť / znova |
| **Ctrl + K** | hľadať čokoľvek |
| **Ctrl + ↑ / ↓** | presunúť uzol medzi súrodencami |

Ťahaním uzla na iný uzol ho presunieš pod neho.`,
    tags: ['návod'],
    createdAt: t,
    updatedAt: t,
  }
  notes.push(note2)
  links.push({ id: newId(), fromKind: 'note', fromId: note2.id, toKind: 'node', toId: editing.id, type: 'about', createdAt: t })

  const today = todayISO()
  const journal1: Note = {
    id: newId(),
    kind: 'journal',
    title: today,
    date: today,
    body: `Prvý deň s appkou. Rozmýšľal som nad tým, ako prepojiť [[Denník]] s mapou – nie ako ďalšiu bublinu, ale cez väzby.

Dnes vyriešené: [[Poznámky k uzlu]] fungujú cez inšpektor.

Zajtra: pozrieť sa na [[Export]].`,
    tags: [],
    createdAt: t,
    updatedAt: t,
  }
  notes.push(journal1)
  for (const n of [journal, notesF, exportF])
    links.push({ id: newId(), fromKind: 'note', fromId: journal1.id, toKind: 'node', toId: n.id, type: 'mentions', auto: true, createdAt: t })

  const map: MindMap = { id: mapId, title: root.text, rootId, createdAt: t, updatedAt: t }
  await db.transaction('rw', db.maps, db.nodes, db.notes, db.links, async () => {
    await db.maps.put(map)
    await db.nodes.bulkPut(nodes)
    await db.notes.bulkPut(notes)
    await db.links.bulkPut(links)
  })
  const { useStore } = await import('./store')
  useStore.setState((s) => ({
    maps: { ...s.maps, [map.id]: map },
    nodes: { ...s.nodes, ...Object.fromEntries(nodes.map((n) => [n.id, n])) },
    notes: { ...s.notes, ...Object.fromEntries(notes.map((n) => [n.id, n])) },
    links: { ...s.links, ...Object.fromEntries(links.map((l) => [l.id, l])) },
  }))
}
