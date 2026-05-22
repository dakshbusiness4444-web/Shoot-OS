import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, BarChart2,
  UserCircle, Plus, Camera, LogOut, Zap, ChevronRight
} from 'lucide-react'
import useStore from '../../store/useStore'
import CreateModal from '../ui/CreateModal'

const NAV = [
  { path: '/home',      icon: LayoutDashboard, label: 'Home'      },
  { path: '/content',   icon: CalendarDays,    label: 'Content'   },
  { path: '/analytics', icon: BarChart2,       label: 'Analytics' },
  { path: '/account',   icon: UserCircle,      label: 'Account'   },
]

export default function Sidebar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { userProfile, currentUser, signOut } = useStore()
  const [createOpen, setCreateOpen] = useState(false)

  const workspaceName = userProfile?.workspace_name || userProfile?.username || ''
  const username      = userProfile?.username ? `@${userProfile.username}` : currentUser?.email || ''
  const avatarLetter  = workspaceName?.[0]?.toUpperCase() || '?'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[220px] bg-white border-r border-ivory-200
        flex-col z-40 shadow-soft">

        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-ivory-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-camel-500 flex items-center justify-center shadow-sm flex-shrink-0">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <div>
              <p className="text-[13px] font-black text-ink-900 tracking-tight leading-none">Brandrop OS</p>
              <p className="text-[10px] text-ink-400 leading-none mt-0.5">Content Operating System</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          {NAV.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path || location.pathname.startsWith(path + '/')
            return (
              <button key={path} onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                  transition-all duration-150
                  ${isActive
                    ? 'bg-camel-50 text-camel-600'
                    : 'text-ink-500 hover:bg-ivory-100 hover:text-ink-800'
                  }`}>
                <Icon size={17}
                  className={isActive ? 'text-camel-500' : 'text-ink-400'}
                  strokeWidth={isActive ? 2.5 : 1.75} />
                <span className={`text-[13px] font-semibold ${isActive ? 'text-camel-600' : ''}`}>{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-camel-500" />}
              </button>
            )
          })}

          {/* Create button */}
          <button onClick={() => setCreateOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mt-2
              bg-camel-500 text-white hover:bg-camel-600 transition-colors shadow-lifted">
            <Plus size={17} strokeWidth={2.5} />
            <span className="text-[13px] font-bold">Create</span>
          </button>

          {/* Divider */}
          <div className="pt-3 pb-1">
            <div className="h-px bg-ivory-200" />
          </div>

          {/* Shoot — subtle */}
          <button onClick={() => navigate('/shoot')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl
              text-ink-400 hover:bg-ivory-100 hover:text-ink-600 transition-colors">
            <Camera size={15} className="text-ink-300" />
            <span className="text-[12px] font-medium text-ink-400">Shoot module</span>
          </button>
        </nav>

        {/* User profile at bottom */}
        <div className="px-3 pb-5 border-t border-ivory-100 pt-3">
          <button onClick={() => navigate('/account')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              hover:bg-ivory-100 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-camel-500 flex items-center justify-center
              text-white font-bold text-[13px] flex-shrink-0">
              {avatarLetter}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[12px] font-bold text-ink-900 leading-none truncate">{workspaceName}</p>
              <p className="text-[10px] text-ink-400 mt-0.5 truncate">{username}</p>
            </div>
            <ChevronRight size={13} className="text-ink-300 group-hover:text-ink-400" />
          </button>

          <button onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl mt-1
              text-rose-400 hover:bg-rose-50 transition-colors">
            <LogOut size={14} />
            <span className="text-[12px] font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  )
}
