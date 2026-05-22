import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useStore from './store/useStore'
import Layout from './components/layout/Layout'

// Auth
import Login         from './pages/Login'
import CreateAccount from './pages/CreateAccount'

// Main OS sections
import Dashboard  from './pages/Dashboard'
import ContentPlan from './pages/ContentPlan'
import Insights   from './pages/Insights'
import Account    from './pages/Account'

// Shoot module (secondary — accessible via header menu)
import ShootMode    from './pages/ShootMode'
import PlanningMode from './pages/PlanningMode'
import FocusMode    from './pages/FocusMode'
import ProductPages from './pages/ProductPages'
import ReferenceLibrary from './pages/ReferenceLibrary'
import BTSSection   from './pages/BTSSection'
import ExtraIdeas   from './pages/ExtraIdeas'

function ProtectedRoute({ children }) {
  const currentUser = useStore((s) => s.currentUser)
  if (!currentUser) return <Navigate to="/" replace />
  return children
}

function P({ children }) {
  return <ProtectedRoute><Layout>{children}</Layout></ProtectedRoute>
}

function AppRoutes() {
  const { currentUser, isLoading, init, subscribeRealtime } = useStore()

  useEffect(() => { init() }, [])
  useEffect(() => {
    if (!currentUser) return
    const unsub = subscribeRealtime()
    return unsub
  }, [currentUser?.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-camel-500 flex items-center justify-center mx-auto shadow-lifted">
            <span className="text-white font-black text-lg">B</span>
          </div>
          <p className="font-bold text-base text-ink-900">Brandrop OS</p>
          <p className="text-xs text-ink-400">Loading your workspace…</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/"       element={currentUser ? <Navigate to="/home" replace /> : <Login />} />
      <Route path="/signup" element={currentUser ? <Navigate to="/home" replace /> : <CreateAccount />} />

      {/* ── Main Content OS ── */}
      <Route path="/home"      element={<P><Dashboard /></P>} />
      <Route path="/content"   element={<P><ContentPlan /></P>} />
      <Route path="/analytics" element={<P><Insights /></P>} />
      <Route path="/account"   element={<P><Account /></P>} />

      {/* ── Shoot module (secondary, via header menu) ── */}
      <Route path="/shoot"       element={<P><ShootMode /></P>} />
      <Route path="/shoot/plan"  element={<P><PlanningMode /></P>} />
      <Route path="/focus"       element={<ProtectedRoute><FocusMode /></ProtectedRoute>} />
      <Route path="/products"    element={<P><ProductPages /></P>} />
      <Route path="/references"  element={<P><ReferenceLibrary /></P>} />
      <Route path="/bts"         element={<P><BTSSection /></P>} />
      <Route path="/extra"       element={<P><ExtraIdeas /></P>} />

      {/* Legacy redirects */}
      <Route path="/plan"     element={<Navigate to="/content"   replace />} />
      <Route path="/insights" element={<Navigate to="/analytics" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return <AppRoutes />
}
