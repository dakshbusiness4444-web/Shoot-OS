import { useState } from 'react'
import { ChevronRight, Plus, Trash2, ExternalLink, Shirt } from 'lucide-react'
import useStore from '../store/useStore'
import {
  Card, Button, Modal, Input, Textarea, Select,
  ColorSwatch, CreatorTag, EmptyState, FilterChip,
  MediaCard, ImageUploadButton,
} from '../components/ui'
import { CATEGORY_LABELS, PAIRING_TYPE_CONFIG } from '../data/seedData'

// ─── Add Styling Pairing Modal ────────────────────────────────────────────────
function AddPairingModal({ open, onClose, colorId, productId }) {
  const { addStylingPairing, uploadImage } = useStore()
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    type: 'shirt', description: '', image_url: '', notes: '',
  })
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleImageUpload = async (file) => {
    setUploading(true)
    try { const url = await uploadImage(file); set('image_url', url) }
    catch (e) { console.error(e) }
    finally { setUploading(false) }
  }

  const handleSubmit = async () => {
    if (!form.description.trim() && !form.image_url) return
    await addStylingPairing({ ...form, color_id: colorId, product_id: productId })
    setForm({ type: 'shirt', description: '', image_url: '', notes: '' })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add to Style With">
      <div className="space-y-4">
        <Select label="Type" value={form.type} onChange={(e) => set('type', e.target.value)}>
          {Object.entries(PAIRING_TYPE_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </Select>

        <Textarea label={
          form.type === 'shirt' ? 'Shirt / Top description' :
          form.type === 'layer' ? 'Layering idea' :
          form.type === 'note'  ? 'Styling note' :
          form.type === 'aesthetic' ? 'Aesthetic pairing' :
          'Description'
        } value={form.description} onChange={(e) => set('description', e.target.value)}
          placeholder={
            form.type === 'shirt' ? 'e.g. White oversized button-down, worn open' :
            form.type === 'layer' ? 'e.g. Throw a linen blazer on top' :
            form.type === 'note'  ? 'e.g. Tuck the shirt, add a thin belt' :
            'Describe the pairing…'
          } rows={2} />

        {/* Optional image */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink-400 uppercase tracking-wide">Reference Image (optional)</label>
          {form.image_url ? (
            <div className="relative">
              <img src={form.image_url} alt="" className="w-full aspect-[4/5] object-cover rounded-xl" />
              <button onClick={() => set('image_url', '')}
                className="absolute top-2 right-2 w-7 h-7 bg-ink-900/60 text-white rounded-full flex items-center justify-center">
                <Trash2 size={11} />
              </button>
            </div>
          ) : (
            <ImageUploadButton onUpload={handleImageUpload}>
              <div className="w-full h-24 bg-ivory-200 rounded-xl flex flex-col items-center justify-center gap-1.5
                border-2 border-dashed border-ivory-300 cursor-pointer">
                <span className="text-xs text-ink-400">{uploading ? 'Uploading…' : 'Upload reference photo'}</span>
              </div>
            </ImageUploadButton>
          )}
        </div>

        <Textarea label="Notes" value={form.notes} onChange={(e) => set('notes', e.target.value)}
          placeholder="Shoot day detail…" rows={2} />

        <Button variant="primary" size="full" onClick={handleSubmit}>Add</Button>
      </div>
    </Modal>
  )
}

// ─── Style With tab content ───────────────────────────────────────────────────
function StyleWithTab({ product, selectedColor }) {
  const { stylingPairings, deleteStylingPairing } = useStore()
  const [addOpen, setAddOpen] = useState(false)

  const pairings = stylingPairings.filter(
    (p) => p.product_id === product.id && (!selectedColor || p.color_id === selectedColor.id)
  )

  const grouped = Object.keys(PAIRING_TYPE_CONFIG).reduce((acc, type) => {
    const items = pairings.filter((p) => p.type === type)
    if (items.length) acc[type] = items
    return acc
  }, {})

  return (
    <div className="space-y-5">
      {/* Color context */}
      {selectedColor && (
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full border-2 border-ink-200"
            style={{ backgroundColor: selectedColor.hex_code }} />
          <div>
            <p className="text-sm font-medium text-ink-900">{product.name} · {selectedColor.color_name}</p>
            <p className="text-xs text-ink-400">Styling ideas for this colorway</p>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setAddOpen(true)}>
            <Plus size={13} /> Add
          </Button>
        </div>
      )}

      {!selectedColor && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-500">Select a color above to filter by colorway</p>
          <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={13} /> Add
          </Button>
        </div>
      )}

      {pairings.length === 0 ? (
        <EmptyState icon={Shirt} title="No styling ideas yet"
          subtitle="Add shirts, layering ideas, and aesthetic pairings here" />
      ) : (
        Object.entries(grouped).map(([type, items]) => {
          const cfg = PAIRING_TYPE_CONFIG[type]
          return (
            <div key={type} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                  {cfg.icon} {cfg.label}
                </span>
              </div>

              {/* Visual grid for items with images, list for text-only */}
              {items.some((i) => i.image_url) ? (
                <div className="grid grid-cols-2 gap-3">
                  {items.map((item) => (
                    <div key={item.id} className="space-y-2">
                      {item.image_url
                        ? <MediaCard url={item.image_url} caption={item.description} aspect="photo" />
                        : (
                          <Card className="p-4">
                            <p className="text-sm text-ink-800 leading-snug">{item.description}</p>
                            {item.notes && <p className="text-xs text-ink-400 mt-1">{item.notes}</p>}
                          </Card>
                        )
                      }
                      <div className="flex items-center justify-between px-0.5">
                        {!item.image_url && <CreatorTag creator={item.creator} />}
                        <button onClick={() => deleteStylingPairing(item.id)}
                          className="p-1 text-ink-300 active:text-earth-400 ml-auto">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-ink-800 leading-relaxed">{item.description}</p>
                          {item.notes && <p className="text-xs text-ink-500 mt-1">{item.notes}</p>}
                          <div className="mt-2"><CreatorTag creator={item.creator} /></div>
                        </div>
                        <button onClick={() => deleteStylingPairing(item.id)}
                          className="p-1.5 text-ink-300 active:text-earth-400 flex-shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )
        })
      )}

      <AddPairingModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        colorId={selectedColor?.id}
        productId={product.id}
      />
    </div>
  )
}

// ─── Product detail view ──────────────────────────────────────────────────────
function ProductDetail({ product }) {
  const { productColors, shots, references, matchingShirts, stylingPairings } = useStore()
  const [selectedColorId, setSelectedColorId] = useState(null)
  const [activeTab,        setActiveTab]        = useState('style')

  const colors        = productColors.filter((c) => c.product_id === product.id)
  const selectedColor = colors.find((c) => c.id === selectedColorId) || colors[0]

  const productShots = shots.filter(
    (s) => s.product_id === product.id &&
    (!selectedColor || s.color_id === selectedColor?.id || !s.color_id)
  )
  const productRefs = references.filter((r) => r.product_id === product.id)
  const styleCount  = stylingPairings.filter((p) => p.product_id === product.id).length

  const DETAIL_TABS = [
    { key: 'style',    label: `Style With (${styleCount})` },
    { key: 'shots',    label: `Shots (${productShots.length})` },
    { key: 'overview', label: 'Overview' },
    { key: 'refs',     label: `Refs (${productRefs.length})` },
  ]

  return (
    <div className="space-y-4">
      {/* Product hero card */}
      <Card className="p-4">
        <span className="text-[10px] tracking-[0.2em] uppercase text-ink-400 font-medium">
          {CATEGORY_LABELS[product.category]}
        </span>
        <h2 className="font-display text-2xl font-medium text-ink-900 mt-0.5 mb-1">
          {product.name}
        </h2>
        {product.description && (
          <p className="text-sm text-ink-500 mb-4">{product.description}</p>
        )}

        {/* Color swatches */}
        {colors.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ink-400 mb-3">Colorways</p>
            <div className="flex gap-5 flex-wrap">
              {colors.map((c) => (
                <ColorSwatch
                  key={c.id}
                  hex={c.hex_code}
                  name={c.color_name}
                  selected={selectedColor?.id === c.id}
                  onClick={() => setSelectedColorId(c.id)}
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Color identity card */}
      {selectedColor && (
        <div className="flex items-center gap-4 px-1">
          <div className="w-14 h-14 rounded-2xl border border-ivory-200 shadow-sm flex-shrink-0"
            style={{ backgroundColor: selectedColor.hex_code }} />
          <div>
            <p className="font-display text-lg font-medium text-ink-900">
              {product.name}
            </p>
            <p className="text-sm text-ink-500">{selectedColor.color_name}</p>
            <p className="text-xs text-ink-300 mt-0.5">{selectedColor.hex_code}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-ivory-200 overflow-x-auto no-scrollbar">
        {DETAIL_TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors
              ${activeTab === tab.key ? 'text-ink-900 border-ink-900' : 'text-ink-400 border-transparent'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Style With tab ── */}
      {activeTab === 'style' && (
        <StyleWithTab product={product} selectedColor={selectedColor} />
      )}

      {/* ── Overview tab ── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Card className="p-3">
              <p className="font-display text-2xl font-medium text-ink-900">{productShots.length}</p>
              <p className="text-[10px] text-ink-400 uppercase tracking-wide mt-0.5">Shots</p>
            </Card>
            <Card className="p-3">
              <p className="font-display text-2xl font-medium text-moss-500">
                {productShots.filter((s) => s.status === 'done').length}
              </p>
              <p className="text-[10px] text-ink-400 uppercase tracking-wide mt-0.5">Done</p>
            </Card>
            <Card className="p-3">
              <p className="font-display text-2xl font-medium text-ink-900">{colors.length}</p>
              <p className="text-[10px] text-ink-400 uppercase tracking-wide mt-0.5">Colors</p>
            </Card>
          </div>
        </div>
      )}

      {/* ── Shots tab ── */}
      {activeTab === 'shots' && (
        <div className="space-y-2">
          {productShots.length === 0 ? (
            <EmptyState icon={ChevronRight} title="No shots yet" subtitle="Add shots in Planning Mode" />
          ) : (
            productShots.map((s) => (
              <Card key={s.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-ink-900">{s.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0
                    ${s.status === 'done' ? 'bg-moss-100 text-moss-500' : 'bg-ivory-200 text-ink-600'}`}>
                    {s.status}
                  </span>
                </div>
                {s.description && <p className="text-xs text-ink-500 mt-1">{s.description}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-ink-400">
                    {s.media_type === 'video' ? '🎬 Video' : '📷 Photo'}
                  </span>
                  <CreatorTag creator={s.creator} />
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── Refs tab ── */}
      {activeTab === 'refs' && (
        <div className="space-y-2">
          {productRefs.length === 0 ? (
            <EmptyState icon={ChevronRight} title="No references yet" subtitle="Add references from the References page" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {productRefs.map((r) => (
                <Card key={r.id} className="overflow-hidden">
                  {r.thumbnail_url && (
                    <MediaCard url={r.thumbnail_url} caption={r.title} aspect="photo" />
                  )}
                  <div className="p-3">
                    <p className="text-xs text-ink-400 uppercase tracking-wide mb-1">{r.type}</p>
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-camel-500 truncate">
                        <ExternalLink size={11} />
                        <span className="truncate">{r.title || r.url}</span>
                      </a>
                    )}
                    {r.notes && <p className="text-xs text-ink-500 mt-1 line-clamp-2">{r.notes}</p>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Product list ─────────────────────────────────────────────────────────────
export default function ProductPages() {
  const { products, productColors, shots } = useStore()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [categoryFilter,  setCategoryFilter]  = useState('all')

  const categories = ['all', ...new Set(products.map((p) => p.category))]
  const filtered   = categoryFilter === 'all' ? products : products.filter((p) => p.category === categoryFilter)

  if (selectedProduct) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedProduct(null)}
          className="flex items-center gap-1.5 text-sm text-ink-500 active:text-ink-900">
          <ChevronRight size={14} className="rotate-180" /> All Products
        </button>
        <ProductDetail product={selectedProduct} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-medium text-ink-900">Products</h1>
        <p className="text-sm text-ink-400 mt-1">{products.length} items in this shoot</p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <FilterChip key={cat} label={cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
            active={categoryFilter === cat} onClick={() => setCategoryFilter(cat)} />
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((prod) => {
          const colors    = productColors.filter((c) => c.product_id === prod.id)
          const shotCount = shots.filter((s) => s.product_id === prod.id).length
          const doneCount = shots.filter((s) => s.product_id === prod.id && s.status === 'done').length

          return (
            <button key={prod.id} onClick={() => setSelectedProduct(prod)} className="w-full text-left">
              <Card className="p-4 flex items-center gap-4 active:bg-ivory-200 transition-colors">
                {/* Color palette strip */}
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-ivory-200">
                  {colors.length > 0 ? (
                    <div className="w-full h-full flex">
                      {colors.slice(0, 4).map((c, i) => (
                        <div key={c.id} className="flex-1 h-full" style={{ backgroundColor: c.hex_code }} />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-display text-base text-camel-400">{prod.name[0]}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900">{prod.name}</p>
                  <p className="text-xs text-ink-400">{CATEGORY_LABELS[prod.category]}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {colors.length > 0 && (
                      <span className="text-xs text-ink-400">{colors.length} colors</span>
                    )}
                    {shotCount > 0 && (
                      <span className="text-xs text-ink-400">
                        {doneCount}/{shotCount} shots
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} className="text-ink-300 flex-shrink-0" />
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}
