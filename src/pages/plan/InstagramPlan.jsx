import { useState, useRef } from 'react'
import {
  Plus, X, ChevronDown, ChevronUp, Sparkles, Camera, Image as ImageIcon,
  Eye, Heart, MessageCircle, Share2, Bookmark, TrendingUp, Users, BarChart3, Trash2, Archive
} from 'lucide-react'
import useStore from '../../store/useStore'
import QuickPastPostModal from '../../components/ui/QuickPastPostModal'

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

// Analytics metrics config
const METRICS = [
  { key: 'views',           label: 'Views',          icon: Eye,           color: 'text-camel-500',  bg: 'bg-camel-50',   hint: 'For reels' },
  { key: 'likes',           label: 'Likes',          icon: Heart,         color: 'text-rose-500',   bg: 'bg-rose-50' },
  { key: 'comments',        label: 'Comments',       icon: MessageCircle, color: 'text-moss-500',   bg: 'bg-moss-50' },
  { key: 'shares',          label: 'Shares',         icon: Share2,        color: 'text-camel-500',  bg: 'bg-camel-50' },
  { key: 'saves',           label: 'Saves',          icon: Bookmark,      color: 'text-earth-500',  bg: 'bg-sand-50' },
  { key: 'reach',           label: 'Reach',          icon: TrendingUp,    color: 'text-ink-600',    bg: 'bg-ivory-100' },
  { key: 'impressions',     label: 'Impressions',    icon: BarChart3,     color: 'text-ink-600',    bg: 'bg-ivory-100' },
  { key: 'profile_visits',  label: 'Profile Visits', icon: Users,         color: 'text-camel-500',  bg: 'bg-camel-50' },
  { key: 'followers_gained',label: 'New Followers',  icon: Plus,          color: 'text-moss-500',   bg: 'bg-moss-50' },
]

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
  const thumbnail = item.media_urls?.[0]
  const a         = item.analytics || {}
  const hasStats  = item.status === 'posted' || item.status === 'analyzed'

  return (
    <div className="bg-white rounded-2xl border border-ivory-200 shadow-soft active:opacity-90 transition-opacity overflow-hidden"
      onClick={() => onEdit(item)}>

      <div className="flex">
        {/* Thumbnail */}
        {thumbnail && (
          <div className="w-24 h-24 flex-shrink-0 bg-ivory-100 relative">
            <img src={thumbnail} alt="" className="w-full h-full object-cover" />
            <span className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${typeCfg.color}`}>
              {typeCfg.label.split(' ')[0]}
            </span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 p-3 min-w-0">
          {/* Type + Status row (only if no thumbnail) */}
          {!thumbnail && (
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeCfg.color}`}>
                {typeCfg.label}
              </span>
            </div>
          )}

          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-[13px] font-bold text-ink-900 leading-snug line-clamp-1 flex-1">
              {item.title || 'Untitled content'}
            </p>
            <span className={`flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${statusCfg.bg}`}>
              <span className={`w-1 h-1 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
          </div>

          {item.hook && (
            <p className="text-[11px] text-ink-400 line-clamp-1 mb-1.5">"{item.hook}"</p>
          )}

          {/* Stats row */}
          {hasStats && (a.views || a.likes || a.comments) ? (
            <div className="flex items-center gap-2.5 mt-1.5">
              {a.views > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-ink-600">
                  <Eye size={10} /> {formatNumber(a.views)}
                </span>
              )}
              {a.likes > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-ink-600">
                  <Heart size={10} className="text-rose-400" /> {formatNumber(a.likes)}
                </span>
              )}
              {a.comments > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-ink-600">
                  <MessageCircle size={10} className="text-moss-400" /> {formatNumber(a.comments)}
                </span>
              )}
            </div>
          ) : (
            item.posting_date && (
              <p className="text-[10px] text-ink-400 font-medium mt-1">
                📅 {new Date(item.posting_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            )
          )}
        </div>

        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
          className="self-start mt-2 mr-2 w-6 h-6 rounded-full bg-ivory-100 flex items-center justify-center text-ink-400 active:bg-rose-100 active:text-rose-500 flex-shrink-0">
          <X size={12} />
        </button>
      </div>
    </div>
  )
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n
}

// ── Add / Edit Modal ──────────────────────────────────────────────────────────
function ContentModal({ open, item, onClose, onSave }) {
  const { uploadImage } = useStore()
  const [form, setForm] = useState(item || {
    content_type: 'reel', title: '', hook: '', objective: '',
    caption: '', hashtags: '', status: 'idea', posting_date: '',
    notes: '', collab_with: '', mood: '', media_urls: [], analytics: {},
  })
  const [uploading,   setUploading]   = useState(false)
  const [showStats,   setShowStats]   = useState(false)
  const fileRef = useRef()

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setStat = (k, v) => setForm((f) => ({ ...f, analytics: { ...(f.analytics || {}), [k]: v === '' ? 0 : Number(v) } }))

  if (!open) return null

  const isPosted = form.status === 'posted' || form.status === 'analyzed'

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      set('media_urls', [...(form.media_urls || []), url])
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (i) => {
    set('media_urls', (form.media_urls || []).filter((_, idx) => idx !== i))
  }

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

          {/* Images */}
          <div>
            <label className="block text-[11px] font-semibold text-ink-400 uppercase tracking-wider mb-2">
              Post Image / Thumbnail
            </label>
            <div className="flex gap-2 flex-wrap">
              {(form.media_urls || []).map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-ivory-100 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                    <Trash2 size={14} className="text-white" />
                  </button>
                </div>
              ))}
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-ivory-300 bg-ivory-50
                  flex flex-col items-center justify-center gap-1 active:bg-ivory-100 transition-colors disabled:opacity-50">
                {uploading
                  ? <div className="w-4 h-4 border-2 border-camel-500 border-t-transparent rounded-full animate-spin" />
                  : <><Camera size={18} className="text-ink-400" /><span className="text-[10px] text-ink-400 font-medium">Add</span></>
                }
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
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
              placeholder="The first 3 seconds / opening line…"
              rows={2} className="input-field resize-none" />
          </Field>

          {/* Status + Date */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className="input-field">
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Post Date">
              <input type="date" value={form.posting_date || ''} onChange={(e) => set('posting_date', e.target.value)}
                className="input-field" />
            </Field>
          </div>

          {/* ── Analytics section (collapsible) ─────────────── */}
          <div className={`border rounded-2xl overflow-hidden transition-colors
            ${isPosted ? 'bg-camel-50 border-camel-200' : 'bg-ivory-50 border-ivory-200'}`}>
            <button onClick={() => setShowStats((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={15} className={isPosted ? 'text-camel-600' : 'text-ink-400'} />
                <p className={`text-[13px] font-bold ${isPosted ? 'text-camel-700' : 'text-ink-600'}`}>
                  📊 Analytics & Performance
                </p>
                {isPosted && !showStats && (
                  <span className="text-[10px] font-semibold text-camel-500 bg-white px-2 py-0.5 rounded-full">
                    Add stats
                  </span>
                )}
              </div>
              {showStats ? <ChevronUp size={15} className="text-ink-400" /> : <ChevronDown size={15} className="text-ink-400" />}
            </button>

            {showStats && (
              <div className="px-4 pb-4 space-y-2.5 border-t border-camel-100">
                <p className="text-[11px] text-ink-500 leading-relaxed mt-2.5 mb-1">
                  Enter the numbers from Instagram Insights:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {METRICS.map((m) => {
                    const Icon = m.icon
                    return (
                      <div key={m.key} className="bg-white rounded-xl border border-ivory-200 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Icon size={11} className={m.color} />
                          <span className="text-[10px] font-bold text-ink-500 uppercase tracking-wide">{m.label}</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={form.analytics?.[m.key] || ''}
                          onChange={(e) => setStat(m.key, e.target.value)}
                          placeholder="0"
                          className="w-full bg-ivory-50 border border-ivory-200 rounded-lg px-2 py-1.5 text-sm
                            text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-camel-400"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Caption */}
          <Field label="Caption">
            <textarea value={form.caption} onChange={(e) => set('caption', e.target.value)}
              placeholder="Draft your caption here…"
              rows={3} className="input-field resize-none" />
          </Field>

          {/* Hashtags */}
          <Field label="Hashtags">
            <input value={form.hashtags} onChange={(e) => set('hashtags', e.target.value)}
              placeholder="#brandrop #fashion…"
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
  const [quickOpen,    setQuickOpen]    = useState(false)
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

  const summary = STATUSES.map((s) => ({
    ...s,
    count: items.filter((c) => c.status === s.value).length,
  })).filter((s) => s.count > 0)

  return (
    <div className="space-y-5">

      {/* Quick Add Past Post — prominent banner */}
      <button onClick={() => setQuickOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl
          bg-gradient-to-r from-ink-900 to-ink-800 text-white shadow-lifted
          active:opacity-90 transition-all">
        <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <Archive size={14} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-[13px] font-bold leading-none">Add Past Post / Reel</p>
          <p className="text-[10px] text-white/60 mt-0.5">Backfill old content with analytics</p>
        </div>
        <Plus size={14} className="text-white/70" />
      </button>

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

      {items.length > 0 ? (
        <div className="space-y-2.5">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} onEdit={handleEdit} onDelete={deleteContentItem} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-14 h-14 bg-camel-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎬</span>
          </div>
          <p className="text-[15px] font-bold text-ink-900 mb-1">No content yet</p>
          <p className="text-sm text-ink-400 mb-5">Add your Instagram posts and track their performance.</p>
          <button onClick={() => { setEditItem(null); setModalOpen(true) }}
            className="bg-camel-500 text-white font-bold rounded-xl px-5 py-2.5 text-sm
              active:bg-camel-600 shadow-lifted inline-flex items-center gap-2">
            <Plus size={15} /> Add First Post
          </button>
        </div>
      )}

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

      <QuickPastPostModal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
      />
    </div>
  )
}
