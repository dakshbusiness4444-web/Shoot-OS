import { X, Sun, Moon, Monitor, Check } from 'lucide-react'
import useStore from '../../store/useStore'

const OPTIONS = [
  { id: 'light',  label: 'Light',  desc: 'Bright clean look',         icon: Sun,     preview: 'bg-white border-ivory-200' },
  { id: 'dark',   label: 'Dark',   desc: 'Easy on the eyes at night', icon: Moon,    preview: 'bg-ink-900 border-ink-700' },
  { id: 'system', label: 'System', desc: 'Match your device setting', icon: Monitor, preview: 'bg-gradient-to-r from-white to-ink-900 border-ivory-300' },
]

export default function ThemeModal({ open, onClose }) {
  const { theme, setTheme } = useStore()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end animate-backdrop-in">
      <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full bg-white rounded-t-3xl animate-sheet-up pb-safe">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-ivory-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-ivory-100">
          <div>
            <p className="text-[15px] font-black text-ink-900">Appearance</p>
            <p className="text-[11px] text-ink-400">Choose your theme</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-ivory-100 flex items-center justify-center active:bg-ivory-200">
            <X size={15} className="text-ink-500" />
          </button>
        </div>

        {/* Options */}
        <div className="px-5 py-5 space-y-2.5">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon
            const active = theme === opt.id
            return (
              <button key={opt.id}
                onClick={() => { setTheme(opt.id); setTimeout(onClose, 350) }}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all
                  ${active
                    ? 'bg-camel-50 border-camel-400'
                    : 'bg-white border-ivory-200 active:bg-ivory-50'}`}>
                {/* Theme preview swatch */}
                <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center flex-shrink-0 ${opt.preview}`}>
                  <Icon size={16} className={
                    opt.id === 'light' ? 'text-camel-500' :
                    opt.id === 'dark'  ? 'text-camel-300' :
                    'text-camel-600'
                  } />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-bold text-ink-900">{opt.label}</p>
                  <p className="text-[11px] text-ink-400">{opt.desc}</p>
                </div>
                {active && (
                  <div className="w-6 h-6 rounded-full bg-camel-500 flex items-center justify-center flex-shrink-0">
                    <Check size={13} className="text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <p className="text-center text-[10px] text-ink-400 pb-5 px-5">
          Your choice is saved on this device.
        </p>
      </div>
    </div>
  )
}
