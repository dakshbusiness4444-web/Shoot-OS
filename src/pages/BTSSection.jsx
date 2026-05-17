import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Clapperboard } from 'lucide-react'
import useStore from '../store/useStore'
import {
  Card, Button, Modal, Input, Textarea, Select,
  CreatorTag, FilterChip, EmptyState,
} from '../components/ui'
import { BTS_TYPE_LABELS } from '../data/seedData'

const NAV_PAGES = [
  { path: '/references', label: 'References' },
  { path: '/bts', label: 'BTS Ideas' },
  { path: '/extra', label: 'Extra Ideas' },
]

const BTS_TYPES = [
  { key: 'all', label: 'All' },
  ...Object.entries(BTS_TYPE_LABELS).map(([k, v]) => ({ key: k, label: v })),
]

function AddBTSModal({ open, onClose }) {
  const { addBTSIdea } = useStore()
  const [form, setForm] = useState({ title: '', description: '', type: 'general', reference_url: '', notes: '' })
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title.trim()) return
    await addBTSIdea(form)
    setForm({ title: '', description: '', type: 'general', reference_url: '', notes: '' })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add BTS Idea">
      <div className="space-y-4">
        <Select label="Type" value={form.type} onChange={(e) => set('type', e.target.value)}>
          {Object.entries(BTS_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Input label="Title *" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Outfit change chaos clip" />
        <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What's the content idea? How would it look?" rows={3} />
        <Input label="Reference URL" value={form.reference_url} onChange={(e) => set('reference_url', e.target.value)} placeholder="Instagram / TikTok reference link" type="url" />
        <Textarea label="Notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Timing, execution notes…" rows={2} />
        <Button variant="primary" size="full" onClick={handleSubmit}>Add BTS Idea</Button>
      </div>
    </Modal>
  )
}

const BTS_TYPE_EMOJIS = {
  funny: '😂',
  reel: '🎬',
  camera_setup: '📷',
  outfit_change: '👗',
  candid: '✨',
  transition: '🔄',
  how_made: '🎥',
  other: '💡',
  general: '🌟',
}

export default function BTSSection() {
  const navigate = useNavigate()
  const { btsIdeas, deleteBTSIdea } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = typeFilter === 'all' ? btsIdeas : btsIdeas.filter((b) => b.type === typeFilter)

  return (
    <div className="space-y-4">
      {/* Sub-nav */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
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
          <h1 className="font-display text-2xl font-medium text-ink-900">BTS Ideas</h1>
          <p className="text-sm text-ink-400 mt-1">Behind-the-scenes content ideas</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} /> Add
        </Button>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {BTS_TYPES.slice(0, 7).map((t) => (
          <FilterChip key={t.key} label={t.label} active={typeFilter === t.key} onClick={() => setTypeFilter(t.key)} />
        ))}
      </div>

      {/* Ideas list */}
      {filtered.length === 0 ? (
        <EmptyState icon={Clapperboard} title="No BTS ideas yet" subtitle="Add fun behind-the-scenes content ideas" />
      ) : (
        <div className="space-y-3">
          {filtered.map((idea) => (
            <Card key={idea.id} className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{BTS_TYPE_EMOJIS[idea.type] || '💡'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-ink-900 leading-snug">{idea.title}</p>
                    <button onClick={() => deleteBTSIdea(idea.id)} className="p-1 text-ink-300 active:text-earth-400 flex-shrink-0">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 bg-moss-100 text-moss-500 rounded-md inline-block mt-1">
                    {BTS_TYPE_LABELS[idea.type] || idea.type}
                  </span>
                  {idea.description && (
                    <p className="text-sm text-ink-600 mt-2 leading-relaxed">{idea.description}</p>
                  )}
                  {idea.reference_url && (
                    <a href={idea.reference_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-camel-500 mt-1.5">
                      <span>Reference link →</span>
                    </a>
                  )}
                  {idea.notes && (
                    <p className="text-xs text-ink-400 mt-1.5 italic">{idea.notes}</p>
                  )}
                  <div className="mt-2">
                    <CreatorTag creator={idea.creator} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddBTSModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
