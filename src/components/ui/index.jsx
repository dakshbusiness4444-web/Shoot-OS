import { useState } from 'react'
import { X, Check, Image as ImageIcon } from 'lucide-react'
import { CREATOR_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from '../../data/seedData'
import MediaModal from './MediaModal'

export { default as MediaModal } from './MediaModal'

// ─── Button ─────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', className = '', size = 'md', ...props }) {
  const base  = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-colors duration-150 active:scale-[0.98]'
  const sizes = {
    sm:   'px-3.5 py-2 text-xs',
    md:   'px-5 py-3 text-sm',
    lg:   'px-6 py-3.5 text-base',
    full: 'w-full px-5 py-3.5 text-sm',
  }
  const variants = {
    primary: 'bg-ink-900 text-ivory-100 active:bg-ink-800',
    ghost:   'bg-ivory-200 text-ink-800 active:bg-ivory-300',
    outline: 'border border-ink-200 text-ink-800 active:bg-ivory-200',
    done:    'bg-moss-400 text-white active:bg-moss-500',
    danger:  'bg-rose-100 text-earth-500 active:bg-rose-300',
    camel:   'bg-camel-300 text-white active:bg-camel-400',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// ─── Badge / Pill ────────────────────────────────────────────────────────────
export function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>
      {children}
    </span>
  )
}

export function CreatorTag({ creator }) {
  const cfg = CREATOR_CONFIG[creator] || CREATOR_CONFIG.maam
  return <Badge className={cfg.color}>{cfg.label}</Badge>
}

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <Badge className={cfg.color}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
      {cfg.label}
    </Badge>
  )
}

export function PriorityBadge({ priority }) {
  if (!priority || priority === 'normal') return null
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.normal
  return <Badge className={cfg.color}>{cfg.label}</Badge>
}

export function MediaTypeBadge({ mediaType }) {
  if (!mediaType) return null
  return (
    <span className={`text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-md
      ${mediaType === 'video' ? 'bg-moss-100 text-moss-500' : 'bg-camel-100 text-camel-500'}`}>
      {mediaType === 'video' ? '🎬 Video' : '📷 Photo'}
    </span>
  )
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-ivory-50 rounded-2xl shadow-card border border-ivory-200 overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  )
}

// ─── Input ───────────────────────────────────────────────────────────────────
export function Input({ label, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-ink-400 uppercase tracking-wide">{label}</label>}
      <input
        className={`w-full bg-ivory-200 border-0 rounded-xl px-4 py-3 text-sm text-ink-900
          placeholder-ink-200 focus:outline-none focus:ring-2 focus:ring-camel-300
          transition-shadow duration-150 ${className}`}
        {...props}
      />
    </div>
  )
}

export function Textarea({ label, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-ink-400 uppercase tracking-wide">{label}</label>}
      <textarea
        className={`w-full bg-ivory-200 border-0 rounded-xl px-4 py-3 text-sm text-ink-900
          placeholder-ink-200 focus:outline-none focus:ring-2 focus:ring-camel-300
          transition-shadow duration-150 resize-none ${className}`}
        rows={3}
        {...props}
      />
    </div>
  )
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-ink-400 uppercase tracking-wide">{label}</label>}
      <select
        className={`w-full bg-ivory-200 border-0 rounded-xl px-4 py-3 text-sm text-ink-900
          focus:outline-none focus:ring-2 focus:ring-camel-300 transition-shadow duration-150 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
export function ProgressBar({ done, total, className = '' }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className={className}>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-xs font-medium text-ink-400 uppercase tracking-wide">Progress</span>
        <span className="text-sm font-medium text-ink-800">
          {done}<span className="text-ink-400">/{total}</span>
        </span>
      </div>
      <div className="h-1.5 bg-ivory-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-moss-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Modal / Sheet ───────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 animate-backdrop-in">
      {/* backdrop */}
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      {/* sheet — pinned below the 56px layout header */}
      <div
        className="absolute left-0 right-0 bottom-0 bg-ivory-50 rounded-t-3xl shadow-lifted flex flex-col animate-sheet-up"
        style={{ top: '56px' }}
      >
        {/* sticky header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 pt-4 pb-3 border-b border-ivory-200">
          <h2 className="font-display text-lg font-medium text-ink-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full bg-ivory-200 text-ink-600 active:bg-ivory-300">
            <X size={16} />
          </button>
        </div>
        {/* scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pt-3 pb-8">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Section Header ──────────────────────────────────────────────────────────
export function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-display text-lg font-medium text-ink-900">{title}</h2>
      {action}
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-ivory-200 flex items-center justify-center mb-4">
          <Icon size={24} className="text-ink-400" />
        </div>
      )}
      <p className="font-display text-base font-medium text-ink-600 mb-1">{title}</p>
      {subtitle && <p className="text-sm text-ink-400">{subtitle}</p>}
    </div>
  )
}

export function Divider() {
  return <div className="h-px bg-ivory-200 my-4" />
}

export function DoneCheck() {
  return (
    <div className="w-6 h-6 rounded-full bg-moss-400 flex items-center justify-center flex-shrink-0">
      <Check size={13} strokeWidth={3} className="text-white" />
    </div>
  )
}

// ─── Color Swatch ────────────────────────────────────────────────────────────
export function ColorSwatch({ hex, name, selected, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1.5 ${selected ? 'opacity-100' : 'opacity-60'}`}>
      <div
        className={`w-9 h-9 rounded-full border-2 transition-all ${selected ? 'border-ink-900 scale-110 shadow-sm' : 'border-transparent'}`}
        style={{ backgroundColor: hex || '#D4C9B5' }}
      />
      <span className="text-[11px] text-ink-600 text-center leading-none max-w-[52px] truncate">{name}</span>
    </button>
  )
}

// ─── Filter Chip ─────────────────────────────────────────────────────────────
export function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
        ${active ? 'bg-ink-900 text-ivory-100' : 'bg-ivory-200 text-ink-600'}`}
    >
      {label}
    </button>
  )
}

// ─── Search Bar ──────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-ivory-200 border-0 rounded-xl pl-4 pr-4 py-3 text-sm text-ink-900
          placeholder-ink-200 focus:outline-none focus:ring-2 focus:ring-camel-300"
      />
    </div>
  )
}

// ─── Image Upload Button ─────────────────────────────────────────────────────
export function ImageUploadButton({ onUpload, children }) {
  return (
    <label className="cursor-pointer">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
      />
      {children}
    </label>
  )
}

// ─── Tappable reference image card with fullscreen support ───────────────────
export function MediaCard({ url, caption, aspect = 'photo', className = '' }) {
  const [modalOpen, setModalOpen] = useState(false)

  const aspectClass = {
    photo:  'aspect-[4/5]',
    reel:   'aspect-[9/16]',
    wide:   'aspect-[3/2]',
    square: 'aspect-square',
    auto:   '',
  }[aspect] || 'aspect-[4/5]'

  return (
    <>
      <button
        onClick={() => url && setModalOpen(true)}
        className={`relative overflow-hidden rounded-xl bg-ivory-200 w-full block ${aspectClass} ${className}`}
      >
        {url ? (
          <img
            src={url}
            alt={caption || ''}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 active:scale-[0.98]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <ImageIcon size={22} className="text-ink-300" />
            <span className="text-xs text-ink-300">No image</span>
          </div>
        )}
        {caption && url && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
            <p className="text-white text-xs leading-snug line-clamp-2">{caption}</p>
          </div>
        )}
      </button>
      <MediaModal
        open={modalOpen}
        images={url ? [{ url, caption }] : []}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
