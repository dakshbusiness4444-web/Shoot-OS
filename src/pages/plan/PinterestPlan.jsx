import { useState } from 'react'
import { Plus, X, ExternalLink } from 'lucide-react'
import useStore from '../../store/useStore'

const PIN_STATUSES = [
  { value: 'idea',      label: 'Idea',       dot: 'bg-ink-300',    bg: 'bg-ivory-100 text-ink-500' },
  { value: 'planned',   label: 'Planned',    dot: 'bg-camel-400',  bg: 'bg-camel-100 text-camel-600' },
  { value: 'created',   label: 'Created',    dot: 'bg-earth-400',  bg: 'bg-sand-100 text-earth-500' },
  { value: 'scheduled', label: 'Scheduled',  dot: 'bg-moss-300',   bg: 'bg-moss-100 text-moss-600' },
  { value: 'published', label: 'Published',  dot: 'bg-moss-500',   bg: 'bg-moss-100 text-moss-600' },
]

const VISUAL_STYLES = [
  'Minimal', 'Editorial', 'Dark & Moody', 'Light & Airy', 'Maximalist',
  'Flat Lay', 'Lifestyle', 'Product-first', 'Artistic', 'Brand Aesthetic',
]

function getStatusCfg(v) {
  return PIN_STATUSES.find((s) => s.value === v) || PIN_STATUSES[0]
}

// ── Pin Card ─────────────────────────────────────────────────────────────────
function PinCard({ item, onEdit, onDelete }) {
  const s = getStatusCfg(item.status)
  return (
    <div className="bg-white rounded-2xl border border-ivory-200 p-4 shadow-soft active:opacity-90"
      onClick={() => onEdit(item)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
        {item.board_name && (
          <span className="text-[10px] font-medium text-earth-400 bg-sand-100 px-2 py-0.5 rounded-full truncate max-w-[120px]">
            📌 {item.board_name}
          </span>
        )}
      </div>

      <p className="text-[14px] font-bold text-ink-900 leading-snug mb-1">
        {item.pin_title || item.title || 'Untitled pin'}
      </p>

      {item.seo_keywords && (
        <p className="text-[11px] text-camel-500 font-medium mb-1 truncate">
          🔍 {item.seo_keywords}
        </p>
      )}

      {item.description && (
        <p className="text-[12px] text-ink-400 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-ivory-100">
        <div className="flex items-center gap-2">
          {item.visual_style && (
            <span className="text-[10px] text-ink-400">✨ {item.visual_style}</span>
          )}
          {item.linked_url && (
            <span className="text-[10px] text-earth-400 flex items-center gap-0.5">
              <ExternalLink size={10} /> linked
            </span>
          )}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
          className="w-6 h-6 rounded-full bg-ivory-100 flex items-center justify-center text-ink-400
            active:bg-rose-100 active:text-rose-500">
          <X size={12} />
        </button>
      </div>
    </div>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────
function PinModal({ open, item, onClose, onSave }) {
  const [form, setForm] = useState(item || {
    pin_title: '', seo_keywords: '', description: '',
    board_name: '', visual_style: '', linked_url: '',
    status: 'idea', notes: '', posting_date: '',
  })
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 animate-backdrop-in">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl animate-sheet-up max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-ivory-100 flex-shrink-0">
          <h2 className="text-base font-bold text-ink-900">{item ? 'Edit Pin' : 'New Pinterest Pin'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-ivory-100 flex items-center justify-center">
            <X size={16} className="text-ink-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <Field label="Pin Title" required>
            <input value={form.pin_title} onChange={(e) => upd('pin_title', e.target.value)}
              placeholder="Compelling, SEO-rich title…" className="input-field" />
          </Field>

          <Field label="SEO Keywords">
            <input value={form.seo_keywords} onChange={(e) => upd('seo_keywords', e.target.value)}
              placeholder="linen pants outfit, summer fashion 2026…" className="input-field" />
          </Field>

          <Field label="Description">
            <textarea value={form.description} onChange={(e) => upd('description', e.target.value)}
              placeholder="Full pin description with natural keywords…"
              rows={3} className="input-field resize-none" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Board Name">
              <input value={form.board_name} onChange={(e) => upd('board_name', e.target.value)}
                placeholder="Summer Outfits" className="input-field" />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => upd('status', e.target.value)} className="input-field">
                {PIN_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Visual Style">
            <div className="flex flex-wrap gap-2">
              {VISUAL_STYLES.map((vs) => (
                <button key={vs} onClick={() => upd('visual_style', form.visual_style === vs ? '' : vs)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors
                    ${form.visual_style === vs ? 'bg-camel-500 text-white' : 'bg-ivory-100 text-ink-500'}`}>
                  {vs}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Linked URL">
            <input value={form.linked_url} onChange={(e) => upd('linked_url', e.target.value)}
              placeholder="https://yourbrand.com/product…" className="input-field" />
          </Field>

          <Field label="Schedule Date">
            <input type="date" value={form.posting_date} onChange={(e) => upd('posting_date', e.target.value)}
              className="input-field" />
          </Field>

          <Field label="Notes">
            <textarea value={form.notes} onChange={(e) => upd('notes', e.target.value)}
              placeholder="Visual references, mood direction…"
              rows={2} className="input-field resize-none" />
          </Field>
        </div>

        <div className="px-5 py-4 border-t border-ivory-100 flex-shrink-0">
          <button onClick={() => onSave(form)}
            className="w-full bg-camel-500 text-white font-bold rounded-xl py-3.5 text-sm
              active:bg-camel-600 shadow-lifted">
            {item ? 'Save Changes' : 'Add Pin'}
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
export default function PinterestPlan() {
  const { contentItems, activeProjectId, addContentItem, updateContentItem, deleteContentItem } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem,  setEditItem]  = useState(null)
  const [filter,    setFilter]    = useState('all')

  const pins = contentItems.filter((c) => {
    if (c.platform !== 'pinterest') return false
    if (c.project_id !== activeProjectId) return false
    if (filter !== 'all' && c.status !== filter) return false
    return true
  })

  const boards = [...new Set(pins.map((p) => p.board_name).filter(Boolean))]

  const handleSave = async (form) => {
    if (editItem) {
      await updateContentItem(editItem.id, { ...form, platform: 'pinterest' })
    } else {
      await addContentItem({ ...form, platform: 'pinterest', title: form.pin_title })
    }
    setModalOpen(false)
    setEditItem(null)
  }

  return (
    <div className="space-y-5">
      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {['all', ...PIN_STATUSES.map((s) => s.value)].map((v) => {
          const cfg = PIN_STATUSES.find((s) => s.value === v)
          const count = v === 'all' ? pins.length : pins.filter((p) => p.status === v).length
          return (
            <button key={v} onClick={() => setFilter(v)}
              className={`flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors
                ${filter === v ? 'bg-camel-500 text-white' : 'bg-ivory-100 text-ink-500'}`}>
              {v === 'all' ? `All · ${count}` : `${cfg?.label} · ${count}`}
            </button>
          )
        })}
      </div>

      {/* Board summary */}
      {boards.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
          {boards.map((b) => (
            <span key={b} className="flex-shrink-0 text-[11px] font-medium bg-sand-100 text-earth-500 px-3 py-1.5 rounded-full">
              📌 {b} · {pins.filter((p) => p.board_name === b).length}
            </span>
          ))}
        </div>
      )}

      {/* Pins */}
      {pins.length > 0 ? (
        <div className="space-y-3">
          {pins.map((pin) => (
            <PinCard key={pin.id} item={pin}
              onEdit={(item) => { setEditItem(item); setModalOpen(true) }}
              onDelete={deleteContentItem}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-14 h-14 bg-earth-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📌</span>
          </div>
          <p className="text-[15px] font-bold text-ink-900 mb-1">No pins planned yet</p>
          <p className="text-sm text-ink-400 mb-5">Build your Pinterest strategy with SEO-optimised pins.</p>
          <button onClick={() => { setEditItem(null); setModalOpen(true) }}
            className="bg-camel-500 text-white font-bold rounded-xl px-5 py-2.5 text-sm
              active:bg-camel-600 shadow-lifted inline-flex items-center gap-2">
            <Plus size={15} /> Plan First Pin
          </button>
        </div>
      )}

      {pins.length > 0 && (
        <button onClick={() => { setEditItem(null); setModalOpen(true) }}
          className="fixed bottom-24 right-4 w-12 h-12 bg-camel-500 text-white rounded-full
            shadow-lifted flex items-center justify-center active:bg-camel-600 z-20">
          <Plus size={22} />
        </button>
      )}

      <PinModal open={modalOpen} item={editItem}
        onClose={() => { setModalOpen(false); setEditItem(null) }}
        onSave={handleSave}
      />
    </div>
  )
}
