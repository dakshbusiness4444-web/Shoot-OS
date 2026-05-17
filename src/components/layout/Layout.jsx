import { useLocation } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'

export default function Layout({ children }) {
  const location = useLocation()
  return (
    <div className="min-h-screen bg-ivory-100">
      <Header />
      <main className="max-w-lg mx-auto px-4 pt-4 pb-28">
        <div key={location.pathname} className="animate-page-enter">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
