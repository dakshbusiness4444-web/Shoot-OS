import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Zap, Check } from 'lucide-react'
import useStore from '../store/useStore'

export default function CreateAccount() {
  const navigate = useNavigate()
  const { signUp, authLoading } = useStore()

  const [email,         setEmail]         = useState('')
  const [username,      setUsername]      = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [password,      setPassword]      = useState('')
  const [showPass,      setShowPass]      = useState(false)
  const [localError,    setLocalError]    = useState('')
  const [done,          setDone]          = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!email.trim() || !username.trim() || !password) {
      setLocalError('Please fill in all required fields')
      return
    }
    if (!/^[a-z0-9_]{3,20}$/.test(username.trim())) {
      setLocalError('Username must be 3–20 chars: lowercase letters, numbers, underscores only')
      return
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    try {
      const result = await signUp({
        email:         email.trim(),
        username:      username.trim().toLowerCase(),
        password,
        workspaceName: workspaceName.trim() || username.trim(),
      })
      if (result?.needsEmailConfirm) {
        setDone(true)          // Show "check your inbox"
      } else {
        navigate('/home')      // Already signed in — go straight in
      }
    } catch (err) {
      setLocalError(err.message || 'Sign up failed. Please try again.')
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center animate-auth-brand">
          <div className="w-14 h-14 rounded-2xl bg-moss-500 flex items-center justify-center mx-auto mb-5 shadow-lifted">
            <Check size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight mb-2">You're all set!</h1>
          <p className="text-sm text-ink-400 mb-2">
            Check your inbox — we've sent a confirmation link to
          </p>
          <p className="text-sm font-semibold text-ink-800 mb-8">{email}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-camel-500 text-white
              font-semibold rounded-xl py-3.5 text-sm tracking-tight
              active:bg-camel-600 transition-colors shadow-lifted"
          >
            <span>Go to sign in</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight mb-1">Create workspace</h1>
          <p className="text-sm text-ink-400">Start your content operating system</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="animate-auth-field1">
            <label className="block text-[11px] font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brand.com"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full bg-ivory-100 border border-ivory-300 rounded-xl px-4 py-3.5 text-sm
                text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-camel-300
                focus:border-camel-400 transition-all"
            />
          </div>

          {/* Username */}
          <div className="animate-auth-field2">
            <label className="block text-[11px] font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink-400 pointer-events-none">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="yourbrand"
                autoCapitalize="none"
                autoCorrect="off"
                maxLength={20}
                className="w-full bg-ivory-100 border border-ivory-300 rounded-xl pl-8 pr-4 py-3.5 text-sm
                  text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-camel-300
                  focus:border-camel-400 transition-all"
              />
            </div>
            <p className="text-[10px] text-ink-400 mt-1 ml-1">3–20 chars · letters, numbers, underscores</p>
          </div>

          {/* Workspace name */}
          <div className="animate-auth-field2">
            <label className="block text-[11px] font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">
              Brand / Workspace Name <span className="normal-case font-normal text-ink-400">(optional)</span>
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Indirookh, Studio X, Brand Name…"
              className="w-full bg-ivory-100 border border-ivory-300 rounded-xl px-4 py-3.5 text-sm
                text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-camel-300
                focus:border-camel-400 transition-all"
            />
          </div>

          {/* Password */}
          <div className="animate-auth-field3">
            <label className="block text-[11px] font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
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
              {authLoading ? 'Creating workspace…' : <><span>Create workspace</span><ArrowRight size={15} /></>}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-ink-400 mt-6 animate-auth-footer">
          Already have an account?{' '}
          <button onClick={() => navigate('/')} className="text-camel-500 font-semibold active:text-camel-600">
            Sign in
          </button>
        </p>
      </div>

      <div className="px-6 pb-8 text-center animate-auth-footer">
        <p className="text-[10px] text-ink-400">Brandrop OS · Content Operating System for brands &amp; creators</p>
      </div>
    </div>
  )
}
