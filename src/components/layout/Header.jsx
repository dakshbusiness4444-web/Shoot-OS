import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, ChevronLeft, Zap, Camera, User, Bell } from 'lucide-react'
import useStore from '../../store/useStore'

const PAGE_META = {
  '/home':        { title: null },
  '/content':     { title: 'Content Plan',  sub: 'Instagram · Pinterest' },
  '/analytics':   { title: 'Analytics',     sub: 'Insights & AI strategy' },
  '/account':     { title: 'Account',       sub: 'Workspace & settings' },
  '/shoot':       { title: 'Shoot',         sub: 'Shoot execution module' },
  '/shoot/plan':  { title: 'Shot List' },
  '/products':    { title: 'Products' },
  '/references':  { title: 'References' },
  '/bts':         { title: 'BTS Ideas' },
  '/extra':       { title: 'Extra Ideas' },
  '/focus':       { title: 'Focus Mode' },
}

export default function Header() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { currentUser, userProfile, signOut } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const isHome        = location.pathname === '/home'
  const meta          = PAGE_META[location.pathname] || { title: 'Brandrop OS' }
  const workspaceName = userProfile?.workspace_name || userProfile?.username || ''
  const username      = userProfile?.username ? `@${userProfile.username}` : currentUser?.email || ''
  const avatarLetter  = workspaceName?.[0]?.toUpperCase() || '?'

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-ivory-200">
        <div className="px-4 lg:px-8 h-14 flex items-center gap-3 max-w-5xl lg:max-w-none">

          {/* Left — mobile: logo or back, desktop: page title */}
          <div className="flex items-center gap-2 flex-1 min-w-0">

            {/* Mobile only: logo on home, back on other pages */}
            <div className="lg:hidden flex items-center gap-2 flex-1 min-w-0">
              {isHome ? (
                <>
                  <div className="w-8 h-8 rounded-xl bg-camel-500 flex items-center justify-center shadow-sm flex-shrink-0">
                    <Zap size={14} className="text-white" fill="white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-ink-900 tracking-tight leading-none">Brandrop OS</p>
                    <p className="text-[10px] text-ink-400 leading-none mt-0.5 truncate">{workspaceName}</p>
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-xl bg-ivory-100 flex items-center justify-center text-ink-500 active:bg-ivory-200 flex-shrink-0">
                    <ChevronLeft size={18} />
                  </button>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink-900 leading-none truncate">{meta.title}</p>
                    {meta.sub && <p className="text-[10px] text-ink-400 leading-none mt-0.5 truncate">{meta.sub}</p>}
                  </div>
                </>
              )}
            </div>

            {/* Desktop only: page title */}
            <div className="hidden lg:flex items-center gap-3 flex-1 min-w-0">
              {isHome ? (
                <div>
                  <p className="text-[17px] font-black text-ink-900 tracking-tight leading-none">
                    {workspaceName && workspaceName !== 'Workspace'
                      ? `${new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, ${workspaceName} 👋`
                      : 'Dashboard'}
                  </p>
                  <p className="text-[11px] text-ink-400 mt-0.5">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-[17px] font-black text-ink-900 leading-none">{meta.title}</p>
                  {meta.sub && <p className="text-[11px] text-ink-400 mt-0.5">{meta.sub}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Bell — desktop only, decorative for now */}
            <button className="hidden lg:flex w-9 h-9 rounded-xl bg-ivory-100 items-center justify-center
              text-ink-400 hover:bg-ivory-200 transition-colors">
              <Bell size={16} />
            </button>

            {/* Avatar */}
            {currentUser && (
              <button onClick={() => setMenuOpen(true)}
                className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-camel-500 flex items-center justify-center
                  text-white font-bold text-[13px] shadow-sm hover:bg-camel-600 active:bg-camel-600
                  transition-colors flex-shrink-0">
                {avatarLetter}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Dropdown */}
      {menuOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute top-[60px] right-4 lg:right-6 w-56 bg-white rounded-2xl shadow-lifted border border-ivory-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}>

            {/* Profile */}
            <div className="px-4 py-4 flex items-center gap-3 border-b border-ivory-100">
              <div className="w-10 h-10 rounded-full bg-camel-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {avatarLetter}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink-900 truncate leading-none">{workspaceName}</p>
                <p className="text-[11px] text-ink-400 mt-0.5 truncate">{username}</p>
              </div>
            </div>

            <button onClick={() => { setMenuOpen(false); navigate('/account') }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-ink-600
                hover:bg-ivory-50 transition-colors border-b border-ivory-100">
              <User size={14} className="text-ink-400" />
              Account & settings
            </button>

            <button onClick={() => { setMenuOpen(false); navigate('/shoot') }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-ink-500
                hover:bg-ivory-50 transition-colors border-b border-ivory-100">
              <Camera size={14} className="text-ink-400" />
              Shoot module
            </button>

            <button onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-500
                hover:bg-ivory-50 transition-colors">
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  )
}
