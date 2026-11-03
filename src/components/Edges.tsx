import { memo } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, Position, type Edge, type EdgeProps } from '@xyflow/react'
import { useStore } from '../lib/store'

export type TreeEdgeType = Edge<{ color: string; depth: number; dimmed?: boolean }, 'tree'>
export type RelEdgeType = Edge<
  { color: string; label: string; linkId: string; directed: boolean; emphasized: boolean; active?: boolean; reversed?: boolean },
  'rel'
>

function TreeEdgeImpl({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps<TreeEdgeType>) {
  const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, curvature: 0.35 })
  const depth = data?.depth ?? 1
  const width = Math.max(1.5, 4 - depth * 0.8)
  return <BaseEdge path={path} style={{ stroke: data?.color, strokeWidth: width, opacity: data?.dimmed ? 0.25 : 0.85 }} />
}
export const TreeEdge = memo(TreeEdgeImpl)

function RelEdgeImpl({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected }: EdgeProps<RelEdgeType>) {
  const removeLink = useStore((s) => s.removeLink)
  const ask = useStore((s) => s.ask)
  // Relation edges leave from the node's outer side; add a little curvature so they arc over the tree.
  const [path, lx, ly] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: sourcePosition ?? Position.Right,
    targetPosition: targetPosition ?? Position.Left,
    curvature: 0.6,
  })
  const color = data?.color ?? '#94a3b8'
  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        className={`rel-edge ${data?.active ? (data?.reversed ? 'active reversed' : 'active') : ''}`}
        markerEnd={data?.directed ? `url(#arrow-${id})` : undefined}
        style={{ stroke: color, strokeWidth: data?.active ? 2.6 : selected ? 2.5 : 1.8, opacity: data?.emphasized === false ? 0.3 : 0.95 }}
      />
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <marker id={`arrow-${id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 1 1 L 9 5 L 1 9" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
      </svg>
      {/* pins: the thread is fixed to both cards */}
      <circle cx={sourceX} cy={sourceY} r={3} fill={color} stroke="var(--bg)" strokeWidth={1.5} opacity={data?.emphasized === false ? 0.35 : 1} />
      <circle cx={targetX} cy={targetY} r={3} fill={color} stroke="var(--bg)" strokeWidth={1.5} opacity={data?.emphasized === false ? 0.35 : 1} />
      <EdgeLabelRenderer>
        <div
          className={`rel-edge-label nodrag nopan ${data?.emphasized === false ? 'dim' : ''}`}
          style={{ left: lx, top: ly, '--rc': color } as React.CSSProperties}
          title="Kliknutím odstrániš vzťah"
          onClick={async (e) => {
            e.stopPropagation()
            if (data && (await ask(`Odstrániť vzťah „${data.label}“?`))) removeLink(data.linkId)
          }}
        >
          {data?.label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
export const RelEdge = memo(RelEdgeImpl)
