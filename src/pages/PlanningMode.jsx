import { useState } from 'react'
import { Plus, Trash2, Camera, Video, Image as ImageIcon, ChevronLeft } from 'lucide-react'
import useStore from '../store/useStore'
import {
  Card, Button, Modal, Input, Textarea, Select,
  CreatorTag, StatusBadge, PriorityBadge, EmptyState,
  SectionHeader, ImageUploadButton, MediaCard,
} from '../components/ui'
import { CATEGORY_LABELS, SHOT_TYPE_LABELS, LENS_FEEL_OPTIONS, MOVEMENT_OPTIONS } from '../data/seedData'

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

// ─── Add Shot Modal (multi-step) ─────────────────────────────────────────────
function AddShotModal({ open, onClose }) {
  const { addShot, products, productColors, uploadImage } = useStore()
  const [step, setStep]         = useState(1)   // 1 = pick type, 2 = fill form
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', product_id: '', color_id: '',
    shot_type: 'product', media_type: 'photo', priority: 'normal',
    // photo fields
    pose_description: '', camera_angle: '', lens_feel: '',
    lighting_notes: '', styling_note: '', mood: '',
    reference_image_url: '', pinterest_url: '',
    // video fields
    reference_reel_url: '', movement: '', camera_motion: '',
    transition_note: '', audio_note: '',
    // shared
    notes: '',
  })

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
    await addShot({ ...form })
    resetAndClose()
  }

  const resetAndClose = () => {
    setStep(1)
    setForm({
      title: '', description: '', product_id: '', color_id: '',
      shot_type: 'product', media_type: 'photo', priority: 'normal',
      pose_description: '', camera_angle: '', lens_feel: '',
      lighting_notes: '', styling_note: '', mood: '',
      reference_image_url: '', pinterest_url: '',
      reference_reel_url: '', movement: '', camera_motion: '',
      transition_note: '', audio_note: '',
      notes: '',
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={resetAndClose} title={step === 1 ? 'New Shot' : `New ${isPhoto ? 'Photo' : 'Video'} Shot`}>
      {step === 1 ? (
        <MediaTypePicker onSelect={handleMediaTypePick} />
      ) : (
        <div className="space-y-3 wizard-step-enter">
          {/* Back + type indicator */}
          <div className="flex items-center gap-3 pb-1 border-b border-ivory-200 -mx-0 px-0">
            <button onClick={() => setStep(1)} className="text-ink-400 active:text-ink-900 flex items-center gap-1 text-sm">
              <ChevronLeft size={16} /> Change
            </button>
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

          {/* Shared notes */}
          <div className="pt-1 border-t border-ivory-200">
            <Textarea label="Notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Shoot day reminder, variation idea…" rows={2} />
          </div>

          <Button variant="primary" size="full" onClick={handleSubmit} disabled={!form.title.trim()}>
            Add {isPhoto ? 'Photo' : 'Video'} Shot
          </Button>
        </div>
      )}
    </Modal>
  )
}

// ─── Shot row ─────────────────────────────────────────────────────────────────
function ShotRow({ shot }) {
  const { products, productColors, deleteShot } = useStore()
  const product = products.find((p) => p.id === shot.product_id)
  const color   = productColors.find((c) => c.id === shot.color_id)

  return (
    <div className="flex items-start gap-3 py-3 border-b border-ivory-200 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-ink-900">{shot.title}</p>
              {shot.media_type && (
                <span className="text-[10px] text-ink-400">{shot.media_type === 'video' ? '🎬' : '📷'}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <StatusBadge status={shot.status} />
              <PriorityBadge priority={shot.priority} />
              {product && <span className="text-xs text-ink-400">{product.name}</span>}
              {color && (
                <span className="flex items-center gap-1 text-xs text-ink-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.hex_code }} />
                  {color.color_name}
                </span>
              )}
              <CreatorTag creator={shot.creator} />
            </div>
          </div>
          <button onClick={() => deleteShot(shot.id)} className="p-1.5 text-ink-300 active:text-earth-400 flex-shrink-0 mt-0.5">
            <Trash2 size={13} />
          </button>
        </div>
        {shot.description && <p className="text-xs text-ink-400 mt-1 line-clamp-1">{shot.description}</p>}
      </div>
    </div>
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
              {productShots.map((s) => <ShotRow key={s.id} shot={s} />)}
            </Card>
          )}
        </div>
      )}

      {activeTab === 'poses'    && <PoseIdeas />}
      {activeTab === 'notes'    && <QuickNotes />}
      {activeTab === 'products' && <ProductsTab />}

      <AddShotModal open={addShotOpen} onClose={() => setAddShotOpen(false)} />
    </div>
  )
}
