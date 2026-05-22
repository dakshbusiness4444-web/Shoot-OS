import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight, TrendingUp, TrendingDown, Minus,
  Flame, Zap, AlertCircle, CheckCircle2, Clock,
  Sparkles, Lock, Crown, X
} from 'lucide-react'
import useStore from '../store/useStore'
import { generateRecommendations } from './Insights'

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
function today() { return new Date().toISOString().split('T')[0] }

function getWeek() {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

function calcStreak(items) {
  const postedDates = new Set(
    items
      .filter((c) => ['posted', 'published', 'scheduled'].includes(c.status) && c.posting_date)
      .map((c) => c.posting_date)
  )
  let streak = 0
  let cursor = new Date()
  while (streak < 365) {
    const dateStr = cursor.toISOString().split('T')[0]
    if (postedDates.has(dateStr)) { streak++; cursor.setDate(cursor.getDate() - 1) }
    else break
  }
  return streak
}

function calcConsistency(items) {
  const dates = new Set(items.filter((c) => c.posting_date).map((c) => c.posting_date))
  let active = 0
  for (let i = 0; i < 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    if (dates.has(d.toISOString().split('T')[0])) active++
  }
  return Math.round((active / 14) * 100)
}

function calcVelocity(items) {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7)
  return items.filter((c) => new Date(c.created_at) > cutoff).length
}

// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM GATE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function PremiumModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end animate-backdrop-in">
      <div className="absolute inset-0 bg-ink-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl animate-sheet-up pb-safe overflow-hidden">

        {/* Shimmering top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-camel-400 via-purple-400 to-camel-600"
          style={{
            backgroundSize: '200% auto',
            animation: 'shimmer 2s linear infinite',
          }} />

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-ivory-300 rounded-full" />
        </div>

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-ivory-100 flex items-center justify-center">
          <X size={15} className="text-ink-500" />
        </button>

        <div className="px-6 pt-4 pb-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-camel-500 to-purple-500
              flex items-center justify-center shadow-lifted animate-float">
              <Crown size={28} className="text-white" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-[22px] font-black text-ink-900 text-center tracking-tight mb-1">
            Unlock AI Strategist
          </h2>
          <p className="text-[13px] text-ink-400 text-center mb-6">
            Your personal content strategist, powered by AI
          </p>

          {/* Feature list */}
          <div className="space-y-3 mb-6">
            {[
              { emoji: '🧠', title: 'Smart content recommendations', sub: 'AI reads your data and tells you exactly what to post next' },
              { emoji: '📈', title: 'Engagement predictions', sub: 'Know which content will perform before you post it' },
              { emoji: '🎯', title: 'Audience growth tactics', sub: 'Personalised weekly strategy to grow your reach' },
              { emoji: '⚡', title: 'Caption & hashtag AI writer', sub: 'Generate high-performing captions in one tap' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3 bg-ivory-100 rounded-xl px-4 py-3">
                <span className="text-xl flex-shrink-0">{f.emoji}</span>
                <div>
                  <p className="text-[13px] font-bold text-ink-900 leading-tight">{f.title}</p>
                  <p className="text-[11px] text-ink-400 mt-0.5">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button className="w-full py-4 rounded-2xl font-black text-white text-[15px] tracking-tight
            shadow-lifted active:opacity-90 transition-opacity"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #6366F1 100%)',
              backgroundSize: '200% auto',
              animation: 'shimmer 3s linear infinite',
            }}>
            Join the waitlist ✦ Coming Soon
          </button>
          <button onClick={onClose}
            className="w-full py-3 mt-2 text-[13px] font-semibold text-ink-400">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG RING
// ─────────────────────────────────────────────────────────────────────────────
function Ring({ value, max = 100, size = 72, stroke = 7, color = '#6366F1', trackColor = '#EEF2FF', label, sublabel }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.min(value / max, 1)
  return (
    <div className="relative flex-shrink-0 animate-scale-in" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="text-[15px] font-black text-white leading-none">{label}</span>}
        {sublabel && <span className="text-[9px] text-white/60 mt-0.5 leading-none">{sublabel}</span>}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TREND
// ─────────────────────────────────────────────────────────────────────────────
function Trend({ value }) {
  if (value === 0) return <span className="text-[11px] font-semibold text-ink-400 flex items-center gap-0.5"><Minus size={11} /> Flat</span>
  const up = value > 0
  return (
    <span className={`text-[11px] font-bold flex items-center gap-0.5 ${up ? 'text-moss-500' : 'text-rose-500'}`}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? '+' : ''}{value}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CARD
// ─────────────────────────────────────────────────────────────────────────────
function HealthCard({ icon: Icon, iconBg, label, value, sub, trend, barValue, barColor = 'bg-camel-500', urgent, delay = 0 }) {
  return (
    <div className={`bg-white rounded-2xl border p-3.5 shadow-soft animate-fade-up
      ${urgent ? 'border-rose-200 bg-rose-50/40' : 'border-ivory-200'}`}
      style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={13} className={urgent ? 'text-rose-500' : 'text-camel-500'} />
        </div>
        {trend !== undefined && <Trend value={trend} />}
      </div>
      <p className="text-[13px] font-bold text-ink-900 leading-none">{value}</p>
      <p className="text-[11px] text-ink-500 font-medium mt-0.5">{label}</p>
      {sub && <p className={`text-[10px] mt-0.5 ${urgent ? 'text-rose-400' : 'text-ink-400'}`}>{sub}</p>}
      {barValue !== undefined && (
        <div className="mt-2.5 h-1 bg-ivory-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
            style={{ width: `${Math.min(barValue, 100)}%` }} />
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// WEEKLY ACTIVITY MAP  ← redesigned
// ─────────────────────────────────────────────────────────────────────────────
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function ActivityMap({ items }) {
  const week     = getWeek()
  const todayStr = today()

  // Build per-day breakdown
  const dayData = week.map((dateStr) => {
    const dayItems = items.filter((c) => c.posting_date === dateStr)
    const ig   = dayItems.filter((c) => c.platform === 'instagram')
    const pins = dayItems.filter((c) => c.platform === 'pinterest')
    return { dateStr, ig, pins, total: dayItems.length }
  })

  const maxCount = Math.max(...dayData.map((d) => d.total), 1)

  return (
    <div className="bg-white rounded-2xl border border-ivory-200 p-4 shadow-soft animate-fade-up"
      style={{ animationDelay: '150ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[13px] font-black text-ink-900">This week's activity</p>
          <p className="text-[10px] text-ink-400 mt-0.5">
            {dayData.reduce((s, d) => s + d.total, 0)} pieces planned
          </p>
        </div>
        <div className="flex gap-1.5 items-center">
          <span className="text-[10px] text-ink-400">📸 IG</span>
          <span className="text-[10px] text-ink-300">·</span>
          <span className="text-[10px] text-ink-400">📌 Pin</span>
        </div>
      </div>

      <div className="flex gap-1.5">
        {dayData.map(({ dateStr, ig, pins, total }, i) => {
          const isToday  = dateStr === todayStr
          const isPast   = dateStr < todayStr
          const isFuture = dateStr > todayStr
          const pct      = total > 0 ? (total / maxCount) : 0

          return (
            <div key={dateStr} className="flex-1 flex flex-col items-center gap-1.5"
              style={{ animationDelay: `${i * 50}ms` }}>

              {/* Day cell */}
              <div className={`w-full rounded-xl relative overflow-hidden flex flex-col
                items-center justify-center transition-all duration-300
                ${isToday
                  ? 'ring-2 ring-camel-500 ring-offset-1 bg-camel-100'
                  : isPast && total > 0
                    ? 'bg-camel-500'
                    : isPast
                      ? 'bg-ivory-200'
                      : isFuture && total > 0
                        ? 'bg-camel-200'
                        : 'bg-ivory-100 border border-dashed border-ivory-300'
                }`}
                style={{ height: 52 }}>

                {total > 0 ? (
                  <div className="flex flex-col items-center justify-center gap-0.5 py-1">
                    {/* Platform icons */}
                    <div className="flex gap-0.5 flex-wrap justify-center px-0.5">
                      {ig.slice(0, 2).map((_, idx) => (
                        <span key={idx} className="text-[11px] leading-none">📸</span>
                      ))}
                      {ig.length > 2 && (
                        <span className="text-[8px] font-black text-white/80">+{ig.length - 2}</span>
                      )}
                      {pins.slice(0, 2).map((_, idx) => (
                        <span key={idx} className="text-[11px] leading-none">📌</span>
                      ))}
                      {pins.length > 2 && (
                        <span className="text-[8px] font-black text-white/80">+{pins.length - 2}</span>
                      )}
                    </div>
                    {total > 1 && (
                      <span className={`text-[9px] font-black leading-none
                        ${isPast && total > 0 ? 'text-white/80' : 'text-camel-600'}`}>
                        {total}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className={`text-[16px] ${isToday ? 'animate-pulse' : 'opacity-30'}`}>
                    {isToday ? '✦' : '·'}
                  </span>
                )}

                {/* Bottom fill bar */}
                {total > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20" />
                )}
              </div>

              {/* Day label */}
              <span className={`text-[9px] font-bold leading-none
                ${isToday ? 'text-camel-500' : isPast ? 'text-ink-500' : 'text-ink-300'}`}>
                {WEEK_DAYS[i].slice(0, 2)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-ivory-100">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-camel-500" />
          <span className="text-[9px] text-ink-400 font-medium">Past content</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-camel-200" />
          <span className="text-[9px] text-ink-400 font-medium">Upcoming</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-ivory-200 border border-dashed border-ivory-300" />
          <span className="text-[9px] text-ink-400 font-medium">Empty</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT PIPELINE
// ─────────────────────────────────────────────────────────────────────────────
const PIPELINE = [
  { key: 'idea',      label: 'Ideas',    color: 'bg-ink-200',   dot: 'bg-ink-400'   },
  { key: 'planning',  label: 'Planning', color: 'bg-camel-200', dot: 'bg-camel-400' },
  { key: 'editing',   label: 'Editing',  color: 'bg-earth-200', dot: 'bg-earth-400' },
  { key: 'scheduled', label: 'Sched.',   color: 'bg-moss-200',  dot: 'bg-moss-400'  },
  { key: 'posted',    label: 'Posted',   color: 'bg-moss-400',  dot: 'bg-moss-600'  },
]

function ContentPipeline({ items }) {
  const counts = {}
  PIPELINE.forEach((s) => {
    counts[s.key] = items.filter((c) =>
      c.status === s.key || (s.key === 'posted' && c.status === 'published')
    ).length
  })
  const maxCount = Math.max(...Object.values(counts), 1)
  const bottleneck = PIPELINE
    .filter((s) => s.key !== 'posted' && counts[s.key] > 2)
    .sort((a, b) => counts[b.key] - counts[a.key])[0]

  return (
    <div className="bg-white rounded-2xl border border-ivory-200 p-4 shadow-soft animate-fade-up"
      style={{ animationDelay: '200ms' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-bold text-ink-900">Content pipeline</p>
        {bottleneck && (
          <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle size={9} /> stuck in {bottleneck.label}
          </span>
        )}
      </div>
      <div className="flex items-end gap-2">
        {PIPELINE.map((stage, i) => {
          const count = counts[stage.key] || 0
          const h = count > 0 ? Math.max((count / maxCount) * 52, 18) : 10
          return (
            <div key={stage.key} className="flex-1 flex flex-col items-center gap-1.5"
              style={{ animationDelay: `${i * 60}ms` }}>
              <span className="text-[11px] font-bold text-ink-600">{count || '–'}</span>
              <div className="w-full relative overflow-hidden rounded-lg"
                style={{ height: h }}>
                <div className={`w-full h-full rounded-lg ${stage.color} animate-bar-grow`}
                  style={{ animationDelay: `${i * 80 + 200}ms` }} />
              </div>
              <span className="text-[9px] font-semibold text-ink-400 text-center leading-tight">{stage.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TODAY'S PRIORITIES
// ─────────────────────────────────────────────────────────────────────────────
function buildPriorities(items) {
  const todayStr = today()
  const priorities = []
  items.filter((c) => c.posting_date === todayStr && c.status === 'scheduled').slice(0, 2)
    .forEach((c) => priorities.push({ icon: '🚀', urgency: 'high', text: `Post today: "${c.title || c.pin_title || 'Untitled'}"`, sub: c.platform === 'instagram' ? 'Instagram' : 'Pinterest' }))
  items.filter((c) => c.status === 'editing').slice(0, 2)
    .forEach((c) => priorities.push({ icon: '✂️', urgency: 'medium', text: `Finish editing: "${c.title || c.pin_title || 'Untitled'}"`, sub: 'Needs final edit' }))
  const noCaption = items.filter((c) => c.platform === 'instagram' && c.content_type === 'reel' && (!c.caption || c.caption.trim().length < 10) && c.status !== 'posted').length
  if (noCaption > 0) priorities.push({ icon: '📝', urgency: 'medium', text: `Write captions for ${noCaption} reel${noCaption > 1 ? 's' : ''}`, sub: 'Captions improve saves' })
  const weekPins = items.filter((c) => c.platform === 'pinterest' && c.posting_date && getWeek().includes(c.posting_date))
  if (weekPins.length === 0 && items.filter(c => c.platform === 'instagram').length > 0)
    priorities.push({ icon: '📌', urgency: 'low', text: 'Pin something on Pinterest today', sub: 'No Pinterest activity this week' })
  if (priorities.length === 0) {
    priorities.push({ icon: '📋', urgency: 'low', text: 'Plan your next content piece', sub: 'Keep the momentum going' })
    priorities.push({ icon: '📊', urgency: 'low', text: 'Review your analytics', sub: "Track what's working" })
  }
  return priorities.slice(0, 4)
}

const URGENCY = {
  high:   { dot: 'bg-rose-400',  bg: 'bg-rose-50 border-rose-100' },
  medium: { dot: 'bg-camel-400', bg: 'bg-camel-50 border-camel-100' },
  low:    { dot: 'bg-ink-300',   bg: 'bg-ivory-50 border-ivory-200' },
}

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM CARD
// ─────────────────────────────────────────────────────────────────────────────
function PlatformBlock({ emoji, name, items, accentClass, onClick, delay = 0 }) {
  const posted    = items.filter((c) => ['posted', 'published'].includes(c.status)).length
  const scheduled = items.filter((c) => c.status === 'scheduled').length
  const drafts    = items.filter((c) => ['idea', 'planning', 'editing'].includes(c.status)).length
  const pct       = items.length > 0 ? Math.round((posted / items.length) * 100) : 0
  const typeBreakdown = {}
  items.forEach((c) => { const t = c.content_type || 'other'; typeBreakdown[t] = (typeBreakdown[t] || 0) + 1 })
  const topType = Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1])[0]

  return (
    <button onClick={onClick}
      className="flex-1 bg-white border border-ivory-200 rounded-2xl p-4 text-left shadow-soft
        active:opacity-80 animate-fade-up transition-all duration-200 active:scale-95"
      style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <p className="text-[13px] font-bold text-ink-900">{name}</p>
        </div>
        <ChevronRight size={14} className="text-ink-300" />
      </div>
      <div className="h-1.5 bg-ivory-200 rounded-full mb-1 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${accentClass}`}
          style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-ink-400 mb-3">{posted}/{items.length} published</p>
      <div className="grid grid-cols-3 gap-1.5">
        {[{ v: items.length, l: 'Total' }, { v: scheduled, l: 'Sched.' }, { v: drafts, l: 'Drafts' }].map(({ v, l }) => (
          <div key={l} className="bg-ivory-50 rounded-lg px-2 py-1.5 text-center">
            <p className="text-[13px] font-bold text-ink-900">{v}</p>
            <p className="text-[9px] text-ink-400 font-medium">{l}</p>
          </div>
        ))}
      </div>
      {topType && (
        <p className="text-[10px] text-camel-500 font-semibold mt-2.5">Top: {topType[0]}s ({topType[1]})</p>
      )}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AI STRATEGIST (locked)
// ─────────────────────────────────────────────────────────────────────────────
const REC_CONFIG = {
  insight:     { emoji: '💡', border: 'border-camel-200',  bg: 'bg-camel-50',  tag: 'Insight',     tagCls: 'text-camel-600 bg-camel-100' },
  opportunity: { emoji: '🚀', border: 'border-earth-300',  bg: 'bg-sand-100',  tag: 'Opportunity', tagCls: 'text-earth-500 bg-sand-100'  },
  warning:     { emoji: '⚠️', border: 'border-rose-200',   bg: 'bg-rose-50',   tag: 'Action',      tagCls: 'text-rose-500 bg-rose-100'   },
  positive:    { emoji: '✅', border: 'border-moss-200',   bg: 'bg-moss-50',   tag: 'On Track',    tagCls: 'text-moss-600 bg-moss-100'   },
}

function AIStrategistSection({ recs, onUnlockClick }) {
  return (
    <div className="animate-fade-up" style={{ animationDelay: '250ms' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-ink-900 flex items-center justify-center animate-glow-pulse">
            <Sparkles size={13} className="text-camel-400" />
          </div>
          <div>
            <p className="text-[13px] font-black text-ink-900 leading-none">AI Strategist</p>
            <p className="text-[9px] text-ink-400 mt-0.5">Smart analysis of your content</p>
          </div>
        </div>
        <button onClick={onUnlockClick}
          className="flex items-center gap-1 bg-gradient-to-r from-camel-500 to-purple-500
            text-white text-[10px] font-black px-2.5 py-1 rounded-full active:opacity-80">
          <Crown size={10} /> Pro
        </button>
      </div>

      {/* Lock card — always full height, no clipping */}
      <button
        onClick={onUnlockClick}
        className="w-full relative rounded-2xl overflow-hidden border border-camel-200
          bg-gradient-to-br from-camel-50 to-sand-100 active:opacity-90 transition-opacity">

        {/* Blurred preview behind */}
        <div className="px-4 pt-4 pb-24 space-y-2.5 select-none pointer-events-none"
          style={{ filter: 'blur(4px)', opacity: 0.45 }}>
          {recs.slice(0, 2).map((rec, i) => {
            const cfg = REC_CONFIG[rec.type] || REC_CONFIG.insight
            return (
              <div key={i} className={`${cfg.bg} border ${cfg.border} rounded-xl p-3`}>
                <div className="flex items-start gap-2">
                  <span className="text-[15px]">{cfg.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.tagCls}`}>{cfg.tag}</span>
                    <p className="text-[12px] text-ink-800 font-semibold leading-snug mt-1.5 line-clamp-2">{rec.text}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Gradient fade over bottom of preview */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(238,242,255,0.98) 40%, transparent)' }} />

        {/* Lock CTA — pinned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-5 px-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-camel-500 to-purple-500
            flex items-center justify-center shadow-lifted mb-2.5 animate-float">
            <Lock size={18} className="text-white" />
          </div>
          <p className="text-[14px] font-black text-ink-900 mb-0.5">Unlock AI Strategist</p>
          <p className="text-[11px] text-ink-400 mb-3 text-center">Personalised strategy, powered by AI</p>
          <div className="bg-gradient-to-r from-camel-500 to-purple-500 text-white
            text-[12px] font-black px-6 py-2.5 rounded-full shadow-lifted">
            Upgrade to Pro ✦
          </div>
        </div>
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { userProfile, contentItems, activeProjectId } = useStore()
  const { shots } = useStore.getState()
  const [showPremium, setShowPremium] = useState(false)

  const project = contentItems.filter((c) => c.project_id === activeProjectId)
  const ig      = project.filter((c) => c.platform === 'instagram')
  const pins    = project.filter((c) => c.platform === 'pinterest')

  const streak      = useMemo(() => calcStreak(project),    [project])
  const consistency = useMemo(() => calcConsistency(project), [project])
  const velocity    = useMemo(() => calcVelocity(project),  [project])
  const priorities  = useMemo(() => buildPriorities(project), [project])
  const recs        = useMemo(() => generateRecommendations(contentItems, shots, activeProjectId), [contentItems, shots, activeProjectId])

  const igPosted = ig.filter((c) => c.status === 'posted').length
  const pinPosted = pins.filter((c) => ['posted', 'published'].includes(c.status)).length
  const igDrafts = ig.filter((c) => ['idea', 'planning', 'editing'].includes(c.status)).length

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const name = userProfile?.workspace_name || userProfile?.username || 'there'

  const consistencyColor = consistency >= 70 ? '#10B981' : consistency >= 40 ? '#6366F1' : '#EF4444'
  const consistencyTrack = consistency >= 70 ? 'rgba(16,185,129,0.2)' : consistency >= 40 ? 'rgba(99,102,241,0.2)' : 'rgba(239,68,68,0.2)'

  return (
    <>
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}

      <div className="space-y-4 pb-2 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-5 lg:items-start">

        {/* ── HERO ────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 rounded-3xl p-5 shadow-lifted overflow-hidden relative animate-fade-up"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #1a1040 100%)',
          }}>

          {/* Animated background orbs */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 animate-float"
            style={{
              background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)',
              animationDuration: '4s',
            }} />
          <div className="absolute bottom-0 left-8 w-24 h-24 rounded-full opacity-10 animate-float"
            style={{
              background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
              animationDuration: '5s',
              animationDelay: '1s',
            }} />

          {/* Date */}
          <p className="text-[11px] text-white/50 font-medium mb-0.5 relative z-10">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-[20px] font-black text-white tracking-tight mb-4 relative z-10">
            {greeting}, {name} 👋
          </h1>

          {/* Stats row */}
          <div className="flex items-center gap-4 relative z-10">
            <Ring
              value={consistency} max={100} size={76} stroke={7}
              color={consistencyColor} trackColor={consistencyTrack}
              label={`${consistency}%`} sublabel="Consistency"
            />
            <div className="flex-1 space-y-2.5">
              {[
                { icon: Flame,        iconColor: 'text-orange-400', label: 'Posting streak', value: streak > 0 ? `${streak}d 🔥` : 'Start today' },
                { icon: Zap,          iconColor: 'text-camel-400',  label: 'New this week',  value: `${velocity} pieces` },
                { icon: CheckCircle2, iconColor: 'text-moss-400',   label: 'Published',      value: igPosted + pinPosted },
              ].map(({ icon: Icon, iconColor, label, value }, i) => (
                <div key={label} className="flex items-center justify-between animate-slide-right"
                  style={{ animationDelay: `${i * 60 + 100}ms` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
                      <Icon size={12} className={iconColor} />
                    </div>
                    <span className="text-[12px] text-white/70 font-medium">{label}</span>
                  </div>
                  <span className="text-[13px] font-black text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status pills */}
          <div className="flex gap-2 mt-4 flex-wrap relative z-10">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full animate-pop
              ${consistency >= 70 ? 'bg-moss-400/20 text-moss-300' : consistency >= 40 ? 'bg-camel-400/20 text-camel-300' : 'bg-rose-400/20 text-rose-300'}`}
              style={{ animationDelay: '300ms' }}>
              {consistency >= 70 ? '🟢 Strong consistency' : consistency >= 40 ? '🟡 Building momentum' : '🔴 Low consistency'}
            </span>
            {project.length > 0 && (
              <span className="bg-white/10 text-white/70 text-[11px] font-bold px-2.5 py-1 rounded-full animate-pop"
                style={{ animationDelay: '360ms' }}>
                {project.length} total items
              </span>
            )}
            {igDrafts > 3 && (
              <span className="bg-rose-400/20 text-rose-300 text-[11px] font-bold px-2.5 py-1 rounded-full animate-pop"
                style={{ animationDelay: '420ms' }}>
                ⚠️ {igDrafts} drafts pending
              </span>
            )}
          </div>
        </div>

        {/* ── CONTENT HEALTH ────────────────────────────────────── */}
        <div className="lg:row-span-2">
          <p className="text-[11px] font-black text-ink-400 uppercase tracking-widest mb-2.5 animate-fade-up"
            style={{ animationDelay: '80ms' }}>Content Health</p>
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-2.5">
            <HealthCard icon={CheckCircle2} iconBg="bg-camel-100" label="Consistency" value={`${consistency}%`}
              sub={consistency >= 70 ? 'Excellent — keep it up' : consistency >= 40 ? 'Building — push harder' : 'Low — post more'}
              barValue={consistency} barColor={consistency >= 70 ? 'bg-moss-400' : 'bg-camel-500'}
              urgent={consistency < 30} delay={100} />
            <HealthCard icon={Clock} iconBg={igDrafts > 3 ? 'bg-rose-100' : 'bg-ivory-200'} label="Pending drafts" value={String(igDrafts)}
              sub={igDrafts === 0 ? 'All clear' : igDrafts <= 2 ? 'Manageable' : 'Needs attention'}
              urgent={igDrafts > 3} delay={140} />
            <HealthCard icon={Flame} iconBg="bg-orange-100" label="Posting streak" value={streak > 0 ? `${streak} days` : 'No streak'}
              sub={streak >= 7 ? 'On fire! 🔥' : streak >= 3 ? 'Great momentum' : streak > 0 ? 'Just started' : 'Start today'}
              barValue={(streak / 14) * 100} barColor="bg-orange-400" delay={180} />
            <HealthCard icon={Zap} iconBg="bg-camel-100" label="Velocity" value={`+${velocity}`}
              sub="pieces this week" barValue={(velocity / 10) * 100} trend={velocity - 3} delay={220} />
          </div>
        </div>

        {/* ── WEEKLY ACTIVITY ───────────────────────────────────── */}
        <ActivityMap items={project} />

        {/* ── TODAY'S PRIORITIES ────────────────────────────────── */}
        {priorities.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: '160ms' }}>
            <p className="text-[11px] font-black text-ink-400 uppercase tracking-widest mb-2.5">Today's priorities</p>
            <div className="space-y-2">
              {priorities.map((p, i) => {
                const u = URGENCY[p.urgency]
                return (
                  <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${u.bg} animate-slide-right`}
                    style={{ animationDelay: `${i * 50 + 200}ms` }}>
                    <span className="text-base flex-shrink-0">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-ink-900 leading-snug truncate">{p.text}</p>
                      <p className="text-[10px] text-ink-400 mt-0.5">{p.sub}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${u.dot}`} />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── CONTENT PIPELINE ──────────────────────────────────── */}
        {project.length > 0 && <ContentPipeline items={project} />}

        {/* ── PLATFORM BLOCKS ───────────────────────────────────── */}
        <div className="animate-fade-up lg:col-span-2" style={{ animationDelay: '180ms' }}>
          <p className="text-[11px] font-black text-ink-400 uppercase tracking-widest mb-2.5">Platforms</p>
          <div className="flex gap-3">
            <PlatformBlock emoji="📸" name="Instagram" items={ig}
              accentClass="bg-gradient-to-r from-camel-400 to-camel-600"
              onClick={() => navigate('/content')} delay={200} />
            <PlatformBlock emoji="📌" name="Pinterest" items={pins}
              accentClass="bg-gradient-to-r from-earth-400 to-earth-500"
              onClick={() => navigate('/content')} delay={240} />
          </div>
        </div>

        {/* ── AI STRATEGIST (locked) ─────────────────────────────── */}
        <div className="lg:col-span-2">
          <AIStrategistSection recs={recs} onUnlockClick={() => setShowPremium(true)} />
        </div>

        {/* ── QUICK ACTIONS ─────────────────────────────────────── */}
        <div className="animate-fade-up lg:col-span-2" style={{ animationDelay: '300ms' }}>
          <p className="text-[11px] font-black text-ink-400 uppercase tracking-widest mb-2.5">Quick create</p>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { emoji: '🎬', label: 'New Reel',   route: '/content'    },
              { emoji: '📸', label: 'New Post',   route: '/content'    },
              { emoji: '📌', label: 'Pinterest',  route: '/content'    },
              { emoji: '🖼️', label: 'Reference', route: '/references' },
              { emoji: '📊', label: 'Analytics',  route: '/analytics'  },
              { emoji: '🎥', label: 'BTS Idea',   route: '/bts'        },
            ].map((a, i) => (
              <button key={a.label} onClick={() => navigate(a.route)}
                className="bg-white border border-ivory-200 rounded-xl py-3 px-2 flex flex-col items-center gap-1.5
                  shadow-soft active:bg-camel-50 active:border-camel-200 active:scale-95 transition-all duration-150 animate-pop"
                style={{ animationDelay: `${i * 40 + 320}ms` }}>
                <span className="text-xl">{a.emoji}</span>
                <span className="text-[11px] font-bold text-ink-700">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── EMPTY STATE ───────────────────────────────────────── */}
        {project.length === 0 && (
          <div className="bg-white rounded-3xl border border-ivory-200 p-8 text-center shadow-soft mt-2 animate-scale-in">
            <span className="text-4xl block mb-3 animate-float">✨</span>
            <p className="text-[15px] font-black text-ink-900 mb-1">Your content OS is ready</p>
            <p className="text-sm text-ink-400 mb-5">
              Start planning Instagram reels, posts, and Pinterest pins to see your command centre come alive.
            </p>
            <button onClick={() => navigate('/content')}
              className="bg-camel-500 text-white font-bold rounded-xl px-6 py-3 text-sm active:bg-camel-600 shadow-lifted">
              Start Planning
            </button>
          </div>
        )}

      </div>
    </>
  )
}
