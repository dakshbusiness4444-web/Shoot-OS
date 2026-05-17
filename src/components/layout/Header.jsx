import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MoreVertical, LogOut, Settings, ChevronLeft } from 'lucide-react'
import useStore from '../../store/useStore'
import { USERS } from '../../data/seedData'

const PAGE_TITLES = {
  '/home': null,
  '/plan': 'Planning',
  '/shoot': 'Shoot Mode',
  '/products': 'Products',
  '/references': 'References',
  '/bts': 'BTS Ideas',
  '/extra': 'Extra Ideas',
}

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, logout } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const isHome = location.pathname === '/home'
  const title = PAGE_TITLES[location.pathname]

  const otherUser = currentUser?.id === 'maam' ? USERS.daksh : USERS.maam
  const handleSwitchUser = () => {
    useStore.getState().loginAs(otherUser.id)
    setMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-ivory-50/90 backdrop-blur-md border-b border-ivory-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left */}
          {isHome ? (
            <div className="flex flex-col leading-none">
              <span className="text-[10px] tracking-[0.15em] uppercase text-ink-400 font-medium">
                Indirookh
              </span>
              <span className="font-display text-lg font-medium text-ink-900 leading-tight">
                Shoot OS
              </span>
            </div>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-ink-600 active:text-ink-900 -ml-1"
            >
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">{title}</span>
            </button>
          )}

          {/* Right */}
          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-400">{currentUser.displayName}</span>
                <button
                  onClick={() => setMenuOpen(true)}
                  className="w-8 h-8 rounded-full bg-ivory-200 flex items-center justify-center text-ink-600 active:bg-ivory-300"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setMenuOpen(false)}>
          <div className="absolute top-14 right-4 max-w-[200px] w-48 bg-ivory-50 rounded-2xl shadow-lifted border border-ivory-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-ivory-200">
              <p className="text-xs text-ink-400">Logged in as</p>
              <p className="text-sm font-medium text-ink-900">{currentUser?.displayName}</p>
            </div>
            <button
              onClick={handleSwitchUser}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-ink-700 hover:bg-ivory-200 active:bg-ivory-200"
            >
              <Settings size={15} className="text-ink-400" />
              Switch to {otherUser.displayName}
            </button>
            <button
              onClick={() => { logout(); setMenuOpen(false); navigate('/') }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-earth-400 hover:bg-ivory-200 active:bg-ivory-200"
            >
              <LogOut size={15} />
              Log out
            </button>
          </div>
        </div>
      )}
    </>
  )
}
