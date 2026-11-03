import { memo, useLayoutEffect, useRef, useState } from 'react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { FileText, Link2 } from 'lucide-react'
import { useStore } from '../lib/store'
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

function MindNodeImpl({ id, data, selected }: NodeProps<MindNodeType>) {
  const toggleCollapse = useStore((s) => s.toggleCollapse)
  const cls = ['mind-node', data.isRoot ? 'root' : '', data.dropTarget ? 'drop-target' : '', data.relatedColor && !selected ? 'related' : '']
    .filter(Boolean)
    .join(' ')
  const style = {
    '--c': data.color,
    '--rc': data.relatedColor ?? data.color,
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
      <div className="row">
        {data.icon && <span className="icon">{data.icon}</span>}
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
