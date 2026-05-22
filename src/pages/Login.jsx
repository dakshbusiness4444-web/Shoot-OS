import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Zap } from 'lucide-react'
import useStore from '../store/useStore'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, authLoading } = useStore()

  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password,        setPassword]        = useState('')
  const [showPass,        setShowPass]        = useState(false)
  const [localError,      setLocalError]      = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    if (!emailOrUsername.trim() || !password) {
      setLocalError('Please fill in all fields')
      return
    }
    try {
      await signIn({ emailOrUsername, password })
      navigate('/home')
    } catch (err) {
      setLocalError(err.message || 'Login failed. Check your credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Brand header */}
      <div className="px-6 pt-12 pb-2 animate-auth-brand">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-camel-500 flex items-center justify-center shadow-lifted">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-sm font-bold text-ink-900 tracking-tight leading-none">Brandrop OS</p>
            <p className="text-[10px] text-ink-400 leading-none mt-0.5">Content Operating System</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-8 max-w-sm mx-auto w-full">
        <div className="mb-8 animate-auth-field1">
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight mb-1">Welcome back</h1>
          <p className="text-sm text-ink-400">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="animate-auth-field1">
            <label className="block text-[11px] font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">
              Email or Username
            </label>
            <input
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="you@brand.com or @username"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full bg-ivory-100 border border-ivory-300 rounded-xl px-4 py-3.5 text-sm
                text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-camel-300
                focus:border-camel-400 transition-all"
            />
          </div>

          <div className="animate-auth-field2">
            <label className="block text-[11px] font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-ivory-100 border border-ivory-300 rounded-xl px-4 py-3.5 pr-12 text-sm
                  text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-camel-300
                  focus:border-camel-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-400 active:text-ink-700"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {localError && (
            <div className="animate-fade-in bg-rose-100 border border-rose-300 rounded-xl px-4 py-3">
              <p className="text-xs text-rose-500 font-medium">{localError}</p>
            </div>
          )}

          <div className="pt-1 animate-auth-btn">
            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 bg-camel-500 text-white
                font-semibold rounded-xl py-3.5 text-sm tracking-tight
                disabled:opacity-60 active:bg-camel-600 transition-colors shadow-lifted"
            >
              {authLoading ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={15} /></>}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-ink-400 mt-6 animate-auth-footer">
          New to Brandrop OS?{' '}
          <button onClick={() => navigate('/signup')} className="text-camel-500 font-semibold active:text-camel-600">
            Create workspace
          </button>
        </p>
      </div>

      <div className="px-6 pb-8 text-center animate-auth-footer">
        <p className="text-[10px] text-ink-400">Brandrop OS · Content Operating System for brands &amp; creators</p>
      </div>
    </div>
  )
}
