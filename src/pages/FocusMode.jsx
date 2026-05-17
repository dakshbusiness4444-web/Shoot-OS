import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight, Check, RotateCcw, ExternalLink } from 'lucide-react'
import useStore from '../store/useStore'

function MetaRow({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-ink-400 mb-1">{label}</p>
      <p className="text-sm text-ink-700 leading-relaxed">{value}</p>
    </div>
  )
}

export default function FocusMode() {
  const navigate = useNavigate()
  const { shots, products, productColors, markShotDone, markShotPending } = useStore()

  const [showDone, setShowDone]     = useState(false)
  const [idx, setIdx]               = useState(0)
  const [completing, setCompleting] = useState(false)
  const [contentKey, setContentKey] = useState(0)

  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const productShots  = shots.filter((s) => s.shot_type === 'product')
  const displayShots  = showDone ? productShots : productShots.filter((s) => s.status !== 'done')
  const safeIdx       = Math.min(idx, Math.max(0, displayShots.length - 1))
  const shot          = displayShots[safeIdx]
  const doneCount     = productShots.filter((s) => s.status === 'done').length
  const total         = productShots.length

  // ── All done screen ───────────────────────────────────────────────────────
  if (!shot) {
    return (
      <div className="fixed inset-0 z-[100] bg-ivory-100 flex flex-col items-center justify-center focus-mode-enter">
        <div className="text-center px-8">
          <div className="w-20 h-20 rounded-3xl bg-moss-100 flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-moss-400" />
          </div>
          <p className="font-display text-3xl text-ink-900 mb-2">All Clear</p>
          <p className="text-sm text-ink-400 mb-8">Every shot is wrapped</p>
          <button
            onClick={() => navigate('/shoot')}
            className="px-6 py-3 rounded-xl bg-ink-900 text-white text-sm font-medium active:bg-ink-800"
          >
            Back to Shoot Mode
          </button>
        </div>
      </div>
    )
  }

  const product = products.find((p) => p.id === shot.product_id)
  const color   = productColors.find((c) => c.id === shot.color_id)
  const isDone  = shot.status === 'done'
  const isVideo = shot.media_type === 'video'

  // ── Navigation ────────────────────────────────────────────────────────────
  const goTo = (newIdx) => {
    setIdx(newIdx)
    setContentKey((k) => k + 1)
  }
  const prev = () => safeIdx > 0 && goTo(safeIdx - 1)
  const next = () => safeIdx < displayShots.length - 1 && goTo(safeIdx + 1)

  // ── Done / pending ────────────────────────────────────────────────────────
  const handleDone = async () => {
    if (isDone) {
      await markShotPending(shot.id)
      setContentKey((k) => k + 1)
      return
    }
    setCompleting(true)
    await markShotDone(shot.id)
    setTimeout(() => {
      setCompleting(false)
      setContentKey((k) => k + 1)
      if (!showDone) setIdx((i) => Math.min(i, Math.max(0, displayShots.length - 2)))
    }, 380)
  }

  // ── Swipe between shots ───────────────────────────────────────────────────
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY)
    if (Math.abs(dx) > 50 && dy < 80) dx > 0 ? next() : prev()
    touchStartX.current = null
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-ivory-100 flex flex-col overflow-hidden focus-mode-enter"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-5 pt-4 flex-shrink-0"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <button
          onClick={() => navigate('/shoot')}
          className="w-9 h-9 rounded-full bg-ivory-200 flex items-center justify-center text-ink-600 active:bg-ivory-300 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="text-center">
          <p className="text-[9px] font-semibold tracking-[0.22em] uppercase text-ink-400">Now Shooting</p>
          <p className="text-ink-600 text-xs tabular-nums mt-0.5">
            {safeIdx + 1}
            <span className="text-ink-300"> / {displayShots.length}</span>
          </p>
        </div>

        <button
          onClick={() => { setShowDone((v) => !v); setIdx(0) }}
          className={`text-[10px] font-semibold px-3 py-1.5 rounded-full transition-colors
            ${showDone ? 'bg-ink-900 text-white' : 'bg-ivory-200 text-ink-500'}`}
        >
          {showDone ? 'All' : 'Pending'}
        </button>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-px bg-ivory-200 mx-5 mt-3 mb-1 flex-shrink-0 rounded-full overflow-hidden">
        <div
          className="h-full bg-moss-400 transition-all duration-500 rounded-full"
          style={{ width: `${total > 0 ? (doneCount / total) * 100 : 0}%` }}
        />
      </div>

      {/* ── Shot content ── */}
      <div key={contentKey} className="flex-1 flex flex-col min-h-0 animate-fade-in">

        {/* Reference image */}
        {shot.reference_image_url ? (
          <div className="relative flex-shrink-0" style={{ height: '40vh' }}>
            <img src={shot.reference_image_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ivory-100 via-ivory-100/10 to-transparent" />
            {isDone && (
              <div className="absolute inset-0 bg-ivory-100/70 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-moss-400 flex items-center justify-center">
                  <Check size={26} strokeWidth={2.5} className="text-white" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-shrink-0 flex items-center justify-center" style={{ height: '14vh' }}>
            <span className="text-5xl opacity-30">{isVideo ? '🎬' : '📷'}</span>
          </div>
        )}

        {/* Info scroll area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-2 space-y-4">

          {/* Tags + title */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {product && (
                <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-ink-400">
                  {product.name}
                </span>
              )}
              {color && (
                <span className="flex items-center gap-1.5 text-[9px] text-ink-400">
                  <span className="w-2.5 h-2.5 rounded-full border border-ink-200"
                    style={{ backgroundColor: color.hex_code }} />
                  {color.color_name}
                </span>
              )}
              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full
                ${isVideo ? 'bg-moss-100 text-moss-500' : 'bg-camel-100 text-camel-400'}`}>
                {isVideo ? '🎬 Video' : '📷 Photo'}
              </span>
            </div>
            <h2 className={`font-display text-[1.65rem] font-medium leading-tight
              ${isDone ? 'text-ink-300 line-through' : 'text-ink-900'}`}>
              {shot.title}
            </h2>
          </div>

          <MetaRow label="Execution"     value={shot.description}      />
          <MetaRow label="Pose"          value={shot.pose_description}  />
          <MetaRow label="Styling"       value={shot.styling_note}      />

          {(shot.camera_angle || shot.lens_feel || shot.lighting_notes || shot.mood) && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <MetaRow label="Angle"    value={shot.camera_angle}   />
              <MetaRow label="Lens"     value={shot.lens_feel}      />
              <MetaRow label="Lighting" value={shot.lighting_notes} />
              <MetaRow label="Mood"     value={shot.mood}           />
            </div>
          )}

          {isVideo && (shot.movement || shot.camera_motion || shot.transition_note || shot.audio_note) && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <MetaRow label="Movement"      value={shot.movement}        />
              <MetaRow label="Camera Motion" value={shot.camera_motion}   />
              <MetaRow label="Transition"    value={shot.transition_note} />
              <MetaRow label="Audio"         value={shot.audio_note}      />
            </div>
          )}

          {shot.reference_reel_url && (
            <a href={shot.reference_reel_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-camel-500 bg-camel-100/40 rounded-xl px-3 py-2.5 active:bg-camel-100">
              <ExternalLink size={12} />
              <span className="truncate">{shot.reference_reel_url}</span>
            </a>
          )}

          <MetaRow label="Notes" value={shot.notes} />
        </div>
      </div>

      {/* ── Bottom controls ── */}
      <div
        className="flex-shrink-0 px-5 pt-3 pb-8 space-y-2.5 border-t border-ivory-200"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex gap-2.5">
          <button
            onClick={prev}
            disabled={safeIdx === 0}
            className="flex-1 py-3 rounded-2xl bg-ivory-200 text-ink-500 flex items-center justify-center gap-1
              disabled:opacity-30 active:bg-ivory-300 text-sm font-medium transition-colors"
          >
            <ChevronLeft size={15} /> Prev
          </button>
          <button
            onClick={next}
            disabled={safeIdx >= displayShots.length - 1}
            className="flex-1 py-3 rounded-2xl bg-ivory-200 text-ink-500 flex items-center justify-center gap-1
              disabled:opacity-30 active:bg-ivory-300 text-sm font-medium transition-colors"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>

        <button
          onClick={handleDone}
          className={`w-full py-4 rounded-2xl font-medium text-base flex items-center justify-center gap-2.5
            transition-all duration-200
            ${completing ? 'bg-moss-500 scale-[0.98]' : ''}
            ${isDone
              ? 'bg-ivory-200 text-ink-500 active:bg-ivory-300'
              : completing
                ? 'bg-moss-500 text-white'
                : 'bg-moss-400 text-white active:bg-moss-500'
            }`}
        >
          {isDone
            ? <><RotateCcw size={16} /> Mark Pending</>
            : completing
              ? <><Check size={18} strokeWidth={2.5} /> Done!</>
              : <><Check size={18} strokeWidth={2.5} /> Mark Done</>
          }
        </button>
      </div>
    </div>
  )
}
