import type { Backup, ID, MapNode, MindMap } from './types'
import { childrenOf } from './store'

export function download(filename: string, content: string | Blob, mime = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function safeName(s: string) {
  return (s || 'mapa').replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 60)
}

export function exportBackup(b: Backup) {
  download(`mindmap-zaloha-${b.exportedAt.slice(0, 10)}.json`, JSON.stringify(b, null, 2), 'application/json')
}

export function mapToMarkdown(map: MindMap, nodes: Record<ID, MapNode>): string {
  const lines: string[] = [`# ${map.title}`, '']
  const walk = (id: ID, depth: number) => {
    for (const c of childrenOf(nodes, id)) {
      const icon = c.icon ? `${c.icon} ` : ''
      lines.push(`${'  '.repeat(depth)}- ${icon}${c.text}`)
      walk(c.id, depth + 1)
    }
  }
  walk(map.rootId, 0)
  return lines.join('\n') + '\n'
}

function xml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function mapToOPML(map: MindMap, nodes: Record<ID, MapNode>): string {
  const out: string[] = []
  const walk = (id: ID, depth: number) => {
    const n = nodes[id]
    const kids = childrenOf(nodes, id)
    const pad = '  '.repeat(depth + 2)
    if (kids.length === 0) out.push(`${pad}<outline text="${xml(n.text)}"/>`)
    else {
      out.push(`${pad}<outline text="${xml(n.text)}">`)
      for (const c of kids) walk(c.id, depth + 1)
      out.push(`${pad}</outline>`)
    }
  }
  walk(map.rootId, 0)
  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head><title>${xml(map.title)}</title></head>
  <body>
${out.join('\n')}
  </body>
</opml>
`
}

/** Parse a markdown outline (- item, indented by 2 spaces or a tab) into a tree. */
export interface OutlineItem {
  text: string
  children: OutlineItem[]
}
export function parseOutline(md: string): { title: string; items: OutlineItem[] } {
  const lines = md.split(/\r?\n/)
  let title = ''
  const root: OutlineItem = { text: '', children: [] }
  const stack: { depth: number; item: OutlineItem }[] = [{ depth: -1, item: root }]
  for (const raw of lines) {
    if (!title && /^#\s+/.test(raw)) {
      title = raw.replace(/^#\s+/, '').trim()
      continue
    }
    const m = raw.match(/^([ \t]*)[-*+]\s+(.*)$/)
    if (!m) continue
    const depth = m[1].replace(/\t/g, '  ').length / 2
    const item: OutlineItem = { text: m[2].trim(), children: [] }
    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) stack.pop()
    stack[stack.length - 1].item.children.push(item)
    stack.push({ depth, item })
  }
  return { title, items: root.children }
}
