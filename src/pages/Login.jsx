import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function Login() {
  const navigate = useNavigate()
  const loginAs = useStore((s) => s.loginAs)
  const [pressing, setPressing] = useState(null)

  const handleLogin = (key) => {
    setPressing(key)
    setTimeout(() => {
      loginAs(key)
      navigate('/home')
    }, 200)
  }

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col">
      {/* Brand mark */}
      <div className="pt-16 pb-10 px-8 text-center animate-login-brand">
        <p className="text-[11px] tracking-[0.25em] uppercase text-ink-400 font-medium mb-2">
          Indirookh
        </p>
        <h1 className="font-display text-4xl font-medium text-ink-900 leading-tight">
          Shoot OS
        </h1>
        <p className="text-sm text-ink-400 mt-3 font-light">
          Your shoot execution system
        </p>
      </div>

      {/* User cards */}
      <div className="flex-1 px-6 flex flex-col justify-center gap-4 max-w-sm mx-auto w-full">
        <p className="text-xs text-ink-400 text-center uppercase tracking-widest mb-1 animate-login-who">
          Who are you today?
        </p>

        {/* Ma'am */}
        <div className="animate-login-card1">
          <button
            onClick={() => handleLogin('maam')}
            className={`group relative bg-ivory-50 border border-ivory-200 rounded-3xl p-6
              shadow-card transition-all duration-150 text-left overflow-hidden w-full
              ${pressing === 'maam' ? 'animate-card-press' : 'active:scale-[0.98]'}`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-camel-100/40 -translate-y-8 translate-x-8" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-camel-100 flex items-center justify-center mb-4">
                <span className="font-display text-xl text-camel-500">M</span>
              </div>
              <h2 className="font-display text-2xl font-medium text-ink-900 mb-1">Ma'am</h2>
              <p className="text-sm text-ink-400">Creative direction & planning</p>
            </div>
          </button>
        </div>

        {/* Daksh */}
        <div className="animate-login-card2">
          <button
            onClick={() => handleLogin('daksh')}
            className={`group relative bg-ivory-50 border border-ivory-200 rounded-3xl p-6
              shadow-card transition-all duration-150 text-left overflow-hidden w-full
              ${pressing === 'daksh' ? 'animate-card-press' : 'active:scale-[0.98]'}`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-earth-300/20 -translate-y-8 translate-x-8" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-earth-300/30 flex items-center justify-center mb-4">
                <span className="font-display text-xl text-earth-400">D</span>
              </div>
              <h2 className="font-display text-2xl font-medium text-ink-900 mb-1">Daksh</h2>
              <p className="text-sm text-ink-400">Execution & shoot management</p>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-12 pt-6 text-center animate-login-footer">
        <p className="text-xs text-ink-200">SS26 Shoot Season</p>
      </div>
    </div>
  )
}
