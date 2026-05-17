import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Star } from 'lucide-react'
import useStore from '../store/useStore'
import {
  Card, Button, Modal, Input, Textarea, Select,
  CreatorTag, FilterChip, EmptyState, StatusBadge,
} from '../components/ui'

const NAV_PAGES = [
  { path: '/references', label: 'References' },
  { path: '/bts', label: 'BTS Ideas' },
  { path: '/extra', label: 'Extra Ideas' },
]

const EXTRA_LABELS = {
  optional: 'Optional',
  extra: 'Extra',
  bonus: 'Bonus',
  experimental: 'Experimental',
}

function AddExtraModal({ open, onClose }) {
  const { addShot } = useStore()
  const [form, setForm] = useState({
    title: '', description: '', extra_type: 'optional',
    pose_description: '', notes: '',
  })
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title.trim()) return
    await addShot({ ...form, shot_type: 'extra', status: 'pending', priority: 'optional' })
    setForm({ title: '', description: '', extra_type: 'optional', pose_description: '', notes: '' })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Extra Idea">
      <div className="space-y-4">
        <Select label="Label" value={form.extra_type} onChange={(e) => set('extra_type', e.target.value)}>
          {Object.entries(EXTRA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Input label="Title *" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Mirror reflection shot" />
        <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What's the idea? Only execute if time allows." rows={3} />
        <Input label="Pose / Angle" value={form.pose_description} onChange={(e) => set('pose_description', e.target.value)} placeholder="Any specific pose or setup?" />
        <Textarea label="Notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Context, inspiration, references…" rows={2} />
        <div className="bg-ivory-200 rounded-xl px-4 py-3">
          <p className="text-xs text-ink-500">
            These ideas are marked <strong>optional</strong> and will only be attempted if time remains during the shoot. They won't appear in main Shoot Mode.
          </p>
        </div>
        <Button variant="camel" size="full" onClick={handleSubmit}>Add Extra Idea</Button>
      </div>
    </Modal>
  )
}

export default function ExtraIdeas() {
  const navigate = useNavigate()
  const { shots, deleteShot } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [filter, setFilter] = useState('all')

  const extras = shots.filter((s) => s.shot_type === 'extra')
  const filtered = filter === 'all' ? extras : extras.filter((s) => s.extra_type === filter)

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
          <h1 className="font-display text-2xl font-medium text-ink-900">Extra Ideas</h1>
          <p className="text-sm text-ink-400 mt-1">
            {extras.length} ideas — only if time remains
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} /> Add
        </Button>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 bg-camel-100/50 rounded-2xl px-4 py-3">
        <Star size={15} className="text-camel-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-camel-500 leading-relaxed">
          These are bonus shots. Don't let them distract from priority work. Only execute them if time allows.
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <FilterChip label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
        {Object.entries(EXTRA_LABELS).map(([k, v]) => (
          <FilterChip key={k} label={v} active={filter === k} onClick={() => setFilter(k)} />
        ))}
      </div>

      {/* Ideas */}
      {filtered.length === 0 ? (
        <EmptyState icon={Star} title="No extra ideas yet" subtitle="Add bonus shots you'd love to capture if time allows" />
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <Card key={s.id} className="p-4 border border-dashed border-sand-300">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 bg-camel-100 text-camel-500 rounded-full font-medium">
                      {EXTRA_LABELS[s.extra_type] || s.extra_type || 'Optional'}
                    </span>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-sm font-medium text-ink-800">{s.title}</p>
                  {s.description && <p className="text-sm text-ink-500 mt-1 leading-relaxed">{s.description}</p>}
                  {s.pose_description && (
                    <p className="text-xs text-ink-400 mt-1">Pose: {s.pose_description}</p>
                  )}
                  {s.notes && <p className="text-xs text-ink-400 mt-1 italic">{s.notes}</p>}
                  <div className="mt-2">
                    <CreatorTag creator={s.creator} />
                  </div>
                </div>
                <button onClick={() => deleteShot(s.id)} className="p-1.5 text-ink-300 active:text-earth-400 flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddExtraModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
