import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Layout, Camera, Package, MoreHorizontal } from 'lucide-react'
import useStore from '../../store/useStore'

const NAV_ITEMS = [
  { path: '/home',     icon: Home,          label: 'Home'     },
  { path: '/plan',     icon: Layout,        label: 'Plan'     },
  { path: '/shoot',    icon: Camera,        label: 'Shoot',   primary: true },
  { path: '/products', icon: Package,       label: 'Products' },
  { path: '/references', icon: MoreHorizontal, label: 'More'  },
]

export default function BottomNav() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const shots     = useStore((s) => s.shots)

  const pendingCount = shots.filter(
    (s) => s.shot_type === 'product' && s.status !== 'done'
  ).length

  const isMoreActive = ['/references', '/bts', '/extra'].includes(location.pathname)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-ivory-50/95 backdrop-blur-md border-t border-ivory-200">
      <div className="max-w-lg mx-auto px-2 flex items-center justify-around pb-safe">
        {NAV_ITEMS.map(({ path, icon: Icon, label, primary }) => {
          const isMore   = label === 'More'
          const isActive = isMore
            ? isMoreActive
            : location.pathname === path || location.pathname.startsWith(path + '/')

          if (primary) {
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-0.5 py-2 px-3"
              >
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors
                    ${isActive ? 'bg-ink-900 text-ivory-100' : 'bg-ivory-200 text-ink-600'}`}>
                    <Icon size={20} />
                  </div>
                  {pendingCount > 0 && !isActive && (
                    <span className="nav-badge">{pendingCount > 99 ? '99+' : pendingCount}</span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-ink-900' : 'text-ink-400'}`}>
                  {label}
                </span>
              </button>
            )
          }

          return (
            <button
              key={path}
              onClick={() => navigate(isMore ? '/references' : path)}
              className="flex flex-col items-center gap-0.5 py-3 px-3"
            >
              <Icon
                size={20}
                className={`transition-colors ${isActive ? 'text-ink-900' : 'text-ink-400'}`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className={`text-[10px] font-medium ${isActive ? 'text-ink-900' : 'text-ink-400'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
