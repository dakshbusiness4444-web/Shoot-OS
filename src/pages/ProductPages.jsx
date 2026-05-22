import { useState, useEffect } from 'react'
import { ChevronRight, Plus, Trash2, Pencil, ExternalLink, Shirt, Palette, X } from 'lucide-react'
import useStore from '../store/useStore'
import {
  Card, Button, Modal, Input, Textarea, Select,
  ColorSwatch, CreatorTag, EmptyState, FilterChip,
  MediaCard, ImageUploadButton,
} from '../components/ui'
import { CATEGORY_LABELS, PAIRING_TYPE_CONFIG } from '../data/seedData'

// ─── Add Product Modal ────────────────────────────────────────────────────────
function AddProductModal({ open, onClose }) {
  const { addProduct } = useStore()
  const [form, setForm] = useState({ name: '', category: 'other', description: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await addProduct({ name: form.name.trim(), category: form.category, description: form.description.trim() || null })
    setForm({ name: '', category: 'other', description: '' })
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Product">
      <div className="space-y-4">
        <Input
          label="Product Name"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Linen Blazer"
          autoFocus
        />
        <Select label="Category" value={form.category} onChange={(e) => set('category', e.target.value)}>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        <Textarea
          label="Description (optional)"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Any notes about this product…"
          rows={2}
        />
        <Button variant="primary" size="full" onClick={handleSubmit} disabled={saving || !form.name.trim()}>
          {saving ? 'Adding…' : 'Add Product'}
        </Button>
      </div>
    </Modal>
  )
}

// ─── Add Color Modal ──────────────────────────────────────────────────────────
function AddColorModal({ open, onClose, productId }) {
  const { addProductColor } = useStore()
  const [form, setForm] = useState({ color_name: '', hex_code: '#D4C9B5' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.color_name.trim()) return
    setSaving(true)
    await addProductColor({ product_id: productId, color_name: form.color_name.trim(), hex_code: form.hex_code })
    setForm({ color_name: '', hex_code: '#D4C9B5' })
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Color">
      <div className="space-y-4">
        <Input
          label="Color Name"
          value={form.color_name}
          onChange={(e) => set('color_name', e.target.value)}
          placeholder="e.g. Dusty Rose, Olive, Black"
          autoFocus
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink-400 uppercase tracking-wide">Hex Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.hex_code}
              onChange={(e) => set('hex_code', e.target.value)}
              className="w-12 h-12 rounded-xl border-0 bg-transparent cursor-pointer p-0"
            />
            <input
              type="text"
              value={form.hex_code}
              onChange={(e) => set('hex_code', e.target.value)}
              placeholder="#D4C9B5"
              className="flex-1 bg-ivory-200 border-0 rounded-xl px-4 py-3 text-sm text-ink-900
                placeholder-ink-200 focus:outline-none focus:ring-2 focus:ring-camel-300"
            />
          </div>
          {/* Preview swatch */}
          <div className="flex items-center gap-3 mt-1">
            <div className="w-10 h-10 rounded-full border-2 border-ivory-300"
              style={{ backgroundColor: form.hex_code }} />
            <span className="text-sm text-ink-600">{form.color_name || 'Color preview'}</span>
          </div>
        </div>
        <Button variant="primary" size="full" onClick={handleSubmit} disabled={saving || !form.color_name.trim()}>
          {saving ? 'Adding…' : 'Add Color'}
        </Button>
      </div>
    </Modal>
  )
}

// ─── Add / Edit Styling Pairing Modal ─────────────────────────────────────────
function AddPairingModal({ open, onClose, colorId, productId, pairingToEdit = null }) {
  const { addStylingPairing, updateStylingPairing, uploadImage } = useStore()
  const isEditing = !!pairingToEdit
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    type: 'shirt', description: '', image_url: '', notes: '',
  })
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  // Reinit when opening in edit mode
  useEffect(() => {
    if (open && pairingToEdit) {
      setForm({
        type:        pairingToEdit.type        || 'shirt',
        description: pairingToEdit.description || '',
        image_url:   pairingToEdit.image_url   || '',
        notes:       pairingToEdit.notes       || '',
      })
    } else if (open && !pairingToEdit) {
      setForm({ type: 'shirt', description: '', image_url: '', notes: '' })
    }
  }, [open, pairingToEdit?.id])

  const handleImageUpload = async (file) => {
    setUploading(true)
    try { const url = await uploadImage(file); setField('image_url', url) }
    catch (e) { console.error(e) }
    finally { setUploading(false) }
  }

  const handleSubmit = async () => {
    if (!form.description.trim() && !form.image_url) return
    if (isEditing) {
      await updateStylingPairing(pairingToEdit.id, {
        type: form.type, description: form.description,
        image_url: form.image_url, notes: form.notes,
      })
    } else {
      await addStylingPairing({ ...form, color_id: colorId || null, product_id: productId })
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Style With' : 'Add to Style With'}>
      <div className="space-y-4">
        <Select label="Type" value={form.type} onChange={(e) => setField('type', e.target.value)}>
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
        } value={form.description} onChange={(e) => setField('description', e.target.value)}
          placeholder={
            form.type === 'shirt' ? 'e.g. White oversized button-down, worn open' :
            form.type === 'layer' ? 'e.g. Throw a linen blazer on top' :
            form.type === 'note'  ? 'e.g. Tuck the shirt, add a thin belt' :
            'Describe the pairing…'
          } rows={2} />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink-400 uppercase tracking-wide">Reference Image (optional)</label>
          {form.image_url ? (
            <div className="relative">
              <img src={form.image_url} alt="" className="w-full aspect-[4/5] object-cover rounded-xl" />
              <button onClick={() => setField('image_url', '')}
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

        <Textarea label="Notes" value={form.notes} onChange={(e) => setField('notes', e.target.value)}
          placeholder="Shoot day detail…" rows={2} />

        <Button variant="primary" size="full" onClick={handleSubmit}>
          {isEditing ? 'Save Changes' : 'Add'}
        </Button>
      </div>
    </Modal>
  )
}

// ─── Style With tab ───────────────────────────────────────────────────────────
function StyleWithTab({ product, selectedColor }) {
  const { stylingPairings, deleteStylingPairing } = useStore()
  const [addOpen,      setAddOpen]      = useState(false)
  const [editPairing,  setEditPairing]  = useState(null)  // pairing being edited

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
      {selectedColor ? (
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
      ) : (
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
                        <div className="flex items-center gap-1 ml-auto">
                          <button onClick={() => setEditPairing(item)}
                            className="p-1 text-ink-300 active:text-camel-500">
                            <Pencil size={11} />
                          </button>
                          <button onClick={() => deleteStylingPairing(item.id)}
                            className="p-1 text-ink-300 active:text-earth-400">
                            <Trash2 size={12} />
                          </button>
                        </div>
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
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <button onClick={() => setEditPairing(item)}
                            className="p-1.5 text-ink-300 active:text-camel-500">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => deleteStylingPairing(item.id)}
                            className="p-1.5 text-ink-300 active:text-earth-400">
                            <Trash2 size={13} />
                          </button>
                        </div>
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
      <AddPairingModal
        open={!!editPairing}
        onClose={() => setEditPairing(null)}
        colorId={selectedColor?.id}
        productId={product.id}
        pairingToEdit={editPairing}
      />
    </div>
  )
}

// ─── Product detail ───────────────────────────────────────────────────────────
function ProductDetail({ product, onBack }) {
  const { productColors, shots, references, stylingPairings, deleteProductColor, deleteProduct } = useStore()
  const [selectedColorId, setSelectedColorId] = useState(null)
  const [activeTab,        setActiveTab]        = useState('style')
  const [addColorOpen,     setAddColorOpen]      = useState(false)
  const [manageColors,     setManageColors]      = useState(false)
  const [confirmDelete,    setConfirmDelete]      = useState(false)

  const colors        = productColors.filter((c) => c.product_id === product.id)
  const selectedColor = colors.find((c) => c.id === selectedColorId) || colors[0] || null

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
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-ink-500 active:text-ink-900">
        <ChevronRight size={14} className="rotate-180" /> All Products
      </button>

      {/* Product hero card */}
      <Card className="p-4">
        <span className="text-[10px] tracking-[0.2em] uppercase text-ink-400 font-medium">
          {CATEGORY_LABELS[product.category] || product.category}
        </span>
        <h2 className="font-display text-2xl font-medium text-ink-900 mt-0.5 mb-1">
          {product.name}
        </h2>
        {product.description && (
          <p className="text-sm text-ink-500 mb-4">{product.description}</p>
        )}

        {/* Color swatches + Add Color */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-widest text-ink-400">Colorways</p>
            <div className="flex items-center gap-3">
              {colors.length > 0 && (
                <button
                  onClick={() => setManageColors((v) => !v)}
                  className={`text-xs font-medium transition-colors ${manageColors ? 'text-rose-400' : 'text-ink-400'}`}
                >
                  {manageColors ? 'Done' : 'Manage'}
                </button>
              )}
              <button
                onClick={() => setAddColorOpen(true)}
                className="flex items-center gap-1 text-xs font-medium text-camel-500 active:text-camel-600"
              >
                <Plus size={12} /> Add Color
              </button>
            </div>
          </div>
          {colors.length > 0 ? (
            <div className="flex gap-5 flex-wrap">
              {colors.map((c) => (
                <div key={c.id} className="relative">
                  <ColorSwatch
                    hex={c.hex_code}
                    name={c.color_name}
                    selected={!manageColors && selectedColor?.id === c.id}
                    onClick={() => !manageColors && setSelectedColorId(c.id)}
                  />
                  {manageColors && (
                    <button
                      onClick={() => {
                        deleteProductColor(c.id)
                        if (selectedColorId === c.id) setSelectedColorId(null)
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-rose-400 text-white rounded-full
                        flex items-center justify-center shadow-sm animate-fade-in"
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-300 italic">No colors yet — add one above</p>
          )}
        </div>
      </Card>

      {/* Selected color identity */}
      {selectedColor && (
        <div className="flex items-center gap-4 px-1">
          <div className="w-14 h-14 rounded-2xl border border-ivory-200 shadow-sm flex-shrink-0"
            style={{ backgroundColor: selectedColor.hex_code }} />
          <div>
            <p className="font-display text-lg font-medium text-ink-900">{product.name}</p>
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

      {activeTab === 'style' && (
        <StyleWithTab product={product} selectedColor={selectedColor} />
      )}

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

      {activeTab === 'shots' && (
        <div className="space-y-2">
          {productShots.length === 0 ? (
            <EmptyState icon={ChevronRight} title="No shots yet" subtitle="Add shots in Planning Mode" />
          ) : (
            productShots.map((s) => {
              const shotColor = productColors.find((c) => c.id === s.color_id)
              return (
                <Card key={s.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-ink-900">{s.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0
                      ${s.status === 'done' ? 'bg-moss-100 text-moss-500' : 'bg-ivory-200 text-ink-600'}`}>
                      {s.status}
                    </span>
                  </div>
                  {s.description && <p className="text-xs text-ink-500 mt-1">{s.description}</p>}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {shotColor ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-ink-600
                        bg-ivory-200 px-2 py-0.5 rounded-full">
                        <span className="w-2.5 h-2.5 rounded-full border border-ink-100/60 flex-shrink-0"
                          style={{ backgroundColor: shotColor.hex_code }} />
                        {shotColor.color_name}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 bg-camel-100 text-camel-500 rounded-full">
                        All Colors
                      </span>
                    )}
                    <span className="text-[10px] text-ink-400">
                      {s.media_type === 'video' ? '🎬 Video' : '📷 Photo'}
                    </span>
                    <CreatorTag creator={s.creator} />
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}

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

      {/* Remove Product */}
      <div className="pt-2 pb-4">
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full py-3 rounded-xl text-sm font-medium text-rose-400 bg-rose-50
              active:bg-rose-100 transition-colors border border-rose-100"
          >
            Remove Product
          </button>
        ) : (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3 animate-fade-in">
            <p className="text-sm text-rose-600 text-center font-medium">
              Remove "{product.name}"? This also deletes all its colors.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-ivory-200 text-ink-700 active:bg-ivory-300"
              >
                Cancel
              </button>
              <button
                onClick={() => { deleteProduct(product.id); onBack() }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rose-400 text-white active:bg-rose-500"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        )}
      </div>

      <AddColorModal
        open={addColorOpen}
        onClose={() => setAddColorOpen(false)}
        productId={product.id}
      />
    </div>
  )
}

// ─── Product list ─────────────────────────────────────────────────────────────
export default function ProductPages() {
  const { products, productColors, shots } = useStore()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [categoryFilter,  setCategoryFilter]  = useState('all')
  const [addProductOpen,  setAddProductOpen]  = useState(false)

  const categories = ['all', ...new Set(products.map((p) => p.category))]
  const filtered   = categoryFilter === 'all' ? products : products.filter((p) => p.category === categoryFilter)

  // Keep selectedProduct in sync if products list updates (e.g. after adding new product)
  const currentProduct = selectedProduct
    ? products.find((p) => p.id === selectedProduct.id) || selectedProduct
    : null

  if (currentProduct) {
    return (
      <div className="page-container animate-page-enter">
        <ProductDetail
          product={currentProduct}
          onBack={() => setSelectedProduct(null)}
        />
      </div>
    )
  }

  return (
    <div className="page-container animate-page-enter">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="font-display text-2xl font-medium text-ink-900">Products</h1>
          <p className="text-sm text-ink-400 mt-0.5">{products.length} items in this shoot</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setAddProductOpen(true)}>
          <Plus size={14} /> Add Product
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mt-3">
        {categories.map((cat) => (
          <FilterChip key={cat} label={cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
            active={categoryFilter === cat} onClick={() => setCategoryFilter(cat)} />
        ))}
      </div>

      <div className="space-y-2 mt-3">
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
                      {colors.slice(0, 4).map((c) => (
                        <div key={c.id} className="flex-1 h-full" style={{ backgroundColor: c.hex_code }} />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Palette size={16} className="text-ink-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900">{prod.name}</p>
                  <p className="text-xs text-ink-400">{CATEGORY_LABELS[prod.category] || prod.category}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {colors.length > 0 && (
                      <span className="text-xs text-ink-400">{colors.length} color{colors.length !== 1 ? 's' : ''}</span>
                    )}
                    {shotCount > 0 && (
                      <span className="text-xs text-ink-400">{doneCount}/{shotCount} shots</span>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} className="text-ink-300 flex-shrink-0" />
              </Card>
            </button>
          )
        })}

        {filtered.length === 0 && (
          <EmptyState icon={Palette} title="No products yet" subtitle="Tap Add Product to get started" />
        )}
      </div>

      <AddProductModal open={addProductOpen} onClose={() => setAddProductOpen(false)} />
    </div>
  )
}
