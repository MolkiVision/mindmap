import { useEffect, useRef } from 'react'
import { useStore } from '../lib/store'

export function Dialog() {
  const dialog = useStore((s) => s.dialog)
  const okRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (dialog) okRef.current?.focus()
  }, [dialog])
  if (!dialog) return null
  return (
    <div
      className="overlay"
      onMouseDown={() => dialog.resolve(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') dialog.resolve(false)
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <p>{dialog.message}</p>
        <div className="actions">
          {dialog.confirm && (
            <button className="btn" onClick={() => dialog.resolve(false)}>
              Zrušiť
            </button>
          )}
          <button ref={okRef} className="btn primary" onClick={() => dialog.resolve(true)}>
            {dialog.confirm ? 'Potvrdiť' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  )
}
