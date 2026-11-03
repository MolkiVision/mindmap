import { memo, useLayoutEffect, useRef, useState } from 'react'
import { Handle, Position, useReactFlow, type Node, type NodeProps } from '@xyflow/react'
import { FileText, Link2 } from 'lucide-react'
import { useStore } from '../lib/store'
import { NodeIcon } from './NodeIcon'
import type { Side } from '../lib/layout'

export type MindNodeData = {
  text: string
  color: string
  icon: string | null
  isRoot: boolean
  side: Side
  collapsed: boolean
  hasChildren: boolean
  childCount: number
  notesCount: number
  relCount: number
  width: number
  fixedWidth: number | null
  fontPx: number
  lineH: number
  image: { id: string; url: string; w: number; h: number } | null
  floating: boolean
  editing: boolean
  dropTarget: boolean
  relatedColor: string | null
}

export type MindNodeType = Node<MindNodeData, 'mind'>

function Editor({ id, text, isRoot }: { id: string; text: string; isRoot: boolean }) {
  const seed = useStore((s) => s.editingSeed)
  const [value, setValue] = useState(seed ?? text)
  const ref = useRef<HTMLTextAreaElement>(null)
  const updateNode = useStore((s) => s.updateNode)
  const setEditing = useStore((s) => s.setEditing)
  const addChild = useStore((s) => s.addChild)
  const addSibling = useStore((s) => s.addSibling)
  const deleteNode = useStore((s) => s.deleteNode)
  const committed = useRef(false)

  const touched = useRef(false)

  // keys buffered in the store while this editor was mounting
  useLayoutEffect(() => {
    if (seed !== null && !touched.current && seed !== value) setValue(seed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed])

  const resize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = el.scrollHeight + 'px'
  }
  useLayoutEffect(resize, [value])

  // React Flow keeps a fresh node invisible until it is measured, and focus() fails on
  // invisible elements, so keep trying for a moment.
  useLayoutEffect(() => {
    const focus = () => {
      const el = ref.current
      if (!el) return true
      if (document.activeElement === el) return true
      el.focus()
      if (document.activeElement !== el) return false
      // read the live seed: keys may have been buffered since this editor mounted
      if (useStore.getState().editingSeed === null) el.select()
      else el.setSelectionRange(el.value.length, el.value.length)
      return true
    }
    if (focus()) return
    const started = performance.now()
    const iv = setInterval(() => {
      if (focus() || performance.now() - started > 1500) clearInterval(iv)
    }, 16)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const commit = (next: string) => {
    if (committed.current) return
    committed.current = true
    const trimmed = next.trim()
    if (!trimmed && !text && !isRoot) {
      // brand-new empty node abandoned → remove it
      deleteNode(id)
      return
    }
    if (trimmed !== text) updateNode(id, { text: trimmed || text })
    setEditing(null)
  }

  return (
    <textarea
      ref={ref}
      className="nodrag nopan nowheel"
      value={value}
      rows={1}
      onChange={(e) => {
        touched.current = true
        setValue(e.target.value)
      }}
      onBlur={() => commit(value)}
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          commit(value)
        } else if (e.key === 'Escape') {
          e.preventDefault()
          commit(text)
        } else if (e.key === 'Tab') {
          e.preventDefault()
          commit(value)
          if (value.trim()) setTimeout(() => addChild(id), 0)
        } else if (e.key === 'Enter' && e.shiftKey && e.ctrlKey) {
          e.preventDefault()
          commit(value)
          setTimeout(() => addSibling(id), 0)
        }
      }}
    />
  )
}

function ResizeHandle({ id, side, width }: { id: string; side: 'left' | 'right'; width: number }) {
  const setNodeWidth = useStore((s) => s.setNodeWidth)
  const updateNode = useStore((s) => s.updateNode)
  const rf = useReactFlow()
  const drag = useRef<{ x: number; w: number; moved: boolean } | null>(null)
  return (
    <div
      className={`resize nodrag nopan ${side}`}
      title="Ťahaj: šírka uzla · dvojklik: automaticky"
      onPointerDown={(e) => {
        e.stopPropagation()
        e.preventDefault()
        drag.current = { x: e.clientX, w: width, moved: false }
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!drag.current) return
        const dx = (e.clientX - drag.current.x) / rf.getZoom()
        drag.current.moved = true
        setNodeWidth(id, drag.current.w + (side === 'right' ? dx : -dx))
      }}
      onPointerUp={(e) => {
        if (!drag.current) return
        e.currentTarget.releasePointerCapture(e.pointerId)
        drag.current = null
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        updateNode(id, { width: null })
      }}
      onClick={(e) => e.stopPropagation()}
    />
  )
}

function MindNodeImpl({ id, data, selected }: NodeProps<MindNodeType>) {
  const toggleCollapse = useStore((s) => s.toggleCollapse)
  const setLightbox = useStore((s) => s.setLightbox)
  const cls = [
    'mind-node',
    data.isRoot ? 'root' : '',
    data.dropTarget ? 'drop-target' : '',
    data.relatedColor && !selected ? 'related' : '',
    data.hasChildren ? 'has-children' : '',
    data.side === 'left' ? 'side-left' : '',
    data.floating ? 'floating' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const style = {
    '--c': data.color,
    '--rc': data.relatedColor ?? data.color,
    '--fs': `${data.fontPx}px`,
    '--lh': `${data.lineH}px`,
    width: data.width,
  } as React.CSSProperties
  const showBadges = data.notesCount > 0 || data.relCount > 0
  const collapseSide = data.side === 'left' ? 'left' : 'right'
  return (
    <div className={cls} style={style}>
      <Handle type="target" position={Position.Left} id="tl" />
      <Handle type="target" position={Position.Right} id="tr" />
      <Handle type="source" position={Position.Left} id="sl" />
      <Handle type="source" position={Position.Right} id="sr" />
      {data.image && (
        <img
          className="thumb nodrag"
          src={data.image.url}
          alt=""
          draggable={false}
          style={{ width: data.image.w, height: data.image.h }}
          onDoubleClick={(e) => {
            e.stopPropagation()
            setLightbox(data.image!.id)
          }}
          title="Dvojklik otvorí v plnej veľkosti"
        />
      )}
      <div className="row">
        {data.icon && (
          <span className="icon">
            <NodeIcon name={data.icon} />
          </span>
        )}
        {data.editing ? <Editor id={id} text={data.text} isRoot={data.isRoot} /> : <div className="text">{data.text}</div>}
      </div>
      {showBadges && !data.editing && (
        <div className="badges">
          {data.notesCount > 0 && (
            <span title="Poznámky">
              <FileText size={11} /> {data.notesCount}
            </span>
          )}
          {data.relCount > 0 && (
            <span title="Vzťahy">
              <Link2 size={11} /> {data.relCount}
            </span>
          )}
        </div>
      )}
      {!data.editing && <ResizeHandle id={id} side={collapseSide} width={data.width} />}
      {data.hasChildren && (
        <button
          className={`collapse nodrag ${collapseSide} ${data.collapsed ? 'collapsed' : ''}`}
          title={data.collapsed ? `Rozbaliť (${data.childCount})` : 'Zbaliť'}
          onClick={(e) => {
            e.stopPropagation()
            toggleCollapse(id)
          }}
        >
          {data.collapsed ? data.childCount : '−'}
        </button>
      )}
    </div>
  )
}

export const MindNode = memo(MindNodeImpl)
