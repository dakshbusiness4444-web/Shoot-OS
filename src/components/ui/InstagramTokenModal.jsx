import { useState } from 'react'
import { X, Key, Loader2, Check, AlertCircle, ExternalLink, Copy } from 'lucide-react'
import useStore from '../../store/useStore'
import { fetchIgProfile, fetchIgMedia } from '../../lib/instagram'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

export default function InstagramTokenModal({ open, onClose }) {
  const { currentUser, loadInstagramAccount } = useStore()
  const [token,      setToken]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState(false)

  if (!open) return null

  const handleConnect = async () => {
    if (!token.trim()) { setError('Paste your access token'); return }
    if (!currentUser?.id) { setError('Not logged in'); return }

    setLoading(true)
    setError('')

    try {
      // 1. Validate token by fetching profile
      const profile = await fetchIgProfile(token.trim())
      if (!profile?.id) throw new Error('Invalid token — no profile returned')

      // 2. Save to instagram_accounts table
      if (!isSupabaseConfigured) throw new Error('Supabase not configured')

      const { error: dbError } = await supabase.from('instagram_accounts').upsert({
        user_id:             currentUser.id,
        instagram_user_id:   String(profile.id),
        username:            profile.username ?? null,
        name:                profile.name ?? null,
        profile_picture_url: profile.profile_picture_url ?? null,
        biography:           profile.biography ?? null,
        followers_count:     profile.followers_count ?? 0,
        media_count:         profile.media_count ?? 0,
        access_token:        token.trim(),
        last_synced_at:      new Date().toISOString(),
        is_active:           true,
      }, { onConflict: 'user_id' })

      if (dbError) throw dbError

      // 3. Reload account
      await loadInstagramAccount()

      // 4. Sync media in background
      try {
        const media = await fetchIgMedia(token.trim(), 50)
        useStore.setState({ igMedia: media.data || [] })
      } catch (_) { /* not fatal */ }

      setSuccess(true)
      setTimeout(() => { onClose(); setSuccess(false); setToken('') }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to connect')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-end animate-backdrop-in">
        <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" />
        <div className="relative w-full bg-white rounded-t-3xl p-8 flex flex-col items-center gap-4 animate-sheet-up">
          <div className="w-16 h-16 rounded-full bg-moss-100 flex items-center justify-center">
            <Check size={32} className="text-moss-500" />
          </div>
          <p className="text-[17px] font-black text-ink-900">Instagram Connected!</p>
          <p className="text-[13px] text-ink-400 text-center">Your account is now live. Syncing your posts…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end animate-backdrop-in">
      <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl animate-sheet-up max-h-[94vh] overflow-y-auto">

        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
          <div className="w-10 h-1 bg-ivory-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 pt-2 pb-4 sticky top-5 bg-white z-10 border-b border-ivory-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#833ab4] to-[#fcb045] flex items-center justify-center">
              <Key size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[15px] font-black text-ink-900">Connect via Token</p>
              <p className="text-[11px] text-ink-400">Manual Instagram connection</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-ivory-100 flex items-center justify-center active:bg-ivory-200">
            <X size={15} className="text-ink-500" />
          </button>
        </div>

        <div className="px-5 pt-5 pb-10 space-y-5">

          {/* Steps */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2.5">
            <p className="text-[12px] font-bold text-amber-800 uppercase tracking-wider">Get your token</p>
            <div className="space-y-2 text-[12px] text-amber-700 leading-relaxed">
              <p><span className="font-bold">1.</span> Add @indirookh as Instagram Tester:
                <a href="https://developers.facebook.com/apps/2324825464924540/roles/roles/" target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] bg-amber-100 px-1.5 py-0.5 rounded ml-1 inline-flex items-center gap-1">
                  Open <ExternalLink size={9} />
                </a>
              </p>
              <p><span className="font-bold">2.</span> Accept invite from Instagram → Settings → Apps and websites → Tester invitations</p>
              <p><span className="font-bold">3.</span> Open API setup:
                <a href="https://developers.facebook.com/apps/2324825464924540/use_cases/customize/API-Setup/?use_case_enum=INSTAGRAM_BUSINESS"
                  target="_blank" rel="noopener noreferrer"
                  className="font-mono text-[10px] bg-amber-100 px-1.5 py-0.5 rounded ml-1 inline-flex items-center gap-1">
                  Open <ExternalLink size={9} />
                </a>
              </p>
              <p><span className="font-bold">4.</span> Step 2 → <span className="font-semibold">"Add account"</span> → Login with @indirookh → Generates a token</p>
              <p><span className="font-bold">5.</span> Copy the long access token → paste below ⬇️</p>
            </div>
          </div>

          {/* Token input */}
          <div>
            <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">
              Long-lived Access Token
            </label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="IGQVJ..."
              rows={4}
              className="w-full bg-ivory-100 border border-ivory-300 rounded-xl px-4 py-3 text-xs font-mono
                text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2
                focus:ring-camel-300 focus:border-camel-400 transition-all resize-none break-all"
            />
            <p className="text-[10px] text-ink-400 mt-1.5">
              Token is stored encrypted in Supabase. Never share with anyone.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-rose-500 font-medium">{error}</p>
            </div>
          )}

          {/* Connect button */}
          <button
            onClick={handleConnect}
            disabled={loading || !token.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
              font-bold text-[14px] text-white bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]
              shadow-lifted active:opacity-90 disabled:opacity-50 transition-all">
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Validating &amp; connecting…</>
              : <><Key size={15} /> Connect Instagram</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
