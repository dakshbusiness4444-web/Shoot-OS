import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  User, Building2, Bell, Moon, ChevronRight,
  LogOut, Instagram, ExternalLink, Shield, Camera,
  Check, AlertCircle, Unlink, RefreshCw, Loader2
} from 'lucide-react'
import useStore from '../store/useStore'
import EditProfileModal from '../components/ui/EditProfileModal'
import { getInstagramOAuthUrl, IG_APP_ID } from '../lib/instagram'

function Row({ icon: Icon, label, sub, onClick, danger, right }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-4 py-3.5 transition-colors
        hover:bg-ivory-50 active:bg-ivory-100 ${danger ? 'text-rose-500' : 'text-ink-700'}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
        ${danger ? 'bg-rose-100' : 'bg-ivory-100'}`}>
        <Icon size={15} className={danger ? 'text-rose-500' : 'text-ink-500'} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className={`text-[13px] font-semibold leading-none ${danger ? 'text-rose-500' : 'text-ink-800'}`}>{label}</p>
        {sub && <p className="text-[11px] text-ink-400 mt-0.5">{sub}</p>}
      </div>
      {right || <ChevronRight size={15} className={danger ? 'text-rose-400' : 'text-ink-300'} />}
    </button>
  )
}

function Section({ title, children }) {
  return (
    <div>
      {title && <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest px-1 mb-1">{title}</p>}
      <div className="bg-white rounded-2xl border border-ivory-200 overflow-hidden shadow-soft divide-y divide-ivory-100">
        {children}
      </div>
    </div>
  )
}

export default function Account() {
  const navigate      = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentUser, userProfile, signOut, instagramAccount, disconnectInstagram, syncInstagramData, igLoading } = useStore()

  const [editOpen,     setEditOpen]     = useState(false)
  const [igToast,      setIgToast]      = useState('')   // 'connected' | 'error' | ''
  const [disconnecting, setDisconnecting] = useState(false)

  // Handle OAuth callback redirect params
  useEffect(() => {
    const igStatus = searchParams.get('instagram')
    if (igStatus === 'connected') {
      setIgToast('connected')
      useStore.getState().loadInstagramAccount().then((acc) => {
        if (acc) useStore.getState().syncInstagramData()
      })
      setTimeout(() => setIgToast(''), 4000)
      setSearchParams({}, { replace: true })
    } else if (igStatus === 'error') {
      setIgToast('error')
      setTimeout(() => setIgToast(''), 5000)
      setSearchParams({}, { replace: true })
    }
  }, [])

  const workspaceName = userProfile?.workspace_name || userProfile?.username || 'Workspace'
  const username      = userProfile?.username ? `@${userProfile.username}` : ''
  const email         = currentUser?.email || ''
  const avatarLetter  = workspaceName[0]?.toUpperCase() || '?'
  const avatarUrl     = userProfile?.avatar_url || null

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleConnectInstagram = () => {
    if (!IG_APP_ID) {
      alert('Instagram App ID not configured.\nAdd VITE_INSTAGRAM_APP_ID to your .env file first.\nSee the setup guide below.')
      return
    }
    if (!currentUser?.id) return
    window.location.href = getInstagramOAuthUrl(currentUser.id)
  }

  const handleDisconnectInstagram = async () => {
    if (!confirm('Disconnect Instagram account?')) return
    setDisconnecting(true)
    await disconnectInstagram()
    setDisconnecting(false)
  }

  const igConnected   = !!instagramAccount?.instagram_user_id
  const igUsername    = instagramAccount?.username ? `@${instagramAccount.username}` : ''
  const igFollowers   = instagramAccount?.followers_count
    ? instagramAccount.followers_count.toLocaleString()
    : null

  return (
    <>
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />

      {/* ── Toast notifications ─────────────────────────────────────── */}
      {igToast === 'connected' && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <div className="flex items-center gap-2.5 bg-moss-500 text-white px-5 py-3 rounded-2xl shadow-lifted">
            <Check size={15} />
            <span className="text-[13px] font-bold">Instagram connected!</span>
          </div>
        </div>
      )}
      {igToast === 'error' && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <div className="flex items-center gap-2.5 bg-rose-500 text-white px-5 py-3 rounded-2xl shadow-lifted">
            <AlertCircle size={15} />
            <span className="text-[13px] font-bold">Instagram connection failed. Try again.</span>
          </div>
        </div>
      )}

      <div className="space-y-5 pb-4">

        {/* ── Profile card ─────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-camel-500 to-camel-600 rounded-3xl p-5 shadow-lifted">
          <div className="flex items-center gap-4">

            <button onClick={() => setEditOpen(true)}
              className="relative flex-shrink-0 group active:opacity-80">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center">
                {avatarUrl
                  ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  : <span className="text-white font-black text-2xl">{avatarLetter}</span>
                }
              </div>
              <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center
                opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                <Camera size={16} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Camera size={10} className="text-camel-500" />
              </div>
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-bold text-white leading-none truncate">{workspaceName}</p>
              {username && <p className="text-[13px] text-white/70 mt-1 truncate">{username}</p>}
              <p className="text-[11px] text-white/50 mt-0.5 truncate">{email}</p>
            </div>

            <button onClick={() => setEditOpen(true)}
              className="bg-white/15 text-white/90 text-[11px] font-bold px-3 py-1.5
                rounded-full active:bg-white/25 transition-colors flex-shrink-0">
              Edit
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
            <span className="bg-white/15 text-white/90 text-[11px] font-bold px-2.5 py-1 rounded-full">
              Free plan
            </span>
            <span className="text-white/50 text-[11px]">·</span>
            <span className="text-white/50 text-[11px]">Content OS</span>
          </div>
        </div>

        {/* ── Workspace ───────────────────────────────────────── */}
        <Section title="Workspace">
          <Row icon={Building2} label="Workspace settings" sub={workspaceName} onClick={() => setEditOpen(true)} />
          <Row icon={User}      label="Edit profile"        sub="Name, username, photo" onClick={() => setEditOpen(true)} />
          <Row icon={Bell}      label="Notifications"       sub="Reminders & alerts" onClick={() => {}} />
        </Section>

        {/* ── Connected Platforms ─────────────────────────────── */}
        <Section title="Connected platforms">

          {/* Instagram */}
          {igConnected ? (
            <div className="px-4 py-3.5">
              {/* Connected state */}
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]
                  flex items-center justify-center flex-shrink-0">
                  <Instagram size={15} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink-800 leading-none">Instagram</p>
                  <p className="text-[11px] text-ink-400 mt-0.5 truncate">
                    {igUsername}{igFollowers ? ` · ${igFollowers} followers` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {/* Sync */}
                  <button onClick={() => syncInstagramData()}
                    disabled={igLoading}
                    className="w-7 h-7 rounded-lg bg-ivory-100 flex items-center justify-center
                      active:bg-ivory-200 disabled:opacity-50 transition-colors">
                    {igLoading
                      ? <Loader2 size={12} className="text-ink-400 animate-spin" />
                      : <RefreshCw size={12} className="text-ink-400" />
                    }
                  </button>
                  {/* Disconnect */}
                  <button onClick={handleDisconnectInstagram}
                    disabled={disconnecting}
                    className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center
                      active:bg-rose-100 disabled:opacity-50 transition-colors">
                    {disconnecting
                      ? <Loader2 size={12} className="text-rose-400 animate-spin" />
                      : <Unlink size={12} className="text-rose-400" />
                    }
                  </button>
                  {/* Connected badge */}
                  <span className="text-[10px] font-bold text-moss-600 bg-moss-50 border border-moss-100 px-2 py-1 rounded-full flex items-center gap-1">
                    <Check size={9} /> Live
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={handleConnectInstagram}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-ivory-50 active:bg-ivory-100 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]
                flex items-center justify-center flex-shrink-0">
                <Instagram size={15} className="text-white" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-semibold text-ink-800 leading-none">Instagram</p>
                <p className="text-[11px] text-ink-400 mt-0.5">Tap to connect your account</p>
              </div>
              <span className="text-[11px] font-bold text-white bg-gradient-to-r from-[#833ab4] to-[#fd1d1d]
                px-3 py-1.5 rounded-full shadow-sm">
                Connect
              </span>
            </button>
          )}

          {/* Pinterest — coming soon */}
          <Row icon={ExternalLink} label="Pinterest" sub="Coming soon"
            right={<span className="text-[10px] font-bold text-camel-400 bg-camel-50 px-2 py-1 rounded-full">Soon</span>}
            onClick={() => {}} />
        </Section>

        {/* ── Setup guide (only if IG App ID not set) ─────────── */}
        {!IG_APP_ID && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-amber-500 flex-shrink-0" />
              <p className="text-[13px] font-bold text-amber-800">Instagram setup required</p>
            </div>
            <div className="space-y-2 text-[12px] text-amber-700 leading-relaxed">
              <p><span className="font-bold">1.</span> Go to <span className="font-mono bg-amber-100 px-1 rounded">developers.facebook.com</span> → Create App → Business type</p>
              <p><span className="font-bold">2.</span> Add product: <span className="font-semibold">Instagram</span> → Use case: <span className="font-semibold">Instagram API with Instagram Login</span></p>
              <p><span className="font-bold">3.</span> Settings → Basic → copy your <span className="font-semibold">App ID</span> and <span className="font-semibold">App Secret</span></p>
              <p><span className="font-bold">4.</span> Add redirect URI: <span className="font-mono bg-amber-100 px-1 rounded text-[10px] break-all">
                {import.meta.env.VITE_SUPABASE_URL}/functions/v1/instagram-callback
              </span></p>
              <p><span className="font-bold">5.</span> Add to your <span className="font-mono bg-amber-100 px-1 rounded">.env</span> file: <span className="font-mono bg-amber-100 px-1 rounded">VITE_INSTAGRAM_APP_ID=your_app_id</span></p>
              <p><span className="font-bold">6.</span> In Supabase dashboard → Edge Functions → instagram-callback → Secrets, add <span className="font-mono bg-amber-100 px-1 rounded">INSTAGRAM_APP_ID</span>, <span className="font-mono bg-amber-100 px-1 rounded">INSTAGRAM_APP_SECRET</span>, and <span className="font-mono bg-amber-100 px-1 rounded">APP_URL=https://indirookh-shoot-os.vercel.app</span></p>
            </div>
          </div>
        )}

        {/* ── Preferences ─────────────────────────────────────── */}
        <Section title="Preferences">
          <Row icon={Moon}   label="Appearance"  sub="Light mode" onClick={() => {}} />
          <Row icon={Shield} label="Privacy"     sub="Data & security" onClick={() => {}} />
        </Section>

        {/* ── Danger ──────────────────────────────────────────── */}
        <Section>
          <Row icon={LogOut} label="Sign out" danger onClick={handleSignOut} />
        </Section>

        <p className="text-center text-[10px] text-ink-300 pt-1">
          Brandrop OS · Content Operating System
        </p>
      </div>
    </>
  )
}
