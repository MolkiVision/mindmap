import type { ID, MapNode } from './types'

export type Side = 'left' | 'right' | 'root'

export interface LaidOutNode {
  id: ID
  x: number // top-left
  y: number
  width: number
  height: number
  cx: number // centre
  cy: number
  side: Side
  depth: number
  /** index of the top-level branch this node belongs to (-1 for root) */
  branch: number
  hasChildren: boolean
  childCount: number
}

export interface Size {
  w: number
  h: number
}

const H_GAP = 56 // horizontal distance between parent and child
const V_GAP = 14 // vertical distance between siblings
const MAX_TEXT_WIDTH = 240
const PAD_X = 36 // padding 2×14 + border 2×1.5 + safety
const PAD_Y = 20
const LINE_H = 20
const ROOT_LINE_H = 24

let ctx: CanvasRenderingContext2D | null = null
function getCtx() {
  if (!ctx) {
    const c = document.createElement('canvas')
    ctx = c.getContext('2d')
  }
  return ctx
}

const measureCache = new Map<string, Size>()

/** Call after web fonts finish loading so cached estimates are recomputed. */
export function clearMeasureCache() {
  measureCache.clear()
}

/** Estimate the rendered size of a node for the given text (word-wrapped). */
export function measureNode(text: string, isRoot: boolean, hasBadges: boolean, hasIcon: boolean): Size {
  const key = `${isRoot ? 'R' : 'N'}|${hasBadges ? 'B' : '-'}|${hasIcon ? 'I' : '-'}|${text}`
  const cached = measureCache.get(key)
  if (cached) return cached
  const c = getCtx()
  const font = isRoot ? '700 17px Inter, system-ui, sans-serif' : '500 14px Inter, system-ui, sans-serif'
  if (c) c.font = font
  const measure = (s: string) => (c ? c.measureText(s).width : s.length * 7.5)
  const lineH = isRoot ? ROOT_LINE_H : LINE_H
  const words = (text || 'Nový uzol').split(/\s+/)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w
    if (measure(test) > MAX_TEXT_WIDTH && cur) {
      lines.push(cur)
      cur = w
    } else cur = test
  }
  lines.push(cur)
  let maxW = 0
  for (const l of lines) maxW = Math.max(maxW, Math.min(MAX_TEXT_WIDTH, measure(l)))
  const iconW = hasIcon ? 30 : 0
  const w = Math.max(isRoot ? 120 : 64, Math.ceil(maxW + iconW + PAD_X))
  const h = Math.ceil(lines.length * lineH + PAD_Y + (hasBadges ? 20 : 0))
  const size = { w, h }
  measureCache.set(key, size)
  return size
}

interface Tmp {
  node: MapNode
  size: Size
  children: Tmp[]
  subtreeH: number
}

export interface LayoutInput {
  nodes: MapNode[]
  rootId: ID
  sizeOf: (n: MapNode, isRoot: boolean) => Size
}

/**
 * Classic balanced mind-map layout: root in the centre, first half of the
 * top-level branches on the right, the rest on the left. Collapsed nodes hide
 * their descendants. Returns only visible nodes.
 */
export function layoutMindMap({ nodes, rootId, sizeOf }: LayoutInput): Map<ID, LaidOutNode> {
  const byParent = new Map<ID | null, MapNode[]>()
  for (const n of nodes) {
    const arr = byParent.get(n.parentId) ?? []
    arr.push(n)
    byParent.set(n.parentId, arr)
  }
  for (const arr of byParent.values()) arr.sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)

  const rootNode = nodes.find((n) => n.id === rootId)
  const out = new Map<ID, LaidOutNode>()
  if (!rootNode) return out

  const build = (n: MapNode, isRoot: boolean): Tmp => {
    const kids = n.collapsed ? [] : (byParent.get(n.id) ?? [])
    const t: Tmp = { node: n, size: sizeOf(n, isRoot), children: kids.map((k) => build(k, false)), subtreeH: 0 }
    const kidsH = t.children.reduce((s, c) => s + c.subtreeH, 0) + Math.max(0, t.children.length - 1) * V_GAP
    t.subtreeH = Math.max(t.size.h, kidsH)
    return t
  }

  const root = build(rootNode, true)
  const rootCount = byParent.get(rootNode.id)?.length ?? 0

  const place = (t: Tmp, cx: number, cy: number, side: Side, depth: number, branch: number) => {
    const { w, h } = t.size
    const allKids = byParent.get(t.node.id) ?? []
    out.set(t.node.id, {
      id: t.node.id,
      x: cx - w / 2,
      y: cy - h / 2,
      width: w,
      height: h,
      cx,
      cy,
      side,
      depth,
      branch,
      hasChildren: allKids.length > 0,
      childCount: allKids.length,
    })
    if (t.children.length === 0) return
    const totalH = t.children.reduce((s, c) => s + c.subtreeH, 0) + (t.children.length - 1) * V_GAP
    let y = cy - totalH / 2
    for (const c of t.children) {
      const ccy = y + c.subtreeH / 2
      const ccx = side === 'left' ? cx - w / 2 - H_GAP - c.size.w / 2 : cx + w / 2 + H_GAP + c.size.w / 2
      place(c, ccx, ccy, side, depth + 1, branch)
      y += c.subtreeH + V_GAP
    }
  }

  // Split top-level children: first ceil(n/2) to the right, the rest to the left.
  const kids = root.children
  const rightCount = Math.ceil(kids.length / 2)
  const right = kids.slice(0, rightCount)
  const left = kids.slice(rightCount)

  const { w: rw, h: rh } = root.size
  out.set(root.node.id, {
    id: root.node.id,
    x: -rw / 2,
    y: -rh / 2,
    width: rw,
    height: rh,
    cx: 0,
    cy: 0,
    side: 'root',
    depth: 0,
    branch: -1,
    hasChildren: rootCount > 0,
    childCount: rootCount,
  })

  const placeSide = (group: Tmp[], side: Side, branchOffset: number) => {
    const totalH = group.reduce((s, c) => s + c.subtreeH, 0) + Math.max(0, group.length - 1) * V_GAP
    let y = -totalH / 2
    group.forEach((c, i) => {
      const ccy = y + c.subtreeH / 2
      const ccx = side === 'left' ? -rw / 2 - H_GAP - c.size.w / 2 : rw / 2 + H_GAP + c.size.w / 2
      place(c, ccx, ccy, side, 1, branchOffset + i)
      y += c.subtreeH + V_GAP
    })
  }
  placeSide(right, 'right', 0)
  placeSide(left, 'left', rightCount)

  return out
}
