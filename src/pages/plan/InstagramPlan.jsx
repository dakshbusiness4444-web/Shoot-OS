import { useState } from 'react'
import { Plus, X, ChevronDown, Sparkles } from 'lucide-react'
import useStore from '../../store/useStore'

// ── Config ────────────────────────────────────────────────────────────────────
const CONTENT_TYPES = [
  { value: 'reel',       label: '🎬 Reel',         color: 'bg-camel-100 text-camel-600' },
  { value: 'post',       label: '📸 Post',          color: 'bg-sand-100 text-earth-500' },
  { value: 'story',      label: '⚡ Story',          color: 'bg-moss-100 text-moss-600' },
  { value: 'carousel',   label: '🎠 Carousel',      color: 'bg-ivory-200 text-ink-600' },
  { value: 'collab',     label: '🤝 Collab',         color: 'bg-camel-100 text-camel-600' },
  { value: 'bts',        label: '🎥 BTS',            color: 'bg-moss-100 text-moss-600' },
  { value: 'educational',label: '📚 Educational',   color: 'bg-sand-100 text-earth-500' },
  { value: 'lifestyle',  label: '✨ Lifestyle',      color: 'bg-ivory-200 text-ink-600' },
]

const STATUSES = [
  { value: 'idea',      label: 'Idea',       dot: 'bg-ink-300',    bg: 'bg-ivory-100 text-ink-500' },
  { value: 'planning',  label: 'Planning',   dot: 'bg-camel-400',  bg: 'bg-camel-100 text-camel-600' },
  { value: 'shooting',  label: 'Shooting',   dot: 'bg-earth-400',  bg: 'bg-sand-100 text-earth-500' },
  { value: 'editing',   label: 'Editing',    dot: 'bg-camel-500',  bg: 'bg-camel-100 text-camel-600' },
  { value: 'scheduled', label: 'Scheduled',  dot: 'bg-moss-400',   bg: 'bg-moss-100 text-moss-600' },
  { value: 'posted',    label: 'Posted',     dot: 'bg-moss-500',   bg: 'bg-moss-100 text-moss-600' },
  { value: 'analyzed',  label: 'Analyzed',   dot: 'bg-ink-600',    bg: 'bg-ivory-200 text-ink-700' },
]

const FILTER_TYPES = ['all', 'reel', 'post', 'story', 'carousel', 'collab', 'bts', 'educational', 'lifestyle']

function getTypeConfig(value) {
  return CONTENT_TYPES.find((t) => t.value === value) || CONTENT_TYPES[0]
}
function getStatusConfig(value) {
  return STATUSES.find((s) => s.value === value) || STATUSES[0]
}

// ── Content Card ─────────────────────────────────────────────────────────────
function ContentCard({ item, onEdit, onDelete }) {
  const typeCfg   = getTypeConfig(item.content_type)
  const statusCfg = getStatusConfig(item.status)

  return (
    <div className="bg-white rounded-2xl border border-ivory-200 p-4 shadow-soft active:opacity-90 transition-opacity"
      onClick={() => onEdit(item)}>
      {/* Type + Status row */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${typeCfg.color}`}>
          {typeCfg.label}
        </span>
        <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusCfg.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          {statusCfg.label}
        </span>
      </div>

      {/* Title */}
      <p className="text-[14px] font-bold text-ink-900 leading-snug mb-1">
        {item.title || 'Untitled content'}
      </p>

      {/* Hook */}
      {item.hook && (
        <p className="text-[12px] text-ink-400 line-clamp-2 mb-2 leading-relaxed">
          "{item.hook}"
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-ivory-100">
        <div className="flex items-center gap-2">
          {item.posting_date && (
            <span className="text-[10px] text-ink-400 font-medium">
              📅 {new Date(item.posting_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
          {item.collab_with && (
            <span className="text-[10px] text-camel-500 font-medium">🤝 {item.collab_with}</span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
          className="w-6 h-6 rounded-full bg-ivory-100 flex items-center justify-center text-ink-400
            active:bg-rose-100 active:text-rose-500 transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}

// ── Add / Edit Modal ──────────────────────────────────────────────────────────
function ContentModal({ open, item, onClose, onSave }) {
  const [form, setForm] = useState(item || {
    content_type: 'reel', title: '', hook: '', objective: '',
    caption: '', hashtags: '', status: 'idea', posting_date: '',
    notes: '', collab_with: '', mood: '',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 animate-backdrop-in">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl animate-sheet-up max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-ivory-100 flex-shrink-0">
          <h2 className="text-base font-bold text-ink-900">{item ? 'Edit Content' : 'New Instagram Content'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-ivory-100 flex items-center justify-center">
            <X size={16} className="text-ink-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-[11px] font-semibold text-ink-400 uppercase tracking-wider mb-2">Content Type</label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((t) => (
                <button key={t.value} onClick={() => set('content_type', t.value)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors
                    ${form.content_type === t.value ? 'bg-camel-500 text-white' : 'bg-ivory-100 text-ink-500'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <Field label="Title" required>
            <input value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="What's this content about?"
              className="input-field" />
          </Field>

          {/* Hook */}
          <Field label="Opening Hook">
            <textarea value={form.hook} onChange={(e) => set('hook', e.target.value)}
              placeholder="The first 3 seconds / opening line that stops the scroll…"
              rows={2} className="input-field resize-none" />
          </Field>

          {/* Objective */}
          <Field label="Objective">
            <input value={form.objective} onChange={(e) => set('objective', e.target.value)}
              placeholder="Brand awareness, product launch, engagement, storytelling…"
              className="input-field" />
          </Field>

          {/* Status + Date */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className="input-field">
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Post Date">
              <input type="date" value={form.posting_date} onChange={(e) => set('posting_date', e.target.value)}
                className="input-field" />
            </Field>
          </div>

          {/* Caption */}
          <Field label="Caption Draft">
            <textarea value={form.caption} onChange={(e) => set('caption', e.target.value)}
              placeholder="Draft your caption here…"
              rows={3} className="input-field resize-none" />
          </Field>

          {/* Hashtags */}
          <Field label="Hashtags">
            <input value={form.hashtags} onChange={(e) => set('hashtags', e.target.value)}
              placeholder="#brandrop #contentcreator #fashion…"
              className="input-field" />
          </Field>

          {/* Mood + Collab */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mood / Theme">
              <input value={form.mood} onChange={(e) => set('mood', e.target.value)}
                placeholder="Minimal, editorial…" className="input-field" />
            </Field>
            <Field label="Collab With">
              <input value={form.collab_with} onChange={(e) => set('collab_with', e.target.value)}
                placeholder="@handle" className="input-field" />
            </Field>
          </div>

          {/* Notes */}
          <Field label="Notes">
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
              placeholder="Direction, references, ideas…"
              rows={2} className="input-field resize-none" />
          </Field>
        </div>

        {/* Save */}
        <div className="px-5 py-4 border-t border-ivory-100 flex-shrink-0">
          <button onClick={() => onSave(form)}
            className="w-full bg-camel-500 text-white font-bold rounded-xl py-3.5 text-sm
              active:bg-camel-600 transition-colors shadow-lifted">
            {item ? 'Save Changes' : 'Add to Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-ink-400 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function InstagramPlan() {
  const { contentItems, activeProjectId, addContentItem, updateContentItem, deleteContentItem } = useStore()
  const [modalOpen,    setModalOpen]    = useState(false)
  const [editItem,     setEditItem]     = useState(null)
  const [filterType,   setFilterType]   = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const items = contentItems.filter((c) => {
    if (c.platform !== 'instagram') return false
    if (c.project_id !== activeProjectId) return false
    if (filterType   !== 'all' && c.content_type !== filterType)   return false
    if (filterStatus !== 'all' && c.status        !== filterStatus) return false
    return true
  })

  const handleSave = async (form) => {
    if (editItem) {
      await updateContentItem(editItem.id, { ...form, platform: 'instagram' })
    } else {
      await addContentItem({ ...form, platform: 'instagram' })
    }
    setModalOpen(false)
    setEditItem(null)
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setModalOpen(true)
  }

  // Status summary
  const summary = STATUSES.map((s) => ({
    ...s,
    count: items.filter((c) => c.status === s.value).length,
  })).filter((s) => s.count > 0)

  return (
    <div className="space-y-5">

      {/* Status summary pills */}
      {summary.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {summary.map((s) => (
            <button key={s.value}
              onClick={() => setFilterStatus(filterStatus === s.value ? 'all' : s.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full
                transition-colors border
                ${filterStatus === s.value
                  ? 'bg-camel-500 text-white border-camel-500'
                  : 'bg-white text-ink-600 border-ivory-200'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label} · {s.count}
            </button>
          ))}
        </div>
      )}

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {FILTER_TYPES.map((t) => {
          const cfg = CONTENT_TYPES.find((x) => x.value === t)
          return (
            <button key={t}
              onClick={() => setFilterType(t)}
              className={`flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors
                ${filterType === t ? 'bg-ink-900 text-white' : 'bg-ivory-100 text-ink-500'}`}>
              {t === 'all' ? 'All' : cfg?.label || t}
            </button>
          )
        })}
      </div>

      {/* Content list */}
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <ContentCard key={item.id} item={item}
              onEdit={handleEdit}
              onDelete={deleteContentItem}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-14 h-14 bg-camel-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎬</span>
          </div>
          <p className="text-[15px] font-bold text-ink-900 mb-1">No content planned yet</p>
          <p className="text-sm text-ink-400 mb-5">Start building your Instagram content calendar.</p>
          <button onClick={() => { setEditItem(null); setModalOpen(true) }}
            className="bg-camel-500 text-white font-bold rounded-xl px-5 py-2.5 text-sm
              active:bg-camel-600 shadow-lifted inline-flex items-center gap-2">
            <Plus size={15} /> Plan First Content
          </button>
        </div>
      )}

      {/* FAB */}
      {items.length > 0 && (
        <button
          onClick={() => { setEditItem(null); setModalOpen(true) }}
          className="fixed bottom-24 right-4 w-12 h-12 bg-camel-500 text-white rounded-full
            shadow-lifted flex items-center justify-center active:bg-camel-600 z-20">
          <Plus size={22} />
        </button>
      )}

      <ContentModal
        open={modalOpen}
        item={editItem}
        onClose={() => { setModalOpen(false); setEditItem(null) }}
        onSave={handleSave}
      />
    </div>
  )
}
