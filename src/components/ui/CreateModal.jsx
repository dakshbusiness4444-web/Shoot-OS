import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const OPTIONS = [
  { emoji: '🎬', label: 'Reel Plan',       sub: 'Instagram reel',       route: '/content', tab: 'instagram', type: 'reel'  },
  { emoji: '📸', label: 'Post Plan',        sub: 'Instagram post',       route: '/content', tab: 'instagram', type: 'post'  },
  { emoji: '📌', label: 'Pinterest Pin',    sub: 'SEO pin',              route: '/content', tab: 'pinterest', type: 'pin'   },
  { emoji: '🖼️', label: 'Add Reference',    sub: 'Inspiration image',   route: '/references' },
  { emoji: '🎥', label: 'BTS Idea',         sub: 'Behind the scenes',   route: '/bts'   },
  { emoji: '✨', label: 'Extra Idea',        sub: 'Bonus content idea',  route: '/extra' },
  { emoji: '📷', label: 'Plan a Shot',      sub: 'Add to shoot list',   route: '/shoot' },
]

export default function CreateModal({ open, onClose }) {
  const navigate = useNavigate()
  if (!open) return null

  const handleOption = (opt) => {
    onClose()
    navigate(opt.route)
  }

  return (
    <div className="fixed inset-0 z-50 animate-backdrop-in flex items-end">
      <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl animate-sheet-up pb-safe">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-ivory-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <div>
            <p className="text-[15px] font-bold text-ink-900">Create New</p>
            <p className="text-[11px] text-ink-400">What are you planning?</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-ivory-100 flex items-center justify-center">
            <X size={16} className="text-ink-500" />
          </button>
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-3 gap-3 px-5 pb-8">
          {OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleOption(opt)}
              className="flex flex-col items-center gap-2 bg-ivory-50 border border-ivory-200
                rounded-2xl p-4 active:bg-camel-50 active:border-camel-200 transition-colors"
            >
              <span className="text-2xl">{opt.emoji}</span>
              <div className="text-center">
                <p className="text-[12px] font-bold text-ink-900 leading-tight">{opt.label}</p>
                <p className="text-[10px] text-ink-400 mt-0.5 leading-tight">{opt.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
