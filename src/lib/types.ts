export type ID = string

export interface MindMap {
  id: ID
  title: string
  rootId: ID
  createdAt: number
  updatedAt: number
}

export interface MapNode {
  id: ID
  mapId: ID
  parentId: ID | null
  text: string
  color: string | null
  icon: string | null
  collapsed: boolean
  order: number
  /** fixed width in px set by the user; null = automatic */
  width?: number | null
  /** text size preset; null = map default */
  size?: NodeSize | null
  /** centre position of a free (parentless, non-root) node in canvas units */
  x?: number | null
  y?: number | null
  /** id of an attached image (see ImageRec) */
  image?: string | null
  createdAt: number
  updatedAt: number
}

/** image stored in the browser; dataUrl is already downscaled */
export interface ImageRec {
  id: ID
  dataUrl: string
  w: number
  h: number
  createdAt: number
}

export type NodeSize = 'sm' | 'md' | 'lg' | 'xl'

export type NoteKind = 'note' | 'journal'

export interface Note {
  id: ID
  kind: NoteKind
  title: string
  body: string
  /** ISO date (YYYY-MM-DD), only for journal entries */
  date?: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export type EntityKind = 'node' | 'note'

export interface EntityRef {
  kind: EntityKind
  id: ID
}

/**
 * A typed, directed relation between two entities (nodes or notes).
 * `auto` links are derived from [[wiki links]] in note bodies and are
 * re-generated whenever the note changes.
 */
export interface Link {
  id: ID
  fromKind: EntityKind
  fromId: ID
  toKind: EntityKind
  toId: ID
  type: string
  label?: string
  auto?: boolean
  createdAt: number
}

export interface RelationType {
  id: string
  /** label read from source to target, e.g. "závisí od" */
  forward: string
  /** label read from target to source, e.g. "je potrebné pre" */
  inverse: string
  color: string
  directed: boolean
  builtin?: boolean
}

export type View = { kind: 'map'; mapId: ID } | { kind: 'notes'; noteId: ID | null } | { kind: 'journal'; date: string }

export interface Backup {
  version: 1
  exportedAt: string
  maps: MindMap[]
  nodes: MapNode[]
  notes: Note[]
  links: Link[]
  relationTypes: RelationType[]
  images?: ImageRec[]
}
