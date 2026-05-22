import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Plus, BarChart2, UserCircle } from 'lucide-react'
import CreateModal from '../ui/CreateModal'

const NAV = [
  { path: '/home',      icon: LayoutDashboard, label: 'Home'      },
  { path: '/content',   icon: CalendarDays,    label: 'Content'   },
  { path: '__create',   icon: Plus,            label: 'Create',   isCreate: true },
  { path: '/analytics', icon: BarChart2,       label: 'Analytics' },
  { path: '/account',   icon: UserCircle,      label: 'Account'   },
]

export default function BottomNav() {
  const navigate     = useNavigate()
  const location     = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center px-4"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <nav className="w-full max-w-sm bg-white border border-ivory-200 rounded-2xl shadow-lifted
          flex items-center px-1 py-1 gap-0.5">
          {NAV.map(({ path, icon: Icon, label, isCreate }) => {
            const isActive = !isCreate && (
              location.pathname === path || location.pathname.startsWith(path + '/')
            )

            if (isCreate) {
              return (
                <button key="create" onClick={() => setOpen(true)}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1">
                  <div className="w-11 h-11 rounded-xl bg-camel-500 flex items-center justify-center
                    shadow-lifted active:bg-camel-600 transition-colors">
                    <Plus size={22} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-semibold text-camel-500">Create</span>
                </button>
              )
            }

            return (
              <button key={path} onClick={() => navigate(path)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1
                  rounded-xl transition-all active:bg-ivory-100 ${isActive ? 'bg-camel-50' : ''}`}>
                <Icon size={20}
                  className={isActive ? 'text-camel-500' : 'text-ink-400'}
                  strokeWidth={isActive ? 2.5 : 1.75} />
                <span className={`text-[10px] font-semibold ${isActive ? 'text-camel-500' : 'text-ink-400'}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      <CreateModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
