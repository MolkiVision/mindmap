import Dexie, { type EntityTable } from 'dexie'
import type { ImageRec, Link, MapNode, MindMap, Note } from './types'

interface Setting {
  key: string
  value: unknown
}

export const db = new Dexie('mindmap') as Dexie & {
  maps: EntityTable<MindMap, 'id'>
  nodes: EntityTable<MapNode, 'id'>
  notes: EntityTable<Note, 'id'>
  links: EntityTable<Link, 'id'>
  settings: EntityTable<Setting, 'key'>
  images: EntityTable<ImageRec, 'id'>
}

db.version(1).stores({
  maps: 'id, updatedAt',
  nodes: 'id, mapId, parentId',
  notes: 'id, kind, date, updatedAt',
  links: 'id, fromId, toId, type',
  settings: 'key',
})

db.version(2).stores({
  maps: 'id, updatedAt',
  nodes: 'id, mapId, parentId',
  notes: 'id, kind, date, updatedAt',
  links: 'id, fromId, toId, type',
  settings: 'key',
  images: 'id',
})
