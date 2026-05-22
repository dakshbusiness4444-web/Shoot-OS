import { useState, useRef, useEffect, useCallback } from 'react'
import { Check, ChevronDown, ChevronUp, ExternalLink, Image, Pencil, RotateCcw,
         StickyNote, Trash2, Zap, List, Layers, GripVertical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { Card, ProgressBar, CreatorTag, FilterChip, EmptyState, MediaModal } from '../components/ui'
import { PAIRING_TYPE_CONFIG } from '../data/seedData'

const PRIORITY_ORDER = { urgent: 0, high: 1, normal: 2 }

// ─── Undo Toast ───────────────────────────────────────────────────────────────
function UndoToast({ shot, onUndo, onDismiss }) {
  const [exiting, setExiting] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const start = Date.now()
    const duration = 4000
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(pct)
      if (pct === 0) clearInterval(interval)
    }, 40)
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(onDismiss, 200)
    }, duration)
    return () => { clearTimeout(timer); clearInterval(interval) }
  }, [])

  const handleUndo = () => {
    setExiting(true)
    setTimeout(() => { onUndo(); onDismiss() }, 150)
  }

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] w-[calc(100%-2rem)] max-w-sm
        bg-ink-900 text-white rounded-2xl shadow-lifted overflow-hidden
        ${exiting ? 'toast-exit' : 'toast-enter'}`}
      style={{ maxWidth: '22rem' }}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-7 h-7 rounded-full bg-moss-400 flex items-center justify-center flex-shrink-0">
          <Check size={13} strokeWidth={2.5} className="text-white" />
        </div>
        <p className="flex-1 text-sm font-medium truncate">{shot.title}</p>
        <button
          onClick={handleUndo}
          className="text-xs font-semibold text-camel-300 px-2.5 py-1 rounded-lg bg-white/10 active:bg-white/20 flex-shrink-0"
        >
          Undo
        </button>
      </div>
      {/* Progress drain bar */}
      <div className="h-0.5 bg-white/10">
        <div
          className="h-full bg-moss-400 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// ─── Metadata cell ─────────────────────────────────────────────────────────────
function MetaCell({ label, value }) {
  if (!value) return null
  return (
    <div className="meta-cell">
      <span className="meta-label">{label}</span>
      <span className="meta-value">{value}</span>
    </div>
  )
}

// ─── Shot card ────────────────────────────────────────────────────────────────
function ShotCard({ shot, globalIndex, onDone, onPending }) {
  const { products, productColors, stylingPairings, updateShot, updateStylingPairing, deleteStylingPairing } = useStore()
  const [expanded,     setExpanded]     = useState(shot.status !== 'done')
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes,        setNotes]        = useState(shot.notes || '')
  const [completing,   setCompleting]   = useState(false)
  const [mediaOpen,    setMediaOpen]    = useState(false)
  const [editingPairing, setEditingPairing] = useState(null)  // inline edit for style-with

  // swipe-to-done
  const [swipeDx,    setSwipeDx]    = useState(0)
  const [snapping,   setSnapping]   = useState(false)
  const touchRef     = useRef({ startX: null, startY: null, locked: null })

  const product = products.find((p) => p.id === shot.product_id)
  const color   = productColors.find((c) => c.id === shot.color_id)
  const isDone  = shot.status === 'done'
  const isVideo = shot.media_type === 'video'
  const hasImages = !isVideo && shot.reference_image_url

  // Style With pairings — same product, color matches or either is universal
  const shotPairings = stylingPairings.filter(
    (p) => p.product_id === shot.product_id &&
      (!p.color_id || !shot.color_id || p.color_id === shot.color_id)
  )

  // ── Swipe handlers ─────────────────────────────────────────────────────────
  const onTouchStart = (e) => {
    touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, locked: null }
  }
  const onTouchMove = (e) => {
    const { startX, startY, locked } = touchRef.current
    if (startX === null) return
    const dx = e.touches[0].clientX - startX
    const dy = Math.abs(e.touches[0].clientY - startY)

    if (locked === null) {
      if (Math.abs(dx) > 8 || dy > 8) {
        touchRef.current.locked = Math.abs(dx) > dy ? 'h' : 'v'
      }
    }
    if (touchRef.current.locked === 'h' && !isDone) {
      e.preventDefault()
      setSwipeDx(Math.max(0, dx)) // only allow rightward swipe
    }
  }
  const onTouchEnd = () => {
    const { startX } = touchRef.current
    if (startX === null) return
    touchRef.current = { startX: null, startY: null, locked: null }
    if (swipeDx > 80 && !isDone) {
      setSnapping(true)
      setSwipeDx(0)
      setTimeout(() => setSnapping(false), 250)
      handleDone()
    } else {
      setSnapping(true)
      setSwipeDx(0)
      setTimeout(() => setSnapping(false), 250)
    }
  }

  const handleDone = async () => {
    if (isDone) {
      await onPending(shot.id)
      setExpanded(true)
      return
    }
    setCompleting(true)
    await onDone(shot.id)
    setTimeout(() => {
      setCompleting(false)
      setExpanded(false)
    }, 320)
  }

  const handleSaveNotes = () => {
    updateShot(shot.id, { notes })
    setEditingNotes(false)
  }

  const swipeProgress = Math.min(swipeDx / 80, 1)

  return (
    <>
      <div
        className={`relative swipe-card ${snapping ? 'swipe-card-snapping' : ''}`}
        style={{ transform: `translateX(${swipeDx}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Green reveal behind card */}
        {swipeDx > 0 && (
          <div
            className="absolute inset-0 rounded-2xl flex items-center px-5"
            style={{ backgroundColor: `rgba(122,155,118,${swipeProgress * 0.9})`, zIndex: -1 }}
          >
            <Check size={20} strokeWidth={2.5} className="text-white" style={{ opacity: swipeProgress }} />
          </div>
        )}

        <Card className={`transition-all duration-300 ${isDone ? 'opacity-60 shot-done' : ''}`}>

          {/* ── Header ── */}
          <button
            className="w-full px-4 pt-4 pb-3 flex items-start gap-3 text-left"
            onClick={() => setExpanded((v) => !v)}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
              ${isDone ? 'bg-moss-400' : completing ? 'bg-moss-300 animate-done-flash' : 'bg-ivory-200'}`}>
              {isDone
                ? <Check size={15} strokeWidth={2.5} className="text-white animate-check-in" />
                : <span className="font-display text-sm font-medium text-ink-600">{String(globalIndex + 1).padStart(2, '0')}</span>
              }
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className={`font-display text-base font-medium leading-snug transition-all
                  ${isDone ? 'line-through text-ink-400' : 'text-ink-900'}`}>
                  {shot.title}
                </h3>
                {expanded
                  ? <ChevronUp   size={15} className="text-ink-300 flex-shrink-0 mt-1" />
                  : <ChevronDown size={15} className="text-ink-300 flex-shrink-0 mt-1" />}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {product && <span className="text-xs font-medium text-ink-600">{product.name}</span>}
                {color && (
                  <span className="flex items-center gap-1 text-xs text-ink-500">
                    <span className="w-3 h-3 rounded-full border border-ink-100/60" style={{ backgroundColor: color.hex_code }} />
                    {color.color_name}
                  </span>
                )}
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded
                  ${isVideo ? 'bg-moss-100 text-moss-500' : 'bg-camel-100 text-camel-400'}`}>
                  {isVideo ? '🎬' : '📷'}
                </span>
                <CreatorTag creator={shot.creator} />
              </div>
            </div>
          </button>

          {/* ── Expanded body ── */}
          {expanded && (
            <div className="animate-slide-down">
              {hasImages && (
                <button
                  onClick={() => setMediaOpen(true)}
                  className="w-full block relative overflow-hidden bg-ivory-200 img-overlay-bottom"
                >
                  <img src={shot.reference_image_url} alt="Reference" className="w-full h-auto block"
                    onError={(e) => { e.target.parentElement.style.display = 'none' }} />
                  <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                    Tap to expand
                  </div>
                </button>
              )}

              <div className="px-4 py-4 space-y-4 border-t border-ivory-200">
                {shot.description && (
                  <div>
                    <span className="meta-label">Execution</span>
                    <p className="text-sm text-ink-700 leading-relaxed mt-1">{shot.description}</p>
                  </div>
                )}
                {shot.pose_description && (
                  <div>
                    <span className="meta-label">Pose</span>
                    <p className="text-sm text-ink-700 leading-relaxed mt-1">{shot.pose_description}</p>
                  </div>
                )}
                {(shot.camera_angle || shot.lens_feel || shot.lighting_notes || shot.mood) && (
                  <div className="grid grid-cols-2 gap-3">
                    <MetaCell label="Camera Angle" value={shot.camera_angle}    />
                    <MetaCell label="Lens Feel"    value={shot.lens_feel}       />
                    <MetaCell label="Lighting"     value={shot.lighting_notes}  />
                    <MetaCell label="Mood"         value={shot.mood}            />
                  </div>
                )}
                {shot.styling_note && (
                  <div>
                    <span className="meta-label">Styling</span>
                    <p className="text-sm text-ink-700 mt-1">{shot.styling_note}</p>
                  </div>
                )}
                {isVideo && (
                  <>
                    {(shot.movement || shot.camera_motion) && (
                      <div className="grid grid-cols-2 gap-3">
                        <MetaCell label="Movement"      value={shot.movement}      />
                        <MetaCell label="Camera Motion" value={shot.camera_motion} />
                      </div>
                    )}
                    {(shot.transition_note || shot.audio_note) && (
                      <div className="grid grid-cols-2 gap-3">
                        <MetaCell label="Transition" value={shot.transition_note} />
                        <MetaCell label="Audio"      value={shot.audio_note}      />
                      </div>
                    )}
                    {shot.reference_reel_url && (
                      <a href={shot.reference_reel_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 mt-1 text-sm text-camel-500 bg-camel-100/40 rounded-xl px-3 py-2.5 active:bg-camel-100"
                        onClick={(e) => e.stopPropagation()}>
                        <ExternalLink size={13} />
                        <span className="truncate text-xs">{shot.reference_reel_url}</span>
                      </a>
                    )}
                  </>
                )}
                {!isVideo && shot.reference_reel_url && (
                  <a href={shot.reference_reel_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 mt-1 text-sm text-camel-500 bg-camel-100/40 rounded-xl px-3 py-2.5 active:bg-camel-100"
                    onClick={(e) => e.stopPropagation()}>
                    <ExternalLink size={13} />
                    <span className="truncate text-xs">{shot.reference_reel_url}</span>
                  </a>
                )}
                {shot.pinterest_url && (
                  <a href={shot.pinterest_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 mt-1 text-sm text-camel-500 bg-camel-100/40 rounded-xl px-3 py-2.5 active:bg-camel-100"
                    onClick={(e) => e.stopPropagation()}>
                    <ExternalLink size={13} />
                    <span className="truncate text-xs">{shot.pinterest_url}</span>
                  </a>
                )}

                {/* Style With */}
                {shotPairings.length > 0 && (
                  <div className="border-t border-ivory-200 pt-3">
                    <span className="meta-label block mb-2">Style With</span>
                    <div className="space-y-1.5">
                      {shotPairings.map((p) => {
                        const cfg = PAIRING_TYPE_CONFIG[p.type] || PAIRING_TYPE_CONFIG.note
                        const isEditingThis = editingPairing?.id === p.id
                        return (
                          <div key={p.id}>
                            {isEditingThis ? (
                              /* ── Inline edit form ── */
                              <div className="space-y-2 bg-ivory-100 rounded-xl p-3">
                                <select
                                  value={editingPairing.type}
                                  onChange={(e) => setEditingPairing((ep) => ({ ...ep, type: e.target.value }))}
                                  className="w-full bg-white border border-ivory-300 rounded-xl px-3 py-2 text-sm
                                    text-ink-900 focus:outline-none focus:ring-2 focus:ring-camel-300"
                                >
                                  {Object.entries(PAIRING_TYPE_CONFIG).map(([k, v]) => (
                                    <option key={k} value={k}>{v.icon} {v.label}</option>
                                  ))}
                                </select>
                                <textarea
                                  value={editingPairing.description}
                                  onChange={(e) => setEditingPairing((ep) => ({ ...ep, description: e.target.value }))}
                                  rows={2}
                                  autoFocus
                                  className="w-full bg-white border border-ivory-300 rounded-xl px-3 py-2 text-sm
                                    text-ink-900 placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-camel-300
                                    resize-none"
                                />
                                {editingPairing.notes !== undefined && (
                                  <textarea
                                    value={editingPairing.notes || ''}
                                    onChange={(e) => setEditingPairing((ep) => ({ ...ep, notes: e.target.value }))}
                                    rows={1}
                                    placeholder="Notes…"
                                    className="w-full bg-white border border-ivory-300 rounded-xl px-3 py-2 text-xs
                                      text-ink-600 placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-camel-300
                                      resize-none"
                                  />
                                )}
                                <div className="flex gap-2">
                                  <button
                                    onClick={async () => {
                                      await updateStylingPairing(editingPairing.id, {
                                        type: editingPairing.type,
                                        description: editingPairing.description,
                                        notes: editingPairing.notes || '',
                                      })
                                      setEditingPairing(null)
                                    }}
                                    disabled={!editingPairing.description.trim()}
                                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-ink-900 text-white
                                      disabled:opacity-40 active:bg-ink-800"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingPairing(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-medium bg-ivory-200 text-ink-600
                                      active:bg-ivory-300"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* ── Normal display row ── */
                              <div className="flex items-start gap-2.5 bg-ivory-100 rounded-xl px-3 py-2.5">
                                <span className="text-base leading-none mt-0.5 flex-shrink-0">{cfg.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <span className={`text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${cfg.color} inline-block mb-1`}>
                                    {cfg.label}
                                  </span>
                                  <p className="text-xs text-ink-800 leading-snug">{p.description}</p>
                                  {p.notes && <p className="text-[10px] text-ink-400 mt-0.5">{p.notes}</p>}
                                </div>
                                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                                  {p.image_url && (
                                    <img src={p.image_url} alt=""
                                      className="w-12 h-12 rounded-lg object-cover"
                                      onError={(e) => { e.target.style.display = 'none' }} />
                                  )}
                                  <div className="flex items-center gap-0.5">
                                    <button
                                      onClick={() => setEditingPairing({ ...p })}
                                      className="p-1 text-ink-300 active:text-camel-500 rounded-lg"
                                    >
                                      <Pencil size={11} />
                                    </button>
                                    <button
                                      onClick={() => deleteStylingPairing(p.id)}
                                      className="p-1 text-ink-300 active:text-earth-400 rounded-lg"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="border-t border-ivory-200 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="meta-label">Notes</span>
                    {!editingNotes && (
                      <button onClick={() => setEditingNotes(true)} className="flex items-center gap-1 text-xs text-camel-500">
                        <StickyNote size={11} />{shot.notes ? 'Edit' : 'Add'}
                      </button>
                    )}
                  </div>
                  {editingNotes ? (
                    <div className="space-y-2">
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                        placeholder="Lighting adjustment, pose variation…"
                        className="w-full bg-ivory-200 border-0 rounded-xl px-3 py-2.5 text-sm text-ink-900
                          placeholder-ink-200 focus:outline-none focus:ring-2 focus:ring-camel-300 resize-none"
                        rows={3} autoFocus />
                      <div className="flex gap-2">
                        <button onClick={handleSaveNotes} className="text-xs bg-ink-900 text-white px-3 py-1.5 rounded-lg">Save</button>
                        <button onClick={() => { setNotes(shot.notes || ''); setEditingNotes(false) }}
                          className="text-xs text-ink-400 px-3 py-1.5 rounded-lg bg-ivory-200">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-sm leading-relaxed ${shot.notes ? 'text-ink-700' : 'text-ink-300 italic'}`}>
                      {shot.notes || 'No notes yet'}
                    </p>
                  )}
                </div>

                {/* Done button */}
                <button
                  onClick={handleDone}
                  className={`w-full py-4 rounded-2xl font-medium text-sm flex items-center justify-center gap-2.5
                    transition-all duration-200
                    ${completing ? 'bg-moss-300 scale-[0.98]' : ''}
                    ${isDone
                      ? 'bg-ivory-200 text-ink-500 active:bg-ivory-300'
                      : completing
                        ? 'bg-moss-300 text-white'
                        : 'bg-moss-400 text-white active:bg-moss-500'
                    }`}
                >
                  {isDone
                    ? <><RotateCcw size={15} /> Mark as Pending</>
                    : completing
                      ? <><Check size={16} strokeWidth={2.5} /> Done!</>
                      : <><Check size={16} strokeWidth={2.5} /> Mark Done</>
                  }
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {hasImages && (
        <MediaModal open={mediaOpen} images={[{ url: shot.reference_image_url, caption: shot.title }]} onClose={() => setMediaOpen(false)} />
      )}
    </>
  )
}

// ─── Draggable Reorder List ───────────────────────────────────────────────────
function DraggableReorderList({ shots, products, productColors, onChange }) {
  const ITEM_H = 72   // px — approximate height of each card + gap

  const [order,          setOrder]          = useState(() => shots.map((s) => s.id))
  const [draggingId,     setDraggingId]     = useState(null)
  const [dragOffset,     setDragOffset]     = useState(0)
  const [tentativeOrder, setTentativeOrder] = useState(null)

  const dragRef = useRef(null)   // { id, origIdx, startY, origOrder }
  const offRef  = useRef(0)      // live offset — safe to read inside event closures

  const displayOrder = tentativeOrder || order

  const startDrag = useCallback((e, id) => {
    e.preventDefault()
    const y = (e.touches?.[0] ?? e).clientY
    const origIdx = order.indexOf(id)
    dragRef.current = { id, origIdx, startY: y, origOrder: [...order] }
    offRef.current  = 0
    setDraggingId(id)
    setDragOffset(0)
    setTentativeOrder([...order])
  }, [order])

  useEffect(() => {
    if (!draggingId) return

    const onMove = (e) => {
      if (!dragRef.current) return
      e.preventDefault()
      const y   = (e.touches?.[0] ?? e).clientY
      const off = y - dragRef.current.startY
      offRef.current = off
      setDragOffset(off)

      const { origIdx, id, origOrder } = dragRef.current
      const clamped = Math.max(0, Math.min(origOrder.length - 1, origIdx + Math.round(off / ITEM_H)))
      const arr = origOrder.filter((x) => x !== id)
      arr.splice(clamped, 0, id)
      setTentativeOrder(arr)
    }

    const onEnd = () => {
      if (!dragRef.current) return
      const { origIdx, id, origOrder } = dragRef.current
      const off     = offRef.current
      const clamped = Math.max(0, Math.min(origOrder.length - 1, origIdx + Math.round(off / ITEM_H)))
      const newOrder = origOrder.filter((x) => x !== id)
      newOrder.splice(clamped, 0, id)

      setOrder(newOrder)
      onChange(newOrder)

      dragRef.current = null
      offRef.current  = 0
      setDraggingId(null)
      setDragOffset(0)
      setTentativeOrder(null)
    }

    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend',  onEnd)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onEnd)
    return () => {
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend',  onEnd)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onEnd)
    }
  }, [draggingId, onChange])

  return (
    <div className="relative select-none">
      {displayOrder.map((id, visualIdx) => {
        const shot = shots.find((s) => s.id === id)
        if (!shot) return null

        const isDragging        = id === draggingId
        const origIdx           = dragRef.current?.origIdx ?? visualIdx
        const product           = products.find((p) => p.id === shot.product_id)
        const color             = productColors.find((c) => c.id === shot.color_id)
        const productColorsList = product ? productColors.filter((c) => c.product_id === product.id) : []

        // Float the dragged card between snap points
        const subOffset = isDragging ? dragOffset - (visualIdx - origIdx) * ITEM_H : 0

        return (
          <div
            key={id}
            className="mb-2"
            style={{
              transform:  isDragging ? `translateY(${subOffset}px) scale(1.025)` : 'translateY(0) scale(1)',
              transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.34,1.2,0.64,1)',
              zIndex:     isDragging ? 50 : 1,
              position:   'relative',
            }}
          >
            <Card className={`flex items-center gap-3 px-4 py-3.5
              transition-shadow duration-200
              ${isDragging ? 'shadow-lifted ring-1 ring-camel-200' : 'shadow-card'}`}
            >
              {/* Position number */}
              <span className="text-xs font-bold text-ink-300 tabular-nums w-5 text-center flex-shrink-0">
                {visualIdx + 1}
              </span>

              {/* Shot info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-900 truncate leading-snug">{shot.title}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {/* Priority */}
                  {shot.priority && shot.priority !== 'normal' && (
                    <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded
                      ${shot.priority === 'urgent' ? 'bg-rose-100 text-rose-400' : 'bg-camel-100 text-camel-500'}`}>
                      {shot.priority}
                    </span>
                  )}
                  {/* Product */}
                  {product && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-ink-100 text-ink-700 rounded-full">
                      {product.name}
                    </span>
                  )}
                  {/* Specific color */}
                  {color ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5
                      bg-ivory-200 text-ink-700 rounded-full">
                      <span className="w-3 h-3 rounded-full border border-white/60 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: color.hex_code }} />
                      {color.color_name}
                    </span>
                  ) : product ? (
                    /* All Colors — gradient swatch */
                    <span className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5
                      bg-ivory-200 text-ink-700 rounded-full">
                      <span className="w-3.5 h-3.5 rounded-full overflow-hidden border border-white/60 flex-shrink-0 flex">
                        {productColorsList.length > 0
                          ? productColorsList.slice(0, 4).map((c) => (
                              <span key={c.id} className="flex-1 h-full" style={{ backgroundColor: c.hex_code }} />
                            ))
                          : <span className="w-full h-full"
                              style={{ background: 'linear-gradient(135deg,#D4C9B5 0%,#A8906A 50%,#7A9B76 100%)' }} />
                        }
                      </span>
                      All Colors
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Reference image preview */}
              {shot.reference_image_url ? (
                <img
                  src={shot.reference_image_url}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-ivory-300"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-ivory-200 flex items-center justify-center flex-shrink-0">
                  <Image size={13} className="text-ink-300" />
                </div>
              )}

              {/* Drag handle */}
              <div
                onTouchStart={(e) => startDrag(e, id)}
                onMouseDown={(e)  => startDrag(e, id)}
                className="p-2 -mr-1 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
                style={{ touchAction: 'none' }}
              >
                <GripVertical
                  size={18}
                  className={`transition-colors duration-150 ${isDragging ? 'text-camel-400' : 'text-ink-200'}`}
                />
              </div>
            </Card>
          </div>
        )
      })}
    </div>
  )
}

// ─── Look group header ─────────────────────────────────────────────────────────
function LookGroupHeader({ product, color, done, total }) {
  return (
    <div className="flex items-center gap-2.5 px-1 pt-2 pb-1">
      {color && (
        <span className="w-3.5 h-3.5 rounded-full border border-ink-200 flex-shrink-0"
          style={{ backgroundColor: color.hex_code }} />
      )}
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-ink-700">
          {product?.name || 'Unknown'}
          {color ? ` · ${color.color_name}` : ''}
        </span>
      </div>
      <span className="text-[10px] font-medium text-ink-400 tabular-nums">
        {done}/{total}
      </span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ShootMode() {
  const navigate = useNavigate()
  const { shots, products, productColors, markShotDone, markShotPending, saveShootOrder } = useStore()
  const [filter,      setFilter]      = useState('all')
  const [viewMode,    setViewMode]    = useState('list')   // 'list' | 'look'
  const [undoShot,    setUndoShot]    = useState(null)
  const [sortPriority, setSortPriority] = useState(false)  // priority-first sort
  const [reorderMode,  setReorderMode]  = useState(false)
  const [localOrder,   setLocalOrder]   = useState(null)   // null = use store order
  const undoTimerRef = useRef(null)

  const productShots = shots.filter((s) => s.shot_type === 'product')
  const done  = productShots.filter((s) => s.status === 'done').length
  const total = productShots.length

  const filterOptions = [
    { key: 'all',         label: 'All'         },
    { key: 'pending',     label: 'Pending'     },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'done',        label: 'Done'        },
  ]

  // Sort shots: by localOrder (reorder mode) OR priority OR shot_number
  const sortedShots = (() => {
    const base = [...productShots].sort((a, b) => {
      if (sortPriority) {
        const pa = PRIORITY_ORDER[a.priority] ?? 2
        const pb = PRIORITY_ORDER[b.priority] ?? 2
        if (pa !== pb) return pa - pb
      }
      return (a.shot_number ?? 999) - (b.shot_number ?? 999)
    })
    if (localOrder) {
      const orderMap = {}
      localOrder.forEach((id, i) => { orderMap[id] = i })
      return [...base].sort((a, b) => (orderMap[a.id] ?? 999) - (orderMap[b.id] ?? 999))
    }
    return base
  })()

  const filtered = filter === 'all'
    ? sortedShots
    : sortedShots.filter((s) => s.status === filter)

  // Enter reorder mode
  const enterReorder = () => {
    setLocalOrder(sortedShots.map((s) => s.id))
    setReorderMode(true)
    setFilter('all')
  }

  // Exit reorder mode and save
  const exitReorder = async () => {
    setReorderMode(false)
    if (localOrder) {
      await saveShootOrder(localOrder)
      setLocalOrder(null)
    }
  }

  // ── Wrapped done/pending with undo ────────────────────────────────────────
  const handleDone = useCallback(async (shotId) => {
    await markShotDone(shotId)
    const shot = shots.find((s) => s.id === shotId)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setUndoShot(shot)
  }, [shots, markShotDone])

  const handlePending = useCallback(async (shotId) => {
    await markShotPending(shotId)
  }, [markShotPending])

  const handleUndo = useCallback(async () => {
    if (undoShot) await markShotPending(undoShot.id)
    setUndoShot(null)
  }, [undoShot, markShotPending])

  if (total === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-medium text-ink-900">Shoot Mode</h1>
          <p className="text-sm text-ink-400 mt-1">Execute your shots one by one</p>
        </div>
        <EmptyState icon={Image} title="No shots planned yet"
          subtitle="Add shots in Planning Mode, then come back here to execute." />
        <button onClick={() => navigate('/plan')} className="btn-primary w-full">
          Go to Planning Mode
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-medium text-ink-900">Shoot Mode</h1>
        <p className="text-sm text-ink-400 mt-1">
          {done === total && total > 0 ? '✓ All shots complete' : `${total - done} shots remaining`}
        </p>
      </div>

      {/* Progress card */}
      <Card className="p-4">
        <ProgressBar done={done} total={total} />
        <div className="flex gap-5 mt-3">
          <div>
            <p className="font-display text-2xl font-medium text-moss-500 leading-none">{done}</p>
            <p className="text-[10px] text-ink-400 uppercase tracking-wide mt-0.5">Done</p>
          </div>
          <div>
            <p className="font-display text-2xl font-medium text-ink-800 leading-none">{total - done}</p>
            <p className="text-[10px] text-ink-400 uppercase tracking-wide mt-0.5">Left</p>
          </div>
          <div>
            <p className="font-display text-2xl font-medium text-ink-400 leading-none">{total}</p>
            <p className="text-[10px] text-ink-400 uppercase tracking-wide mt-0.5">Total</p>
          </div>
        </div>
      </Card>

      {/* Focus Mode button */}
      <button
        onClick={() => navigate('/focus')}
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-ink-900 text-white active:bg-ink-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <Zap size={17} className="text-camel-300" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold leading-none mb-0.5">Enter Focus Mode</p>
            <p className="text-[11px] text-white/40">One shot at a time, full screen</p>
          </div>
        </div>
        <ChevronDown size={15} className="text-white/30 -rotate-90" />
      </button>

      {/* Controls */}
      {reorderMode ? (
        <div className="flex items-center justify-between bg-camel-50 border border-camel-200 rounded-xl px-4 py-2.5 animate-fade-in">
          <div className="flex items-center gap-2">
            <GripVertical size={14} className="text-camel-400" />
            <p className="text-sm font-medium text-ink-800">Reorder mode</p>
          </div>
          <button
            onClick={exitReorder}
            className="text-sm font-semibold text-camel-600 active:text-camel-700"
          >
            Save Order
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1 pb-1">
            {filterOptions.map((opt) => (
              <FilterChip key={opt.key} label={opt.label} active={filter === opt.key} onClick={() => setFilter(opt.key)} />
            ))}
          </div>
          {/* Priority sort */}
          <button
            onClick={() => setSortPriority((v) => !v)}
            className={`flex-shrink-0 px-2.5 h-8 rounded-full text-xs font-medium transition-colors
              ${sortPriority ? 'bg-camel-400 text-white' : 'bg-ivory-200 text-ink-500'}`}
            title="Priority first"
          >
            ↑ P
          </button>
          {/* Reorder */}
          <button
            onClick={enterReorder}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-ivory-200 text-ink-500 flex items-center justify-center"
            title="Reorder shots"
          >
            <GripVertical size={14} />
          </button>
          {/* View toggle */}
          <button
            onClick={() => setViewMode((v) => v === 'list' ? 'look' : 'list')}
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors
              ${viewMode === 'look' ? 'bg-ink-900 text-white' : 'bg-ivory-200 text-ink-500'}`}
          >
            {viewMode === 'look' ? <List size={14} /> : <Layers size={14} />}
          </button>
        </div>
      )}

      {/* Cards */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-ink-400">No {filter === 'all' ? '' : filter} shots</p>
        </Card>
      ) : reorderMode ? (
        // ── Drag-to-reorder list ──
        <DraggableReorderList
          shots={filtered}
          products={products}
          productColors={productColors}
          onChange={(newOrder) => setLocalOrder(newOrder)}
        />
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {filtered.map((shot, i) => (
            <ShotCard key={shot.id} shot={shot} globalIndex={i} onDone={handleDone} onPending={handlePending} />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {(() => {
            const lookGroups = (() => {
              const groups = {}
              filtered.forEach((shot) => {
                const key = `${shot.product_id || 'none'}__${shot.color_id || 'none'}`
                if (!groups[key]) groups[key] = { product_id: shot.product_id, color_id: shot.color_id, shots: [] }
                groups[key].shots.push(shot)
              })
              return Object.values(groups)
            })()
            return lookGroups.map((group) => {
              const product = products.find((p) => p.id === group.product_id)
              const color   = productColors.find((c) => c.id === group.color_id)
              const groupDone = group.shots.filter((s) => s.status === 'done').length
              return (
                <div key={`${group.product_id}-${group.color_id}`}>
                  <LookGroupHeader product={product} color={color} done={groupDone} total={group.shots.length} />
                  <div className="space-y-3">
                    {group.shots.map((shot, i) => (
                      <ShotCard key={shot.id} shot={shot} globalIndex={i} onDone={handleDone} onPending={handlePending} />
                    ))}
                  </div>
                </div>
              )
            })
          })()}
        </div>
      )}

      {/* Undo toast */}
      {undoShot && (
        <UndoToast
          shot={undoShot}
          onUndo={handleUndo}
          onDismiss={() => setUndoShot(null)}
        />
      )}
    </div>
  )
}
