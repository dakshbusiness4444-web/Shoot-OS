import { useState } from 'react'
import { Plus, Trash2, ExternalLink, BookImage, Image as ImageIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import {
  Card, Button, Modal, Input, Textarea, Select,
  CreatorTag, FilterChip, SearchBar, EmptyState,
  SectionHeader, ImageUploadButton,
} from '../components/ui'

const REF_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'image', label: 'Images' },
  { key: 'reel', label: 'Reels' },
  { key: 'pinterest', label: 'Pinterest' },
  { key: 'pose', label: 'Poses' },
  { key: 'camera', label: 'Camera' },
  { key: 'transition', label: 'Transitions' },
  { key: 'meta_ad', label: 'Meta Ads' },
  { key: 'inspiration', label: 'Inspiration' },
]

const NAV_PAGES = [
  { path: '/references', label: 'References' },
  { path: '/bts', label: 'BTS Ideas' },
  { path: '/extra', label: 'Extra Ideas' },
]

function AddReferenceModal({ open, onClose }) {
  const { addReference, products, uploadImage } = useStore()
  const [form, setForm] = useState({
    type: 'image', title: '', url: '', thumbnail_url: '',
    product_id: '', notes: '',
  })
  const [uploading, setUploading] = useState(false)

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }))

  const handleImageUpload = async (file) => {
    setUploading(true)
    try {
      const url = await uploadImage(file)
      set('thumbnail_url', url)
      if (!form.url) set('url', url)
    } catch (e) {
      console.error(e)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title.trim() && !form.url.trim()) return
    await addReference({ ...form, title: form.title || form.url })
    setForm({ type: 'image', title: '', url: '', thumbnail_url: '', product_id: '', notes: '' })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Reference">
      <div className="space-y-4">
        <Select label="Reference Type" value={form.type} onChange={(e) => set('type', e.target.value)}>
          {REF_TYPES.filter((t) => t.key !== 'all').map((t) => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </Select>

        <Input label="Title" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="What is this reference for?" />
        <Input label="URL / Link" value={form.url} onChange={(e) => set('url', e.target.value)} placeholder="https://…" type="url" />

        {/* Image upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink-400 uppercase tracking-wide">Image / Screenshot</label>
          {form.thumbnail_url ? (
            <div className="relative">
              <img src={form.thumbnail_url} alt="Thumbnail" className="w-full h-40 object-cover rounded-xl" />
              <button onClick={() => set('thumbnail_url', '')} className="absolute top-2 right-2 w-7 h-7 bg-ink-900/60 text-white rounded-full flex items-center justify-center">
                <Trash2 size={11} />
              </button>
            </div>
          ) : (
            <ImageUploadButton onUpload={handleImageUpload}>
              <div className="w-full h-24 bg-ivory-200 rounded-xl flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-ivory-300 cursor-pointer">
                <ImageIcon size={18} className="text-ink-400" />
                <span className="text-xs text-ink-400">{uploading ? 'Uploading…' : 'Upload screenshot'}</span>
              </div>
            </ImageUploadButton>
          )}
        </div>

        <Select label="Link to Product (optional)" value={form.product_id} onChange={(e) => set('product_id', e.target.value)}>
          <option value="">No product link</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>

        <Textarea label="Notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="What to take from this reference…" rows={2} />

        <Button variant="primary" size="full" onClick={handleSubmit}>Add Reference</Button>
      </div>
    </Modal>
  )
}

function ReferenceCard({ ref: r }) {
  const { deleteReference } = useStore()

  return (
    <Card className="overflow-hidden">
      {r.thumbnail_url && (
        <img src={r.thumbnail_url} alt={r.title} className="w-full h-44 object-cover" />
      )}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-medium text-ink-900 line-clamp-2 leading-snug">{r.title || r.url}</p>
          <button onClick={() => deleteReference(r.id)} className="p-1 text-ink-300 active:text-earth-400 flex-shrink-0">
            <Trash2 size={12} />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 bg-ivory-200 rounded-md text-ink-600">{r.type}</span>
          <CreatorTag creator={r.creator} />
        </div>
        {r.notes && <p className="text-xs text-ink-500 mt-1.5 line-clamp-2">{r.notes}</p>}
        {r.url && (
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-1 text-xs text-camel-500"
          >
            <ExternalLink size={11} />
            <span className="truncate">{r.url}</span>
          </a>
        )}
      </div>
    </Card>
  )
}

export default function ReferenceLibrary() {
  const navigate = useNavigate()
  const { references } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = references.filter((r) => {
    const matchType = typeFilter === 'all' || r.type === typeFilter
    const matchSearch = !search || (r.title || r.url || '').toLowerCase().includes(search.toLowerCase()) || (r.notes || '').toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  return (
    <div className="space-y-4">
      {/* Sub-nav for More section */}
      <div className="flex gap-2 -mx-0 overflow-x-auto no-scrollbar">
        {NAV_PAGES.map((p) => (
          <button
            key={p.path}
            onClick={() => navigate(p.path)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors
              ${location.pathname === p.path ? 'bg-ink-900 text-ivory-100' : 'bg-ivory-200 text-ink-600'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-ink-900">References</h1>
          <p className="text-sm text-ink-400 mt-1">{references.length} saved references</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} /> Add
        </Button>
      </div>

      {/* Search */}
      <SearchBar value={search} onChange={setSearch} placeholder="Search references…" />

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {REF_TYPES.map((t) => (
          <FilterChip key={t.key} label={t.label} active={typeFilter === t.key} onClick={() => setTypeFilter(t.key)} />
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={BookImage} title="No references yet" subtitle="Add screenshots, reel links, and inspiration here" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((r) => (
            <ReferenceCard key={r.id} ref={r} />
          ))}
        </div>
      )}

      <AddReferenceModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
