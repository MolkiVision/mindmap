import type { RelationType } from './types'

/** Palette used for top-level branches; children inherit their branch colour. */
export const BRANCH_COLORS = [
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ec4899', // pink
  '#ef4444', // red
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
  { id: 'depends_on', forward: 'závisí od', inverse: 'je potrebné pre', color: '#f97316', directed: true, builtin: true },
  { id: 'blocks', forward: 'blokuje', inverse: 'je blokované', color: '#ef4444', directed: true, builtin: true },
  { id: 'relates_to', forward: 'súvisí s', inverse: 'súvisí s', color: '#3b82f6', directed: false, builtin: true },
  { id: 'part_of', forward: 'je súčasťou', inverse: 'obsahuje', color: '#22c55e', directed: true, builtin: true },
  { id: 'causes', forward: 'spôsobuje', inverse: 'je dôsledkom', color: '#eab308', directed: true, builtin: true },
  { id: 'contradicts', forward: 'je v rozpore s', inverse: 'je v rozpore s', color: '#ec4899', directed: false, builtin: true },
  { id: 'example_of', forward: 'je príkladom', inverse: 'má príklad', color: '#06b6d4', directed: true, builtin: true },
  { id: 'about', forward: 'je poznámkou k', inverse: 'má poznámku', color: '#a855f7', directed: true, builtin: true },
  { id: 'mentions', forward: 'spomína', inverse: 'je spomenuté v', color: '#94a3b8', directed: true, builtin: true },
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
