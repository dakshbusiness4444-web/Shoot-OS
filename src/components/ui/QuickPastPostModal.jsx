import { useState, useRef } from 'react'
import {
  X, Camera, Trash2, Plus, Loader2, Check,
  Eye, Heart, MessageCircle, Share2, Bookmark, TrendingUp, BarChart3, Users
} from 'lucide-react'
import useStore from '../../store/useStore'

const CONTENT_TYPES = [
  { value: 'reel',      label: '🎬 Reel'      },
  { value: 'post',      label: '📸 Post'      },
  { value: 'carousel',  label: '🎠 Carousel'  },
  { value: 'story',     label: '⚡ Story'      },
  { value: 'collab',    label: '🤝 Collab'    },
  { value: 'bts',       label: '🎥 BTS'        },
  { value: 'lifestyle', label: '✨ Lifestyle'  },
  { value: 'educational',label: '📚 Educational' },
]

const METRICS = [
  { key: 'views',           label: 'Views',       icon: Eye,           color: 'text-camel-500', bg: 'bg-camel-50',  hint: 'Reel only' },
  { key: 'likes',           label: 'Likes',       icon: Heart,         color: 'text-rose-500',  bg: 'bg-rose-50' },
  { key: 'comments',        label: 'Comments',    icon: MessageCircle, color: 'text-moss-500',  bg: 'bg-moss-50' },
  { key: 'shares',          label: 'Shares',      icon: Share2,        color: 'text-camel-500', bg: 'bg-camel-50' },
  { key: 'saves',           label: 'Saves',       icon: Bookmark,      color: 'text-earth-500', bg: 'bg-sand-50' },
  { key: 'reach',           label: 'Reach',       icon: TrendingUp,    color: 'text-ink-600',   bg: 'bg-ivory-100' },
  { key: 'impressions',     label: 'Impressions', icon: BarChart3,     color: 'text-ink-600',   bg: 'bg-ivory-100' },
  { key: 'profile_visits',  label: 'Profile Visits', icon: Users,      color: 'text-camel-500', bg: 'bg-camel-50' },
  { key: 'followers_gained',label: 'New Followers',  icon: Plus,       color: 'text-moss-500',  bg: 'bg-moss-50' },
]

export default function QuickPastPostModal({ open, onClose, onSaved }) {
  const { uploadImage, addContentItem } = useStore()
  const [type,     setType]     = useState('reel')
  const [date,     setDate]     = useState(new Date().toISOString().split('T')[0])
  const [title,    setTitle]    = useState('')
  const [image,    setImage]    = useState(null)   // { file, preview, url }
  const [uploading,setUploading]= useState(false)
  const [metrics,  setMetrics]  = useState({})
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)
  const fileRef = useRef()

  if (!open) return null

  const setM = (k, v) => setMetrics((m) => ({ ...m, [k]: v === '' ? 0 : Number(v) }))

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setImage({ file, preview: URL.createObjectURL(file), url })
    } catch (err) {
      setError('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    if (!date) { setError('Pick the date this was posted'); return }
    setSaving(true)
    setError('')
    try {
      await addContentItem({
        platform:      'instagram',
        content_type:  type,
        title:         title.trim() || `${type.charAt(0).toUpperCase() + type.slice(1)} · ${date}`,
        status:        'analyzed',
        posting_date:  date,
        posted_at:     date,
        media_urls:    image?.url ? [image.url] : [],
        analytics:     metrics,
      })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        resetForm()
        onSaved?.()
        onClose()
      }, 900)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAndAddAnother = async () => {
    if (!date) { setError('Pick the date this was posted'); return }
    setSaving(true)
    setError('')
    try {
      await addContentItem({
        platform:      'instagram',
        content_type:  type,
        title:         title.trim() || `${type.charAt(0).toUpperCase() + type.slice(1)} · ${date}`,
        status:        'analyzed',
        posting_date:  date,
        posted_at:     date,
        media_urls:    image?.url ? [image.url] : [],
        analytics:     metrics,
      })
      // Reset only form fields, keep modal open
      setImage(null); setTitle(''); setMetrics({})
      onSaved?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setType('reel'); setDate(new Date().toISOString().split('T')[0])
    setTitle(''); setImage(null); setMetrics({}); setError('')
  }

  const handleClose = () => { resetForm(); onClose() }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-end animate-backdrop-in">
        <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" />
        <div className="relative w-full bg-white rounded-t-3xl p-8 flex flex-col items-center gap-3 animate-sheet-up">
          <div className="w-14 h-14 rounded-full bg-moss-100 flex items-center justify-center">
            <Check size={28} className="text-moss-500" />
          </div>
          <p className="text-[15px] font-black text-ink-900">Saved!</p>
          <p className="text-[12px] text-ink-400">Post added to your archive</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end animate-backdrop-in">
      <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full bg-white rounded-t-3xl animate-sheet-up max-h-[94vh] overflow-y-auto">

        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
          <div className="w-10 h-1 bg-ivory-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 pt-2 pb-4 sticky top-5 bg-white z-10 border-b border-ivory-100">
          <div>
            <p className="text-[15px] font-black text-ink-900">Add Past Post</p>
            <p className="text-[11px] text-ink-400">Quick backfill for old reels &amp; posts</p>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 rounded-full bg-ivory-100 flex items-center justify-center active:bg-ivory-200">
            <X size={15} className="text-ink-500" />
          </button>
        </div>

        <div className="px-5 pt-5 pb-8 space-y-5">

          {/* Type chips */}
          <div>
            <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-2">Type</label>
            <div className="flex flex-wrap gap-1.5">
              {CONTENT_TYPES.map((t) => (
                <button key={t.value} onClick={() => setType(t.value)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors
                    ${type === t.value
                      ? 'bg-camel-500 text-white shadow-sm'
                      : 'bg-ivory-100 text-ink-500 active:bg-ivory-200'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date + Title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">
                Date Posted *
              </label>
              <input type="date" value={date} max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-ivory-100 border border-ivory-300 rounded-xl px-3 py-2.5 text-sm
                  text-ink-900 focus:outline-none focus:ring-2 focus:ring-camel-300" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">
                Title <span className="font-normal text-ink-400">(optional)</span>
              </label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Diwali launch"
                className="w-full bg-ivory-100 border border-ivory-300 rounded-xl px-3 py-2.5 text-sm
                  text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-camel-300" />
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-2">
              Thumbnail <span className="font-normal text-ink-400">(optional)</span>
            </label>
            <div className="flex gap-2">
              {image ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-ivory-100 group">
                  <img src={image.preview} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setImage(null)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                    <Trash2 size={16} className="text-white" />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-ivory-300 bg-ivory-50
                    flex flex-col items-center justify-center gap-1 active:bg-ivory-100 transition-colors disabled:opacity-50">
                  {uploading
                    ? <Loader2 size={18} className="text-camel-500 animate-spin" />
                    : <><Camera size={18} className="text-ink-400" /><span className="text-[10px] text-ink-400 font-medium">Upload</span></>
                  }
                </button>
              )}
              <p className="text-[11px] text-ink-400 self-center max-w-[180px]">
                Take a screenshot of your post and upload here. Helps identify which post this is.
              </p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
          </div>

          {/* Metrics — main focus */}
          <div>
            <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-2">
              Analytics from Instagram Insights
            </label>
            <div className="grid grid-cols-3 gap-2">
              {METRICS.map((m) => {
                const Icon = m.icon
                const showThis = m.key !== 'views' || type === 'reel'
                if (!showThis && m.hint === 'Reel only') return null
                return (
                  <div key={m.key} className="bg-white rounded-xl border border-ivory-200 p-2.5 shadow-soft">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon size={11} className={m.color} />
                      <span className="text-[10px] font-bold text-ink-500 uppercase tracking-wide">{m.label}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={metrics[m.key] ?? ''}
                      onChange={(e) => setM(m.key, e.target.value)}
                      placeholder="0"
                      className="w-full bg-ivory-50 border border-ivory-200 rounded-lg px-2 py-1.5 text-sm
                        text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-camel-400"
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <p className="text-[12px] text-rose-500 font-medium">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-2.5">
            <button onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
                font-bold text-[14px] text-white bg-camel-500 active:bg-camel-600 shadow-lifted
                disabled:opacity-50 transition-all">
              {saving
                ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                : 'Save &amp; Close'
              }
            </button>
            <button onClick={handleSaveAndAddAnother} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                font-bold text-[13px] text-ink-600 bg-ivory-100 active:bg-ivory-200
                disabled:opacity-50 transition-all">
              {saving ? 'Saving…' : 'Save & Add Another →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
