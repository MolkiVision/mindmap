import type { RelationType } from './types'

/** Palette used for top-level branches; children inherit their branch colour. */
export const BRANCH_COLORS = [
  '#e08a3c', // ember
  '#c9a227', // ochre
  '#5aa86b', // moss
  '#3aa6b4', // teal
  '#5b8ed6', // cobalt
  '#9a7bd0', // violet
  '#d07aa4', // rose
  '#d9625a', // brick
]

/** lucide icon names offered for nodes; '' means none */
export const NODE_ICONS = [
  '',
  'lightbulb',
  'star',
  'flame',
  'check',
  'help-circle',
  'alert-triangle',
  'pin',
  'target',
  'book',
  'brain',
  'message-circle',
  'wrench',
  'rocket',
  'heart',
  'calendar',
]

/** emoji used by earlier versions, mapped to lucide names */
export const EMOJI_TO_ICON: Record<string, string> = {
  '💡': 'lightbulb',
  '⭐': 'star',
  '🔥': 'flame',
  '✅': 'check',
  '❓': 'help-circle',
  '⚠️': 'alert-triangle',
  '📌': 'pin',
  '🎯': 'target',
  '📚': 'book',
  '🧠': 'brain',
  '💬': 'message-circle',
  '🛠️': 'wrench',
  '🚀': 'rocket',
  '❤️': 'heart',
  '🗓️': 'calendar',
}

export const DEFAULT_RELATION_TYPES: RelationType[] = [
  { id: 'depends_on', forward: 'závisí od', inverse: 'je potrebné pre', color: '#e08a3c', directed: true, builtin: true },
  { id: 'blocks', forward: 'blokuje', inverse: 'je blokované', color: '#d9625a', directed: true, builtin: true },
  { id: 'relates_to', forward: 'súvisí s', inverse: 'súvisí s', color: '#5b8ed6', directed: false, builtin: true },
  { id: 'part_of', forward: 'je súčasťou', inverse: 'obsahuje', color: '#5aa86b', directed: true, builtin: true },
  { id: 'causes', forward: 'spôsobuje', inverse: 'je dôsledkom', color: '#c9a227', directed: true, builtin: true },
  { id: 'contradicts', forward: 'je v rozpore s', inverse: 'je v rozpore s', color: '#d07aa4', directed: false, builtin: true },
  { id: 'example_of', forward: 'je príkladom', inverse: 'má príklad', color: '#3aa6b4', directed: true, builtin: true },
  { id: 'about', forward: 'je poznámkou k', inverse: 'má poznámku', color: '#9a7bd0', directed: true, builtin: true },
  { id: 'mentions', forward: 'spomína', inverse: 'je spomenuté v', color: '#8a847a', directed: true, builtin: true },
]

/** Relation types that represent "dependency" semantics for the dependency explorer. */
export const DEPENDENCY_TYPES = ['depends_on', 'blocks']

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}
