import { useLocation } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const location = useLocation()
  return (
    <div className="min-h-screen bg-ivory-100">
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />

      {/* Header — shifts right on desktop */}
      <div className="lg:pl-[220px]">
        <Header />
      </div>

      {/* Main content */}
      <main className="lg:pl-[220px]">
        {/* Mobile: single column centered, Desktop: wider with proper padding */}
        <div className="max-w-lg mx-auto px-4 pt-4 pb-32 lg:max-w-none lg:mx-0 lg:px-8 lg:pb-8 lg:pt-6">
          <div key={location.pathname} className="animate-page-enter lg:max-w-5xl">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom nav — hidden on desktop */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
