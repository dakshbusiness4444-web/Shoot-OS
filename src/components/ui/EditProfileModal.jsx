import { useState, useRef } from 'react'
import { X, Camera, Check, AlertCircle, Loader2 } from 'lucide-react'
import useStore from '../../store/useStore'

export default function EditProfileModal({ open, onClose }) {
  const { userProfile, currentUser, updateUserProfile, uploadAvatar } = useStore()

  const [workspaceName, setWorkspaceName] = useState(userProfile?.workspace_name || '')
  const [username,      setUsername]      = useState(userProfile?.username || '')
  const [avatarPreview, setAvatarPreview] = useState(userProfile?.avatar_url || null)
  const [avatarFile,    setAvatarFile]    = useState(null)
  const [saving,        setSaving]        = useState(false)
  const [uploadingImg,  setUploadingImg]  = useState(false)
  const [error,         setError]         = useState('')
  const [success,       setSuccess]       = useState(false)

  const fileInputRef = useRef()

  if (!open) return null

  const avatarLetter = (workspaceName?.[0] || username?.[0] || '?').toUpperCase()

  const handleImagePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setError('')
  }

  const handleSave = async () => {
    setError('')
    if (!workspaceName.trim()) { setError('Brand name cannot be empty'); return }
    if (!username.trim())      { setError('Username cannot be empty'); return }
    if (!/^[a-z0-9_]{3,20}$/.test(username.trim())) {
      setError('Username: 3–20 chars, lowercase letters, numbers, underscores only')
      return
    }

    setSaving(true)
    try {
      let avatarUrl = userProfile?.avatar_url || null
      if (avatarFile) {
        setUploadingImg(true)
        avatarUrl = await uploadAvatar(avatarFile)
        setUploadingImg(false)
      }
      await updateUserProfile({
        workspaceName: workspaceName.trim(),
        username:      username.trim().toLowerCase(),
        avatarUrl,
      })
      setSuccess(true)
      setTimeout(() => { setSuccess(false); onClose() }, 900)
    } catch (err) {
      setError(err.message || 'Failed to save. Try again.')
    } finally {
      setSaving(false)
      setUploadingImg(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end animate-backdrop-in">
      <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full bg-white rounded-t-3xl animate-sheet-up pb-safe max-h-[92vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
          <div className="w-10 h-1 bg-ivory-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 sticky top-5 bg-white z-10 border-b border-ivory-100">
          <div>
            <p className="text-[15px] font-black text-ink-900">Edit Profile</p>
            <p className="text-[11px] text-ink-400">Update your workspace details</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-ivory-100 flex items-center justify-center active:bg-ivory-200">
            <X size={15} className="text-ink-500" />
          </button>
        </div>

        <div className="px-5 pt-5 pb-8 space-y-5">

          {/* ── Avatar ── */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {/* Avatar circle */}
              <div className="w-24 h-24 rounded-full overflow-hidden bg-camel-500
                flex items-center justify-center shadow-lifted ring-4 ring-white">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-white">{avatarLetter}</span>
                )}
              </div>

              {/* Camera overlay button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full
                  bg-camel-500 border-2 border-white flex items-center justify-center
                  shadow-lifted active:bg-camel-600 transition-colors">
                {uploadingImg
                  ? <Loader2 size={13} className="text-white animate-spin" />
                  : <Camera size={13} className="text-white" />
                }
              </button>
            </div>

            <button onClick={() => fileInputRef.current?.click()}
              className="text-[12px] font-semibold text-camel-500 active:text-camel-600">
              {avatarPreview ? 'Change photo' : 'Upload photo'}
            </button>
            <p className="text-[10px] text-ink-400">JPG, PNG or WebP · max 5MB</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagePick}
            />
          </div>

          {/* ── Fields ── */}
          <div className="space-y-4">

            {/* Brand name */}
            <div>
              <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">
                Brand / Workspace Name
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Indirookh, Studio X…"
                className="w-full bg-ivory-100 border border-ivory-300 rounded-xl px-4 py-3 text-sm
                  text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2
                  focus:ring-camel-300 focus:border-camel-400 transition-all"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink-400 pointer-events-none">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="yourbrand"
                  maxLength={20}
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full bg-ivory-100 border border-ivory-300 rounded-xl pl-8 pr-4 py-3 text-sm
                    text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2
                    focus:ring-camel-300 focus:border-camel-400 transition-all"
                />
              </div>
              <p className="text-[10px] text-ink-400 mt-1 ml-1">3–20 chars · letters, numbers, underscores</p>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">
                Email <span className="normal-case font-normal text-ink-400">(can't be changed)</span>
              </label>
              <div className="w-full bg-ivory-50 border border-ivory-200 rounded-xl px-4 py-3 text-sm
                text-ink-400 select-none">
                {currentUser?.email || '—'}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 animate-fade-in">
              <AlertCircle size={14} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-rose-500 font-medium">{error}</p>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
              font-bold text-[14px] text-white shadow-lifted transition-all
              ${success
                ? 'bg-moss-500'
                : 'bg-camel-500 active:bg-camel-600 disabled:opacity-60'
              }`}>
            {success ? (
              <><Check size={16} /> Saved!</>
            ) : saving ? (
              <><Loader2 size={16} className="animate-spin" /> {uploadingImg ? 'Uploading photo…' : 'Saving…'}</>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
