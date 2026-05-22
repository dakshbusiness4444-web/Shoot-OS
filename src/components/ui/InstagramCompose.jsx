import { useState, useRef } from 'react'
import {
  X, Image, Hash, Clock, Send, Calendar,
  Loader2, Check, AlertCircle, Plus, Trash2,
  ChevronDown, ChevronUp
} from 'lucide-react'
import useStore from '../../store/useStore'
import { publishIgPost, publishIgCarousel } from '../../lib/instagram'

const MAX_CAPTION   = 2200
const MAX_HASHTAGS  = 30
const POPULAR_TAGS  = ['#indirookh', '#indianfashion', '#ootd', '#sustainablefashion', '#handcrafted', '#ethnicwear', '#fashionblogger', '#styleinspo', '#newcollection', '#shopnow']

export default function InstagramCompose({ open, onClose }) {
  const { instagramAccount, uploadImage, addContentItem, updateContentItem } = useStore()

  const [images,       setImages]       = useState([])     // { file, preview, url }
  const [caption,      setCaption]      = useState('')
  const [hashtags,     setHashtags]     = useState('')
  const [hashInput,    setHashInput]    = useState('')
  const [showHashHelp, setShowHashHelp] = useState(false)
  const [scheduled,    setScheduled]    = useState(false)
  const [schedDate,    setSchedDate]    = useState('')
  const [schedTime,    setSchedTime]    = useState('09:00')
  const [step,         setStep]         = useState('compose')  // compose | preview | done
  const [publishing,   setPublishing]   = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')

  const fileRef = useRef()

  if (!open) return null

  const fullCaption  = `${caption}${hashtags ? '\n\n' + hashtags : ''}`
  const hashCount    = (hashtags.match(/#\w+/g) || []).length
  const isConnected  = !!instagramAccount?.access_token
  const canPublish   = isConnected && images.length > 0

  // ── Image pick ─────────────────────────────────────────────────────────
  const handleImagePick = (e) => {
    const files = Array.from(e.target.files || [])
    const picked = files.slice(0, 10 - images.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      url: null,
    }))
    setImages((prev) => [...prev, ...picked])
    setError('')
    e.target.value = ''
  }

  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i))

  // ── Hashtag helpers ────────────────────────────────────────────────────
  const addHashtag = (tag) => {
    if (hashCount >= MAX_HASHTAGS) return
    const clean = tag.startsWith('#') ? tag : `#${tag}`
    setHashtags((prev) => prev ? `${prev} ${clean}` : clean)
  }

  const handleHashInput = (e) => {
    const v = e.target.value
    if (v.endsWith(' ') || v.endsWith('\n')) {
      const tag = v.trim()
      if (tag) addHashtag(tag)
      setHashInput('')
    } else {
      setHashInput(v)
    }
  }

  // ── Upload images ──────────────────────────────────────────────────────
  const uploadImages = async () => {
    const uploaded = await Promise.all(
      images.map(async (img) => {
        if (img.url) return img
        const url = await uploadImage(img.file)
        return { ...img, url }
      })
    )
    setImages(uploaded)
    return uploaded
  }

  // ── Save as draft ──────────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!caption.trim() && images.length === 0) {
      setError('Add a caption or at least one image')
      return
    }
    setSaving(true)
    setError('')
    try {
      const uploaded = images.length > 0 ? await uploadImages() : images
      await addContentItem({
        platform:      'instagram',
        content_type:  images.length > 1 ? 'carousel' : 'post',
        status:        'draft',
        caption:       fullCaption,
        media_urls:    uploaded.map((i) => i.url).filter(Boolean),
        scheduled_for: scheduled && schedDate ? `${schedDate}T${schedTime}:00` : null,
      })
      onClose()
      resetForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Schedule ───────────────────────────────────────────────────────────
  const handleSchedule = async () => {
    if (!schedDate) { setError('Pick a date to schedule'); return }
    if (images.length === 0) { setError('Add at least one image'); return }
    setSaving(true)
    setError('')
    try {
      const uploaded = await uploadImages()
      await addContentItem({
        platform:      'instagram',
        content_type:  uploaded.length > 1 ? 'carousel' : 'post',
        status:        'scheduled',
        caption:       fullCaption,
        media_urls:    uploaded.map((i) => i.url).filter(Boolean),
        scheduled_for: `${schedDate}T${schedTime}:00`,
      })
      onClose()
      resetForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Publish now ────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!canPublish) return
    if (images.length === 0) { setError('Add at least one image'); return }
    setPublishing(true)
    setError('')
    try {
      const uploaded = await uploadImages()
      const urls = uploaded.map((i) => i.url).filter(Boolean)

      if (urls.length > 1) {
        await publishIgCarousel({
          token:     instagramAccount.access_token,
          igUserId:  instagramAccount.instagram_user_id,
          imageUrls: urls,
          caption:   fullCaption,
        })
      } else {
        await publishIgPost({
          token:    instagramAccount.access_token,
          igUserId: instagramAccount.instagram_user_id,
          imageUrl: urls[0],
          caption:  fullCaption,
        })
      }

      await addContentItem({
        platform:     'instagram',
        content_type: urls.length > 1 ? 'carousel' : 'post',
        status:       'posted',
        caption:      fullCaption,
        media_urls:   urls,
        posted_at:    new Date().toISOString(),
      })

      setStep('done')
    } catch (err) {
      setError(err.message || 'Failed to publish. Try again.')
    } finally {
      setPublishing(false)
    }
  }

  const resetForm = () => {
    setImages([]); setCaption(''); setHashtags(''); setHashInput('')
    setScheduled(false); setSchedDate(''); setSchedTime('09:00')
    setStep('compose'); setError('')
  }

  const handleClose = () => { resetForm(); onClose() }

  // ── Done screen ────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="fixed inset-0 z-50 flex items-end animate-backdrop-in">
        <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative w-full bg-white rounded-t-3xl p-8 flex flex-col items-center gap-4 animate-sheet-up">
          <div className="w-16 h-16 rounded-full bg-moss-100 flex items-center justify-center">
            <Check size={32} className="text-moss-500" />
          </div>
          <p className="text-[17px] font-black text-ink-900">Posted to Instagram!</p>
          <p className="text-[13px] text-ink-400 text-center">Your post is live. It may take a minute to appear.</p>
          <button onClick={handleClose}
            className="mt-2 bg-camel-500 text-white font-bold px-8 py-3 rounded-2xl shadow-lifted active:bg-camel-600">
            Done
          </button>
        </div>
      </div>
    )
  }

  // ── Main compose sheet ─────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end animate-backdrop-in">
      <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full bg-white rounded-t-3xl animate-sheet-up max-h-[94vh] overflow-y-auto">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
          <div className="w-10 h-1 bg-ivory-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 sticky top-5 bg-white z-10 border-b border-ivory-100">
          <div>
            <p className="text-[15px] font-black text-ink-900">New Instagram Post</p>
            <p className="text-[11px] text-ink-400">
              {images.length > 1 ? `Carousel · ${images.length} images` : images.length === 1 ? 'Single image' : 'Compose your post'}
            </p>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 rounded-full bg-ivory-100 flex items-center justify-center active:bg-ivory-200">
            <X size={15} className="text-ink-500" />
          </button>
        </div>

        <div className="px-5 pt-5 pb-10 space-y-5">

          {/* ── Not connected warning ── */}
          {!isConnected && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-700 font-medium">
                Instagram not connected. You can save as draft but can't publish yet.
              </p>
            </div>
          )}

          {/* ── Image picker ── */}
          <div>
            <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-2">
              Images <span className="normal-case font-normal text-ink-400">(up to 10 for carousel)</span>
            </label>

            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-ivory-100 flex-shrink-0 group">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center
                      opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                    <Trash2 size={14} className="text-white" />
                  </button>
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-camel-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Cover</span>
                  )}
                </div>
              ))}

              {images.length < 10 && (
                <button onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-ivory-300 bg-ivory-50
                    flex flex-col items-center justify-center gap-1 active:bg-ivory-100 transition-colors flex-shrink-0">
                  <Plus size={18} className="text-ink-300" />
                  <span className="text-[10px] text-ink-400 font-medium">Add</span>
                </button>
              )}
            </div>

            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImagePick} />
          </div>

          {/* ── Caption ── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">Caption</label>
              <span className={`text-[10px] font-medium ${caption.length > MAX_CAPTION * 0.9 ? 'text-rose-400' : 'text-ink-400'}`}>
                {caption.length}/{MAX_CAPTION}
              </span>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
              placeholder="Write your caption…"
              rows={4}
              className="w-full bg-ivory-100 border border-ivory-300 rounded-xl px-4 py-3 text-sm
                text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2
                focus:ring-camel-300 focus:border-camel-400 transition-all resize-none"
            />
          </div>

          {/* ── Hashtags ── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <button
                onClick={() => setShowHashHelp((v) => !v)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-ink-500 uppercase tracking-wider">
                <Hash size={12} />
                Hashtags
                {showHashHelp ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
              <span className={`text-[10px] font-medium ${hashCount > 28 ? 'text-rose-400' : 'text-ink-400'}`}>
                {hashCount}/{MAX_HASHTAGS}
              </span>
            </div>

            {/* Quick-add popular tags */}
            {showHashHelp && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {POPULAR_TAGS.map((tag) => (
                  <button key={tag} onClick={() => addHashtag(tag)}
                    className="text-[11px] bg-camel-50 text-camel-600 font-semibold px-2.5 py-1 rounded-full
                      active:bg-camel-100 transition-colors border border-camel-100">
                    {tag}
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <Hash size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
              <input
                type="text"
                value={hashInput}
                onChange={handleHashInput}
                placeholder="Type a hashtag and press space…"
                className="w-full bg-ivory-100 border border-ivory-300 rounded-xl pl-8 pr-4 py-3 text-sm
                  text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2
                  focus:ring-camel-300 focus:border-camel-400 transition-all"
              />
            </div>

            {hashtags && (
              <div className="mt-2 bg-ivory-50 border border-ivory-200 rounded-xl px-3 py-2">
                <p className="text-[11px] text-ink-500 leading-relaxed break-words">{hashtags}</p>
              </div>
            )}
          </div>

          {/* ── Schedule toggle ── */}
          <div className="bg-ivory-50 border border-ivory-200 rounded-2xl p-4">
            <button
              onClick={() => setScheduled((v) => !v)}
              className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center
                  ${scheduled ? 'bg-camel-500' : 'bg-ivory-200'}`}>
                  <Clock size={14} className={scheduled ? 'text-white' : 'text-ink-400'} />
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-bold text-ink-800">Schedule post</p>
                  <p className="text-[11px] text-ink-400">Pick a date and time</p>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors ${scheduled ? 'bg-camel-500' : 'bg-ivory-300'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm mt-0.5 transition-transform
                  ${scheduled ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5 ml-0'}`} />
              </div>
            </button>

            {scheduled && (
              <div className="flex gap-2 mt-3">
                <input
                  type="date"
                  value={schedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSchedDate(e.target.value)}
                  className="flex-1 bg-white border border-ivory-300 rounded-xl px-3 py-2 text-sm
                    text-ink-900 focus:outline-none focus:ring-2 focus:ring-camel-300"
                />
                <input
                  type="time"
                  value={schedTime}
                  onChange={(e) => setSchedTime(e.target.value)}
                  className="w-28 bg-white border border-ivory-300 rounded-xl px-3 py-2 text-sm
                    text-ink-900 focus:outline-none focus:ring-2 focus:ring-camel-300"
                />
              </div>
            )}
          </div>

          {/* Caption preview */}
          {(caption || hashtags) && (
            <div>
              <p className="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-2">Preview</p>
              <div className="bg-white border border-ivory-200 rounded-2xl p-4 shadow-soft">
                {images[0] && (
                  <img src={images[0].preview} alt=""
                    className="w-full aspect-square object-cover rounded-xl mb-3" />
                )}
                <p className="text-[13px] text-ink-800 leading-relaxed whitespace-pre-wrap break-words">
                  {fullCaption}
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-rose-500 font-medium">{error}</p>
            </div>
          )}

          {/* ── Action buttons ── */}
          <div className="space-y-2.5">

            {/* Publish Now */}
            {isConnected && !scheduled && (
              <button
                onClick={handlePublish}
                disabled={publishing || images.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
                  font-bold text-[14px] text-white bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]
                  shadow-lifted active:opacity-90 disabled:opacity-50 transition-all">
                {publishing
                  ? <><Loader2 size={16} className="animate-spin" /> Publishing…</>
                  : <><Send size={15} /> Post to Instagram Now</>
                }
              </button>
            )}

            {/* Schedule */}
            {scheduled && (
              <button
                onClick={handleSchedule}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
                  font-bold text-[14px] text-white bg-camel-500 shadow-lifted active:bg-camel-600
                  disabled:opacity-50 transition-all">
                {saving
                  ? <><Loader2 size={16} className="animate-spin" /> Scheduling…</>
                  : <><Calendar size={15} /> Schedule Post</>
                }
              </button>
            )}

            {/* Save Draft */}
            <button
              onClick={handleSaveDraft}
              disabled={saving || publishing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                font-bold text-[14px] text-ink-600 bg-ivory-100 active:bg-ivory-200
                disabled:opacity-50 transition-all">
              {saving && !scheduled
                ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                : 'Save as Draft'
              }
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
