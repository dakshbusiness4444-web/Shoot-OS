import { useEffect, useState, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

/**
 * Fullscreen immersive media viewer.
 * Props:
 *   open        — boolean
 *   images      — array of { url, caption? } OR plain strings
 *   initialIndex — number (default 0)
 *   onClose     — function
 */
export default function MediaModal({ open, images = [], initialIndex = 0, onClose }) {
  const [idx, setIdx]           = useState(initialIndex)
  const [entering, setEntering] = useState(false)
  const touchStartX              = useRef(null)
  const touchStartY              = useRef(null)

  // normalise images to { url, caption }
  const items = images.map((img) =>
    typeof img === 'string' ? { url: img, caption: '' } : img
  )

  useEffect(() => {
    if (open) {
      setIdx(initialIndex)
      setEntering(true)
      document.body.classList.add('modal-open')
      const t = setTimeout(() => setEntering(false), 200)
      return () => clearTimeout(t)
    } else {
      document.body.classList.remove('modal-open')
    }
  }, [open, initialIndex])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowLeft')   prev()
      if (e.key === 'ArrowRight')  next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, idx, items.length])

  const prev = () => setIdx((i) => (i > 0 ? i - 1 : items.length - 1))
  const next = () => setIdx((i) => (i < items.length - 1 ? i + 1 : 0))

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY)
    if (Math.abs(dx) > 45 && dy < 60) {
      dx > 0 ? next() : prev()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  if (!open || items.length === 0) return null

  const current = items[idx]

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col media-modal-bg transition-opacity duration-200 ${entering ? 'opacity-0' : 'opacity-100'}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0"
           style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-3">
          {items.length > 1 && (
            <span className="text-white/50 text-sm tabular-nums">
              {idx + 1} <span className="text-white/30">/ {items.length}</span>
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white active:bg-white/20 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center px-4 overflow-hidden relative min-h-0">
        {/* Prev arrow — desktop */}
        {items.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-2 z-10 w-10 h-10 rounded-full bg-white/10 hidden sm:flex items-center justify-center text-white active:bg-white/20"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <img
          key={current.url}
          src={current.url}
          alt={current.caption || ''}
          className="pinch-zoom-img max-w-full max-h-full rounded-xl object-contain animate-fade-in"
          style={{ maxHeight: 'calc(100vh - 160px)' }}
          onError={(e) => { e.target.src = '' }}
        />

        {items.length > 1 && (
          <button
            onClick={next}
            className="absolute right-2 z-10 w-10 h-10 rounded-full bg-white/10 hidden sm:flex items-center justify-center text-white active:bg-white/20"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Caption + dots */}
      <div className="flex-shrink-0 px-4 pb-8 pt-3 text-center"
           style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        {current.caption && (
          <p className="text-white/60 text-sm mb-3 leading-relaxed">{current.caption}</p>
        )}
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`rounded-full transition-all duration-200 ${
                  i === idx
                    ? 'w-5 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/30 active:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
        {items.length > 1 && (
          <p className="text-white/30 text-xs mt-3">Swipe to navigate</p>
        )}
      </div>
    </div>
  )
}
