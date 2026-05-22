import { useState, useEffect } from 'react'
import { Plus, Trash2, Camera, Video, Image as ImageIcon, ChevronLeft, Pencil, ExternalLink } from 'lucide-react'
import useStore from '../store/useStore'
import {
  Card, Button, Modal, Input, Textarea, Select,
  CreatorTag, StatusBadge, PriorityBadge, EmptyState,
  SectionHeader, ImageUploadButton, MediaCard,
} from '../components/ui'
import MediaModal from '../components/ui/MediaModal'
import { CATEGORY_LABELS, SHOT_TYPE_LABELS, LENS_FEEL_OPTIONS, MOVEMENT_OPTIONS, PAIRING_TYPE_CONFIG } from '../data/seedData'

const TABS = [
  { key: 'shots',    label: 'Shots'    },
  { key: 'poses',    label: 'Poses'    },
  { key: 'notes',    label: 'Notes'    },
  { key: 'products', label: 'Products' },
]

// ─── Media Type Picker (Step 1) ───────────────────────────────────────────────
function MediaTypePicker({ onSelect }) {
  return (
    <div className="space-y-4 wizard-step-enter">
      <div className="text-center pb-1">
        <h3 className="font-display text-lg font-medium text-ink-900">What are you shooting?</h3>
        <p className="text-sm text-ink-400 mt-1">Choose the format — fields will adjust</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* Photo */}
        <button
          onClick={() => onSelect('photo')}
          className="relative overflow-hidden bg-ivory-50 border-2 border-camel-200 rounded-2xl p-5
            text-left active:bg-camel-100/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-camel-100 flex items-center justify-center mb-3">
            <Camera size={20} className="text-camel-400" />
          </div>
          <p className="font-display text-base font-medium text-ink-900">Photo</p>
          <p className="text-xs text-ink-400 mt-1 leading-snug">Product shot, editorial, pose reference</p>
        </button>

        {/* Video */}
        <button
          onClick={() => onSelect('video')}
          className="relative overflow-hidden bg-ivory-50 border-2 border-moss-200 rounded-2xl p-5
            text-left active:bg-moss-100/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-moss-100 flex items-center justify-center mb-3">
            <Video size={20} className="text-moss-400" />
          </div>
          <p className="font-display text-base font-medium text-ink-900">Video / Reel</p>
          <p className="text-xs text-ink-400 mt-1 leading-snug">Movement, reel, BTS clip</p>
        </button>
      </div>
    </div>
  )
}

// ─── Add / Edit Shot Modal (multi-step) ──────────────────────────────────────
const EMPTY_SHOT_FORM = {
  title: '', description: '', product_id: '', color_id: '',
  shot_type: 'product', media_type: 'photo', priority: 'normal',
  orientation: '',
  pose_description: '', camera_angle: '', lens_feel: '',
  lighting_notes: '', styling_note: '', mood: '',
  reference_image_url: '', pinterest_url: '',
  reference_reel_url: '', movement: '', camera_motion: '',
  transition_note: '', audio_note: '',
  notes: '',
}

const ORIENTATION_OPTIONS = [
  {
    value: 'portrait',
    label: 'Portrait',
    sub: '9:16 · 4:5',
    frameW: 'w-7',
    frameH: 'h-11',
    active: 'border-camel-400 bg-camel-50',
    dot:    'bg-camel-200',
  },
  {
    value: 'landscape',
    label: 'Landscape',
    sub: '16:9 · 3:2',
    frameW: 'w-11',
    frameH: 'h-7',
    active: 'border-moss-400 bg-moss-50',
    dot:    'bg-moss-200',
  },
]

function AddShotModal({ open, onClose, shotToEdit = null }) {
  const { addShot, updateShot, products, productColors, stylingPairings, addStylingPairing, updateStylingPairing, deleteStylingPairing, uploadImage } = useStore()
  const isEditing = !!shotToEdit
  const [step, setStep]           = useState(1)
  const [uploading, setUploading] = useState(false)
  const [form, setForm]           = useState(EMPTY_SHOT_FORM)
  const [addingPairing,  setAddingPairing]  = useState(false)
  const [pairingForm,    setPairingForm]    = useState({ type: 'shirt', description: '' })
  const [editingPairing, setEditingPairing] = useState(null)   // pairing object being edited inline

  // Re-populate form whenever the modal opens or the shot being edited changes
  useEffect(() => {
    if (open) {
      if (shotToEdit) {
        setStep(2)
        setForm({ ...EMPTY_SHOT_FORM, ...shotToEdit,
          product_id: shotToEdit.product_id || '',
          color_id:   shotToEdit.color_id   || '',
        })
      } else {
        setStep(1)
        setForm(EMPTY_SHOT_FORM)
      }
    }
  }, [open, shotToEdit?.id])

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const colors = productColors.filter((c) => c.product_id === form.product_id)
  const isPhoto = form.media_type === 'photo'

  const handleMediaTypePick = (type) => {
    set('media_type', type)
    setStep(2)
  }

  const handleImageUpload = async (file) => {
    setUploading(true)
    try {
      const url = await uploadImage(file)
      set('reference_image_url', url)
    } catch (e) {
      console.error(e)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return
    if (isEditing) {
      await updateShot(shotToEdit.id, { ...form })
    } else {
      await addShot({ ...form })
    }
    resetAndClose()
  }

  const resetAndClose = () => {
    setStep(1)
    setForm(EMPTY_SHOT_FORM)
    setAddingPairing(false)
    setPairingForm({ type: 'shirt', description: '' })
    onClose()
  }

  // Style With pairings for the currently selected product/color
  const existingPairings = form.product_id
    ? stylingPairings.filter(
        (p) => p.product_id === form.product_id &&
          (!p.color_id || !form.color_id || p.color_id === form.color_id)
      )
    : []

  const handleAddPairing = async () => {
    if (!pairingForm.description.trim() || !form.product_id) return
    await addStylingPairing({
      ...pairingForm,
      product_id: form.product_id,
      color_id:   form.color_id || null,
    })
    setPairingForm({ type: 'shirt', description: '' })
    setAddingPairing(false)
  }

  const modalTitle = isEditing
    ? `Edit ${form.media_type === 'video' ? 'Video' : 'Photo'} Shot`
    : step === 1 ? 'New Shot' : `New ${isPhoto ? 'Photo' : 'Video'} Shot`

  return (
    <Modal open={open} onClose={resetAndClose} title={modalTitle}>
      {step === 1 && !isEditing ? (
        <MediaTypePicker onSelect={handleMediaTypePick} />
      ) : (
        <div className="space-y-3 wizard-step-enter">
          {/* Back + type indicator */}
          <div className="flex items-center gap-3 pb-1 border-b border-ivory-200 -mx-0 px-0">
            {!isEditing && (
              <button onClick={() => setStep(1)} className="text-ink-400 active:text-ink-900 flex items-center gap-1 text-sm">
                <ChevronLeft size={16} /> Change
              </button>
            )}
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ml-auto
              ${isPhoto ? 'bg-camel-100 text-camel-500' : 'bg-moss-100 text-moss-500'}`}>
              {isPhoto ? '📷 Photo' : '🎬 Video'}
            </span>
          </div>

          {/* Core info */}
          <Input label="Shot Title *" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Slouch against wall" />
          <Textarea label="Execution Description" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="How to set up and execute this shot…" rows={2} />

          <div className="grid grid-cols-2 gap-3">
            <Select label="Priority" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
              <option value="high">High Priority</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
              <option value="optional">Optional</option>
            </Select>
            <Select label="Shot Type" value={form.shot_type} onChange={(e) => set('shot_type', e.target.value)}>
              {Object.entries(SHOT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>

          {/* ── Orientation ── */}
          <div>
            <label className="text-xs font-medium text-ink-400 uppercase tracking-wide block mb-2">
              Frame Orientation
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ORIENTATION_OPTIONS.map((opt) => {
                const isActive = form.orientation === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('orientation', isActive ? '' : opt.value)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all duration-150
                      ${isActive ? opt.active + ' border-opacity-100' : 'border-ivory-200 bg-ivory-100 active:bg-ivory-200'}`}
                  >
                    {/* Frame shape */}
                    <div className={`${opt.frameW} ${opt.frameH} rounded border-2 flex-shrink-0 flex items-center justify-center
                      ${isActive ? (opt.value === 'portrait' ? 'border-camel-400' : 'border-moss-400') : 'border-ink-200'}`}>
                      <div className={`rounded-sm ${isActive ? opt.dot : 'bg-ink-100'}
                        ${opt.value === 'portrait' ? 'w-2 h-5' : 'w-5 h-2'}`} />
                    </div>
                    <div className="text-left min-w-0">
                      <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-ink-900' : 'text-ink-600'}`}>
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-ink-400 mt-0.5">{opt.sub}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <Select label="Product" value={form.product_id} onChange={(e) => { set('product_id', e.target.value); set('color_id', '') }}>
            <option value="">Select product…</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {CATEGORY_LABELS[p.category]}</option>)}
          </Select>

          {colors.length > 0 && (
            <Select label="Colorway" value={form.color_id} onChange={(e) => set('color_id', e.target.value)}>
              <option value="">All colorways</option>
              {colors.map((c) => <option key={c.id} value={c.id}>{c.color_name}</option>)}
            </Select>
          )}

          {/* ── PHOTO FIELDS ── */}
          {isPhoto && (
            <>
              <div className="pt-1 pb-0.5 border-t border-ivory-200">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-ink-400 uppercase">Visual Direction</p>
              </div>

              <Textarea label="Pose" value={form.pose_description} onChange={(e) => set('pose_description', e.target.value)} placeholder="Body position, energy, expression…" rows={2} />

              <div className="grid grid-cols-2 gap-3">
                <Input label="Camera Angle" value={form.camera_angle} onChange={(e) => set('camera_angle', e.target.value)} placeholder="Low / Eye level / OTS" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-ink-400 uppercase tracking-wide">Lens Feel</label>
                  <select value={form.lens_feel} onChange={(e) => set('lens_feel', e.target.value)}
                    className="w-full bg-ivory-200 border-0 rounded-xl px-3 py-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-camel-300">
                    <option value="">Select…</option>
                    {LENS_FEEL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Lighting" value={form.lighting_notes} onChange={(e) => set('lighting_notes', e.target.value)} placeholder="Soft window, harsh, golden…" />
                <Input label="Mood" value={form.mood} onChange={(e) => set('mood', e.target.value)} placeholder="Effortless, editorial…" />
              </div>

              <Input label="Styling Note" value={form.styling_note} onChange={(e) => set('styling_note', e.target.value)} placeholder="Shirt tucked, belt, barefoot…" />
              <Input label="Pinterest / Ref Link" value={form.pinterest_url} onChange={(e) => set('pinterest_url', e.target.value)} placeholder="https://pin.it/…" type="url" />

              {/* Reference image upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-400 uppercase tracking-wide">Reference Image</label>
                {form.reference_image_url ? (
                  <div className="relative">
                    <img src={form.reference_image_url} alt="Ref" className="w-full aspect-[4/5] object-cover rounded-xl" />
                    <button onClick={() => set('reference_image_url', '')}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink-900/60 text-white flex items-center justify-center">
                      <Trash2 size={11} />
                    </button>
                  </div>
                ) : (
                  <ImageUploadButton onUpload={handleImageUpload}>
                    <div className="w-full h-28 bg-ivory-200 rounded-xl flex flex-col items-center justify-center gap-2
                      border-2 border-dashed border-ivory-300 cursor-pointer">
                      <ImageIcon size={20} className="text-ink-400" />
                      <span className="text-xs text-ink-400">{uploading ? 'Uploading…' : 'Upload reference image'}</span>
                    </div>
                  </ImageUploadButton>
                )}
              </div>
            </>
          )}

          {/* ── VIDEO FIELDS ── */}
          {!isPhoto && (
            <>
              <div className="pt-1 pb-0.5 border-t border-ivory-200">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-ink-400 uppercase">Video Direction</p>
              </div>

              <Input label="Reel / Video Reference URL" value={form.reference_reel_url} onChange={(e) => set('reference_reel_url', e.target.value)} placeholder="Instagram / TikTok / YouTube link" type="url" />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-400 uppercase tracking-wide">Movement</label>
                <select value={form.movement} onChange={(e) => set('movement', e.target.value)}
                  className="w-full bg-ivory-200 border-0 rounded-xl px-3 py-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-camel-300">
                  <option value="">Select movement…</option>
                  {MOVEMENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Camera Motion" value={form.camera_motion} onChange={(e) => set('camera_motion', e.target.value)} placeholder="Handheld, dolly, static…" />
                <Input label="Mood / Energy" value={form.mood} onChange={(e) => set('mood', e.target.value)} placeholder="Dreamy, raw, punchy…" />
              </div>

              <Input label="Transition Style" value={form.transition_note} onChange={(e) => set('transition_note', e.target.value)} placeholder="Cut, whip pan, morph…" />
              <Input label="Audio / Music Note" value={form.audio_note} onChange={(e) => set('audio_note', e.target.value)} placeholder="Trending sound, no audio, ambient…" />
              <Input label="Styling Note" value={form.styling_note} onChange={(e) => set('styling_note', e.target.value)} placeholder="Outfit detail, accessories…" />
            </>
          )}

          {/* ── Style With ── */}
          {form.product_id && (
            <div className="pt-1 border-t border-ivory-200 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-ink-400">
                  Style With{existingPairings.length > 0 ? ` (${existingPairings.length})` : ''}
                </p>
                <button
                  type="button"
                  onClick={() => setAddingPairing((v) => !v)}
                  className="flex items-center gap-1 text-xs font-medium text-camel-500 active:text-camel-600"
                >
                  <Plus size={11} /> Add
                </button>
              </div>

              {/* Existing pairings */}
              {existingPairings.length > 0 && (
                <div className="space-y-1.5">
                  {existingPairings.map((p) => {
                    const cfg = PAIRING_TYPE_CONFIG[p.type] || PAIRING_TYPE_CONFIG.note
                    const isEditingThis = editingPairing?.id === p.id
                    return (
                      <div key={p.id}>
                        {isEditingThis ? (
                          /* Inline edit form */
                          <div className="space-y-2 bg-ivory-100 rounded-xl p-3 animate-slide-down">
                            <select
                              value={editingPairing.type}
                              onChange={(e) => setEditingPairing((ep) => ({ ...ep, type: e.target.value }))}
                              className="w-full bg-ivory-200 border-0 rounded-xl px-3 py-2 text-sm text-ink-900
                                focus:outline-none focus:ring-2 focus:ring-camel-300"
                            >
                              {Object.entries(PAIRING_TYPE_CONFIG).map(([k, v]) => (
                                <option key={k} value={k}>{v.icon} {v.label}</option>
                              ))}
                            </select>
                            <textarea
                              value={editingPairing.description}
                              onChange={(e) => setEditingPairing((ep) => ({ ...ep, description: e.target.value }))}
                              rows={2}
                              className="w-full bg-ivory-200 border-0 rounded-xl px-3 py-2 text-sm text-ink-900
                                placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-camel-300 resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  await updateStylingPairing(editingPairing.id, {
                                    type: editingPairing.type,
                                    description: editingPairing.description,
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
                                type="button"
                                onClick={() => setEditingPairing(null)}
                                className="px-4 py-2 rounded-xl text-xs font-medium bg-ivory-200 text-ink-600 active:bg-ivory-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Normal display row */
                          <div className="flex items-start gap-2 bg-ivory-100 rounded-xl px-3 py-2.5">
                            <span className="text-sm leading-none mt-0.5 flex-shrink-0">{cfg.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wide mb-0.5">{cfg.label}</p>
                              <p className="text-xs text-ink-800 leading-snug">{p.description}</p>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => setEditingPairing({ ...p })}
                                className="p-1 text-ink-300 active:text-camel-500"
                              >
                                <Pencil size={10} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteStylingPairing(p.id)}
                                className="p-1 text-ink-300 active:text-earth-400"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Quick-add form */}
              {addingPairing && (
                <div className="space-y-2 animate-slide-down bg-ivory-100 rounded-xl p-3">
                  <select
                    value={pairingForm.type}
                    onChange={(e) => setPairingForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full bg-ivory-200 border-0 rounded-xl px-3 py-2.5 text-sm text-ink-900
                      focus:outline-none focus:ring-2 focus:ring-camel-300"
                  >
                    {Object.entries(PAIRING_TYPE_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                  <textarea
                    value={pairingForm.description}
                    onChange={(e) => setPairingForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="e.g. White linen shirt, worn open…"
                    rows={2}
                    className="w-full bg-ivory-200 border-0 rounded-xl px-3 py-2.5 text-sm text-ink-900
                      placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-camel-300 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddPairing}
                      disabled={!pairingForm.description.trim()}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold bg-ink-900 text-white
                        disabled:opacity-40 active:bg-ink-800"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddingPairing(false); setPairingForm({ type: 'shirt', description: '' }) }}
                      className="px-4 py-2 rounded-xl text-xs font-medium bg-ivory-200 text-ink-600 active:bg-ivory-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shared notes */}
          <div className="pt-1 border-t border-ivory-200">
            <Textarea label="Notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Shoot day reminder, variation idea…" rows={2} />
          </div>

          <Button variant="primary" size="full" onClick={handleSubmit} disabled={!form.title.trim()}>
            {isEditing ? 'Save Changes' : `Add ${isPhoto ? 'Photo' : 'Video'} Shot`}
          </Button>
        </div>
      )}
    </Modal>
  )
}

// ─── Shot Detail Modal ────────────────────────────────────────────────────────
function ShotDetailModal({ open, onClose, shot, onEdit }) {
  const { products, productColors } = useStore()
  const [mediaOpen, setMediaOpen] = useState(false)

  if (!shot) return null

  const product   = products.find((p) => p.id === shot.product_id)
  const color     = productColors.find((c) => c.id === shot.color_id)
  const isVideo   = shot.media_type === 'video'
  const hasImage  = !isVideo && shot.reference_image_url

  const MetaItem = ({ label, value }) => value ? (
    <div>
      <p className="meta-label">{label}</p>
      <p className="text-sm text-ink-800 leading-snug">{value}</p>
    </div>
  ) : null

  return (
    <>
      <Modal open={open} onClose={onClose} title="Shot Detail">
        <div className="space-y-4 -mx-1">

          {/* Reference image */}
          {hasImage && (
            <button
              onClick={() => setMediaOpen(true)}
              className="w-full relative overflow-hidden rounded-xl bg-ivory-200 img-overlay-bottom block -mx-0"
            >
              <img
                src={shot.reference_image_url}
                alt="Reference"
                className="w-full h-auto block"
              />
              <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                Tap to expand
              </div>
            </button>
          )}

          {/* Title + badges */}
          <div>
            <h2 className="font-display text-xl font-medium text-ink-900 leading-snug mb-2">
              {shot.title}
            </h2>
            <div className="flex flex-wrap gap-2 items-center">
              <StatusBadge status={shot.status} />
              <PriorityBadge priority={shot.priority} />
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full
                ${isVideo ? 'bg-moss-100 text-moss-500' : 'bg-camel-100 text-camel-400'}`}>
                {isVideo ? '🎬 Video' : '📷 Photo'}
              </span>
              {shot.orientation && (
                <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 bg-ivory-200 text-ink-600 rounded-full">
                  <span className={`border border-ink-300 rounded-sm inline-block flex-shrink-0
                    ${shot.orientation === 'portrait' ? 'w-2 h-3' : 'w-3 h-2'}`} />
                  {shot.orientation === 'portrait' ? 'Portrait' : 'Landscape'}
                </span>
              )}
              {product && (
                <span className="text-xs font-medium text-ink-600 bg-ivory-200 px-2 py-0.5 rounded-full">
                  {product.name}
                </span>
              )}
              {color ? (
                <span className="flex items-center gap-1 text-xs text-ink-600 bg-ivory-200 px-2 py-0.5 rounded-full">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.hex_code }} />
                  {color.color_name}
                </span>
              ) : product ? (
                <span className="text-[10px] font-medium px-2 py-0.5 bg-camel-100 text-camel-500 rounded-full">
                  All Colors
                </span>
              ) : null}
            </div>
          </div>

          {/* Description */}
          {shot.description && (
            <div className="border-t border-ivory-200 pt-4">
              <p className="meta-label mb-1">Execution</p>
              <p className="text-sm text-ink-700 leading-relaxed">{shot.description}</p>
            </div>
          )}

          {/* Photo fields */}
          {!isVideo && (shot.pose_description || shot.camera_angle || shot.lens_feel || shot.lighting_notes || shot.mood || shot.styling_note) && (
            <div className="border-t border-ivory-200 pt-4 space-y-3">
              <MetaItem label="Pose" value={shot.pose_description} />
              {(shot.camera_angle || shot.lens_feel || shot.lighting_notes || shot.mood) && (
                <div className="grid grid-cols-2 gap-3">
                  <MetaItem label="Camera Angle" value={shot.camera_angle} />
                  <MetaItem label="Lens Feel"    value={shot.lens_feel} />
                  <MetaItem label="Lighting"     value={shot.lighting_notes} />
                  <MetaItem label="Mood"         value={shot.mood} />
                </div>
              )}
              <MetaItem label="Styling" value={shot.styling_note} />
            </div>
          )}

          {/* Video fields */}
          {isVideo && (shot.movement || shot.camera_motion || shot.transition_note || shot.audio_note) && (
            <div className="border-t border-ivory-200 pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <MetaItem label="Movement"      value={shot.movement} />
                <MetaItem label="Camera Motion" value={shot.camera_motion} />
                <MetaItem label="Transition"    value={shot.transition_note} />
                <MetaItem label="Audio"         value={shot.audio_note} />
                <MetaItem label="Mood"          value={shot.mood} />
              </div>
            </div>
          )}

          {/* Links */}
          {(shot.pinterest_url || shot.reference_reel_url) && (
            <div className="border-t border-ivory-200 pt-4 space-y-2">
              {[shot.pinterest_url, shot.reference_reel_url].filter(Boolean).map((url) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-camel-500 bg-camel-100/40 rounded-xl px-3 py-2.5 active:bg-camel-100">
                  <ExternalLink size={12} />
                  <span className="truncate">{url}</span>
                </a>
              ))}
            </div>
          )}

          {/* Notes */}
          {shot.notes && (
            <div className="border-t border-ivory-200 pt-4">
              <p className="meta-label mb-1">Notes</p>
              <p className="text-sm text-ink-700 leading-relaxed">{shot.notes}</p>
            </div>
          )}

          {/* Edit button */}
          <div className="border-t border-ivory-200 pt-4">
            <button
              onClick={() => { onClose(); setTimeout(() => onEdit(shot), 100) }}
              className="w-full py-3 rounded-xl text-sm font-medium bg-ivory-200 text-ink-800
                active:bg-ivory-300 transition-colors flex items-center justify-center gap-2"
            >
              <Pencil size={14} /> Edit Shot
            </button>
          </div>
        </div>
      </Modal>

      {hasImage && (
        <MediaModal
          open={mediaOpen}
          images={[{ url: shot.reference_image_url, caption: shot.title }]}
          onClose={() => setMediaOpen(false)}
        />
      )}
    </>
  )
}

// ─── Shot row ─────────────────────────────────────────────────────────────────
function ShotRow({ shot, onEdit }) {
  const { products, productColors, deleteShot } = useStore()
  const [detailOpen, setDetailOpen] = useState(false)

  const product      = products.find((p) => p.id === shot.product_id)
  const color        = productColors.find((c) => c.id === shot.color_id)
  const productColorsList = product ? productColors.filter((c) => c.product_id === product.id) : []
  const hasImage     = shot.media_type !== 'video' && shot.reference_image_url

  return (
    <>
      <div className="flex items-start gap-3 py-3 border-b border-ivory-200 last:border-0">
        {/* Tappable body → opens detail */}
        <button
          onClick={() => setDetailOpen(true)}
          className="flex-1 min-w-0 text-left active:opacity-70 transition-opacity"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-ink-900">{shot.title}</p>
            {shot.media_type && (
              <span className="text-[10px] text-ink-400">{shot.media_type === 'video' ? '🎬' : '📷'}</span>
            )}
            {shot.orientation && (
              <span className="flex items-center gap-1 text-[10px] text-ink-400">
                <span className={`border border-ink-300 rounded-sm inline-block
                  ${shot.orientation === 'portrait' ? 'w-1.5 h-2.5' : 'w-2.5 h-1.5'}`} />
                {shot.orientation === 'portrait' ? 'Portrait' : 'Landscape'}
              </span>
            )}
            {hasImage && (
              <span className="text-[10px] text-ink-300">· has ref</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
            <StatusBadge status={shot.status} />
            <PriorityBadge priority={shot.priority} />

            {/* Product name — solid pill */}
            {product && (
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-ink-100 text-ink-700 rounded-full">
                {product.name}
              </span>
            )}

            {/* Specific color — colored circle + name */}
            {color && (
              <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5
                bg-ivory-200 text-ink-700 rounded-full">
                <span className="w-3 h-3 rounded-full border border-white/60 shadow-sm flex-shrink-0"
                  style={{ backgroundColor: color.hex_code }} />
                {color.color_name}
              </span>
            )}

            {/* All Colors — mini gradient swatch from product colors */}
            {product && !color && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5
                bg-ivory-200 text-ink-700 rounded-full">
                {/* Color strip circle */}
                <span className="w-3.5 h-3.5 rounded-full overflow-hidden border border-white/60 shadow-sm flex-shrink-0 flex">
                  {productColorsList.length > 0
                    ? productColorsList.slice(0, 4).map((c) => (
                        <span key={c.id} className="flex-1 h-full" style={{ backgroundColor: c.hex_code }} />
                      ))
                    : <span className="w-full h-full"
                        style={{ background: 'linear-gradient(135deg, #D4C9B5 0%, #A8906A 50%, #7A9B76 100%)' }} />
                  }
                </span>
                All Colors
              </span>
            )}

            <CreatorTag creator={shot.creator} />
          </div>
          {shot.description && <p className="text-xs text-ink-400 mt-1 line-clamp-1">{shot.description}</p>}
        </button>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
          <button onClick={() => onEdit(shot)} className="p-1.5 text-ink-300 active:text-camel-400">
            <Pencil size={13} />
          </button>
          <button onClick={() => deleteShot(shot.id)} className="p-1.5 text-ink-300 active:text-earth-400">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <ShotDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        shot={shot}
        onEdit={onEdit}
      />
    </>
  )
}

// ─── Pose Ideas tab ───────────────────────────────────────────────────────────
function PoseIdeas() {
  const { shots, addShot, deleteShot } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [title, setTitle]     = useState('')
  const [desc, setDesc]       = useState('')

  const poses = shots.filter((s) => s.pose_description)

  const handleAdd = async () => {
    if (!title.trim()) return
    await addShot({ title, pose_description: desc, shot_type: 'product', media_type: 'photo' })
    setTitle(''); setDesc(''); setAddOpen(false)
  }

  return (
    <div className="space-y-3">
      <SectionHeader title="Pose Ideas"
        action={<Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}><Plus size={14} />Add</Button>} />
      {addOpen && (
        <Card className="p-4 space-y-3 animate-slide-down">
          <Input label="Pose title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lean on wall, half-turn" />
          <Textarea label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Body position, energy, expression…" rows={2} />
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleAdd}>Save</Button>
            <Button variant="ghost"   size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
          </div>
        </Card>
      )}
      {poses.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No pose ideas yet" subtitle="Add a shot with a pose description" />
      ) : (
        <Card className="px-4 divide-y divide-ivory-200">
          {poses.map((s) => (
            <div key={s.id} className="py-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink-900">{s.title}</p>
                <p className="text-sm text-ink-600 mt-0.5 leading-relaxed">{s.pose_description}</p>
                <CreatorTag creator={s.creator} />
              </div>
              <button onClick={() => deleteShot(s.id)} className="p-1 text-ink-300 active:text-earth-400 flex-shrink-0 mt-0.5">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

// ─── Notes tab ────────────────────────────────────────────────────────────────
function QuickNotes() {
  const { shots, addShot, deleteShot } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [title, setTitle]     = useState('')
  const [note, setNote]       = useState('')

  const noteShots = shots.filter((s) => s.notes && !s.product_id && s.shot_type === 'product')

  const handleAdd = async () => {
    if (!title.trim() && !note.trim()) return
    await addShot({ title: title || 'Note', notes: note, shot_type: 'product', media_type: 'photo' })
    setTitle(''); setNote(''); setAddOpen(false)
  }

  return (
    <div className="space-y-3">
      <SectionHeader title="Notes"
        action={<Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}><Plus size={14} />Add</Button>} />
      {addOpen && (
        <Card className="p-4 space-y-3 animate-slide-down">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's the note about?" />
          <Textarea label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything to remember for shoot day…" rows={3} />
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleAdd}>Save</Button>
            <Button variant="ghost"   size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
          </div>
        </Card>
      )}
      {noteShots.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No notes yet" subtitle="Add general notes for the shoot" />
      ) : (
        <div className="space-y-2">
          {noteShots.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-ink-900">{s.title}</p>
                <button onClick={() => deleteShot(s.id)} className="p-1 text-ink-300 active:text-earth-400">
                  <Trash2 size={13} />
                </button>
              </div>
              <p className="text-sm text-ink-600 mt-1 leading-relaxed">{s.notes}</p>
              <div className="mt-2"><CreatorTag creator={s.creator} /></div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Products tab ─────────────────────────────────────────────────────────────
function ProductsTab() {
  const { products, productColors, addProduct, addProductColor } = useStore()
  const [addProdOpen, setAddProdOpen] = useState(false)
  const [addColorId,  setAddColorId]  = useState(null)
  const [prodForm,    setProdForm]    = useState({ name: '', category: 'pants', description: '' })
  const [colorForm,   setColorForm]   = useState({ color_name: '', hex_code: '#D4C9B5' })

  const handleAddProduct = async () => {
    if (!prodForm.name.trim()) return
    await addProduct(prodForm)
    setProdForm({ name: '', category: 'pants', description: '' })
    setAddProdOpen(false)
  }

  const handleAddColor = async (productId) => {
    if (!colorForm.color_name.trim()) return
    await addProductColor({ ...colorForm, product_id: productId })
    setColorForm({ color_name: '', hex_code: '#D4C9B5' })
    setAddColorId(null)
  }

  return (
    <div className="space-y-3">
      <SectionHeader title="Products"
        action={<Button variant="ghost" size="sm" onClick={() => setAddProdOpen(true)}><Plus size={14} />Add</Button>} />
      {addProdOpen && (
        <Card className="p-4 space-y-3 animate-slide-down">
          <Input label="Product Name *" value={prodForm.name} onChange={(e) => setProdForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Linen Pants" />
          <Select label="Category" value={prodForm.category} onChange={(e) => setProdForm((p) => ({ ...p, category: e.target.value }))}>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Textarea label="Description" value={prodForm.description} onChange={(e) => setProdForm((p) => ({ ...p, description: e.target.value }))} placeholder="Brief product description…" rows={2} />
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleAddProduct}>Add Product</Button>
            <Button variant="ghost"   size="sm" onClick={() => setAddProdOpen(false)}>Cancel</Button>
          </div>
        </Card>
      )}
      <div className="space-y-2">
        {products.map((prod) => {
          const colors = productColors.filter((c) => c.product_id === prod.id)
          return (
            <Card key={prod.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-ink-900">{prod.name}</p>
                  <p className="text-xs text-ink-400">{CATEGORY_LABELS[prod.category]}</p>
                </div>
                <button onClick={() => setAddColorId(prod.id)} className="text-xs text-camel-500 flex items-center gap-1">
                  <Plus size={12} /> Color
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <div key={c.id} className="flex items-center gap-1.5 bg-ivory-200 rounded-lg px-2 py-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex_code }} />
                    <span className="text-xs text-ink-700">{c.color_name}</span>
                  </div>
                ))}
              </div>
              {addColorId === prod.id && (
                <div className="mt-3 flex gap-2 items-end animate-slide-down">
                  <Input label="Color name" value={colorForm.color_name}
                    onChange={(e) => setColorForm((p) => ({ ...p, color_name: e.target.value }))}
                    placeholder="e.g. Olive" className="flex-1" />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-ink-400 uppercase tracking-wide">Hex</label>
                    <input type="color" value={colorForm.hex_code}
                      onChange={(e) => setColorForm((p) => ({ ...p, hex_code: e.target.value }))}
                      className="w-12 h-10 rounded-lg cursor-pointer border-0 bg-ivory-200 p-1" />
                  </div>
                  <Button variant="primary" size="sm" onClick={() => handleAddColor(prod.id)}>Add</Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PlanningMode() {
  const { shots } = useStore()
  const [activeTab,   setActiveTab]   = useState('shots')
  const [addShotOpen, setAddShotOpen] = useState(false)
  const [editShot,    setEditShot]    = useState(null)

  const productShots = shots.filter((s) => s.shot_type === 'product')

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-ink-900">Planning</h1>
          <p className="text-sm text-ink-400 mt-1">{productShots.length} shots planned</p>
        </div>
        {activeTab === 'shots' && (
          <Button variant="primary" size="sm" onClick={() => setAddShotOpen(true)}>
            <Plus size={14} /> Add Shot
          </Button>
        )}
      </div>

      <div className="flex gap-0 border-b border-ivory-200 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px
              ${activeTab === tab.key ? 'text-ink-900 border-ink-900' : 'text-ink-400 border-transparent'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'shots' && (
        <div className="space-y-2">
          {productShots.length === 0 ? (
            <EmptyState icon={ImageIcon} title="No shots yet" subtitle="Add your first shot to start planning" />
          ) : (
            <Card className="px-4 divide-y divide-ivory-200">
              {productShots.map((s) => <ShotRow key={s.id} shot={s} onEdit={setEditShot} />)}
            </Card>
          )}
        </div>
      )}

      {activeTab === 'poses'    && <PoseIdeas />}
      {activeTab === 'notes'    && <QuickNotes />}
      {activeTab === 'products' && <ProductsTab />}

      <AddShotModal open={addShotOpen} onClose={() => setAddShotOpen(false)} />
      <AddShotModal open={!!editShot} onClose={() => setEditShot(null)} shotToEdit={editShot} />
    </div>
  )
}
