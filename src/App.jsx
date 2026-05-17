import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useStore from './store/useStore'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PlanningMode from './pages/PlanningMode'
import ShootMode from './pages/ShootMode'
import FocusMode from './pages/FocusMode'
import ProductPages from './pages/ProductPages'
import ReferenceLibrary from './pages/ReferenceLibrary'
import BTSSection from './pages/BTSSection'
import ExtraIdeas from './pages/ExtraIdeas'

function ProtectedRoute({ children }) {
  const currentUser = useStore((s) => s.currentUser)
  if (!currentUser) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { currentUser, isLoading, init, subscribeRealtime } = useStore()

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    if (!currentUser) return
    const unsub = subscribeRealtime()
    return unsub
  }, [currentUser])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[10px] tracking-[0.25em] uppercase text-ink-400 mb-2">Indirookh</p>
          <p className="font-display text-xl text-ink-800">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={currentUser ? <Navigate to="/home" replace /> : <Login />}
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plan"
        element={
          <ProtectedRoute>
            <Layout><PlanningMode /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shoot"
        element={
          <ProtectedRoute>
            <Layout><ShootMode /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/focus"
        element={
          <ProtectedRoute>
            <FocusMode />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Layout><ProductPages /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/references"
        element={
          <ProtectedRoute>
            <Layout><ReferenceLibrary /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bts"
        element={
          <ProtectedRoute>
            <Layout><BTSSection /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/extra"
        element={
          <ProtectedRoute>
            <Layout><ExtraIdeas /></Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return <AppRoutes />
}
