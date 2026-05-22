import { useState, useMemo, useEffect } from 'react'
import {
  TrendingUp, TrendingDown, Minus, Sparkles, ChevronRight, ChevronLeft,
  Eye, Heart, MessageCircle, Share2, Bookmark, Users, BarChart3,
  Calendar, Image as ImageIcon, ArrowLeft, Plus, Award, Instagram,
  RefreshCw, Loader2, ExternalLink
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import ProAnalytics from '../components/analytics/ProAnalytics'

// ── Smart recommendations engine (rule-based) ─────────────────────────────
export function generateRecommendations(contentItems, shots, projectId) {
  const recs = []
  const ig    = contentItems.filter((c) => c.platform === 'instagram' && c.project_id === projectId)
  const pins  = contentItems.filter((c) => c.platform === 'pinterest'  && c.project_id === projectId)

  const reels     = ig.filter((c) => c.content_type === 'reel')
  const bts       = ig.filter((c) => c.content_type === 'bts')
  const collab    = ig.filter((c) => c.content_type === 'collab')
  const edu       = ig.filter((c) => c.content_type === 'educational')
  const lifestyle = ig.filter((c) => c.content_type === 'lifestyle')
  const posted    = ig.filter((c) => c.status === 'posted' || c.status === 'analyzed')

  if (ig.length === 0) {
    recs.push({ type: 'warning', text: "You haven't planned any Instagram content yet. Start with 3–5 reels for this week.", action: 'Plan now', route: '/content' })
  }
  if (ig.length > 3 && bts.length === 0) {
    recs.push({ type: 'insight', text: "BTS content is missing. Behind-the-scenes drives higher saves and connection.", action: 'Add BTS', route: '/content' })
  }
  const productOnly = ig.filter((c) => c.content_type === 'post' || c.content_type === 'reel').length
  if (productOnly > 3 && lifestyle.length === 0 && ig.length >= 4) {
    recs.push({ type: 'insight', text: "Too many product-focused posts. Mix in lifestyle or storytelling to avoid a salesy feed.", action: 'Add lifestyle', route: '/content' })
  }
  if (ig.length > 5 && collab.length === 0) {
    recs.push({ type: 'opportunity', text: "No collab reels planned. Collaborations typically generate 30–50% wider reach.", action: 'Plan collab', route: '/content' })
  }
  if (ig.length > 2 && pins.length === 0) {
    recs.push({ type: 'opportunity', text: "Pinterest board is empty. Content there has longer shelf life — a single pin can drive traffic for months.", action: 'Start pinning', route: '/content' })
  }
  if (ig.length > 4 && edu.length === 0) {
    recs.push({ type: 'insight', text: "No educational content. Value-led posts build authority.", action: 'Add educational', route: '/content' })
  }
  if (posted.length >= 3) {
    recs.push({ type: 'positive', text: `${posted.length} posts published. Great consistency — keep the momentum going.`, action: null })
  }
  return recs.length > 0 ? recs : [
    { type: 'positive', text: "Looking good! Add more content to your plan to get smarter insights here.", action: 'Open Plan', route: '/content' },
  ]
}

const REC_STYLES = {
  insight:     { bg: 'bg-camel-50 border-camel-100', icon: '💡', tag: 'Insight',     tagCls: 'bg-camel-100 text-camel-600' },
  opportunity: { bg: 'bg-sand-100 border-sand-200',  icon: '🚀', tag: 'Opportunity', tagCls: 'bg-sand-100 text-earth-500' },
  warning:     { bg: 'bg-rose-100 border-rose-300',  icon: '⚠️', tag: 'Action',      tagCls: 'bg-rose-100 text-rose-500' },
  positive:    { bg: 'bg-moss-100 border-moss-200',  icon: '✅', tag: 'On Track',    tagCls: 'bg-moss-100 text-moss-600' },
}

function RecCard({ rec, navigate }) {
  const s = REC_STYLES[rec.type] || REC_STYLES.insight
  return (
    <div className={`${s.bg} border rounded-2xl p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{s.icon}</span>
        <div className="flex-1 min-w-0">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.tagCls}`}>
            {s.tag}
          </span>
          <p className="text-[13px] text-ink-800 font-medium leading-snug mt-2">{rec.text}</p>
          {rec.action && (
            <button onClick={() => navigate(rec.route)}
              className="mt-2.5 text-[12px] font-bold text-camel-600 flex items-center gap-1 active:opacity-70">
              {rec.action} <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatNumber(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

const METRIC_CARDS = [
  { key: 'views',           label: 'Views',          icon: Eye,           color: 'text-camel-500', bg: 'bg-camel-50' },
  { key: 'likes',           label: 'Likes',          icon: Heart,         color: 'text-rose-500',  bg: 'bg-rose-50' },
  { key: 'comments',        label: 'Comments',       icon: MessageCircle, color: 'text-moss-500',  bg: 'bg-moss-50' },
  { key: 'shares',          label: 'Shares',         icon: Share2,        color: 'text-camel-500', bg: 'bg-camel-50' },
  { key: 'saves',           label: 'Saves',          icon: Bookmark,      color: 'text-earth-500', bg: 'bg-sand-50' },
  { key: 'reach',           label: 'Reach',          icon: TrendingUp,    color: 'text-ink-600',   bg: 'bg-ivory-100' },
  { key: 'impressions',     label: 'Impressions',    icon: BarChart3,     color: 'text-ink-600',   bg: 'bg-ivory-100' },
  { key: 'profile_visits',  label: 'Profile Visits', icon: Users,         color: 'text-camel-500', bg: 'bg-camel-50' },
  { key: 'followers_gained',label: 'New Followers',  icon: Plus,          color: 'text-moss-500',  bg: 'bg-moss-50' },
]

function sumMetrics(items, key) {
  return items.reduce((sum, item) => sum + (item.analytics?.[key] || 0), 0)
}

// ── Overall View ─────────────────────────────────────────────────────────────
function OverallView({ posted }) {
  if (posted.length === 0) {
    return (
      <div className="bg-ivory-50 border border-ivory-200 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 bg-camel-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <BarChart3 size={22} className="text-camel-500" />
        </div>
        <p className="text-[14px] font-bold text-ink-700 mb-1">No analytics yet</p>
        <p className="text-[12px] text-ink-400">Mark some content as Posted and add their stats to see analytics here.</p>
      </div>
    )
  }

  const totalLikes    = sumMetrics(posted, 'likes')
  const totalComments = sumMetrics(posted, 'comments')
  const totalReach    = sumMetrics(posted, 'reach')
  const avgEngagement = totalReach > 0 ? (((totalLikes + totalComments) / totalReach) * 100).toFixed(2) : '—'

  // Top performing post by engagement (likes + comments)
  const sorted = [...posted].sort((a, b) => {
    const aEng = (a.analytics?.likes || 0) + (a.analytics?.comments || 0)
    const bEng = (b.analytics?.likes || 0) + (b.analytics?.comments || 0)
    return bEng - aEng
  })
  const topPost = sorted[0]

  // Content type breakdown
  const typeStats = {}
  posted.forEach((p) => {
    const t = p.content_type || 'other'
    if (!typeStats[t]) typeStats[t] = { count: 0, likes: 0, views: 0 }
    typeStats[t].count++
    typeStats[t].likes += p.analytics?.likes || 0
    typeStats[t].views += p.analytics?.views || 0
  })

  return (
    <div className="space-y-5">
      {/* Hero stat */}
      <div className="bg-gradient-to-br from-ink-900 to-ink-800 rounded-3xl p-5 text-white shadow-lifted">
        <p className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1">Total Engagement</p>
        <p className="text-4xl font-black tracking-tight">
          {formatNumber(totalLikes + totalComments + sumMetrics(posted, 'saves') + sumMetrics(posted, 'shares'))}
        </p>
        <p className="text-[12px] text-white/60 mt-1">across {posted.length} posts</p>

        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10">
          <div>
            <p className="text-xl font-bold text-camel-300">{avgEngagement}%</p>
            <p className="text-[10px] text-white/50 font-medium">Avg Engagement</p>
          </div>
          <div>
            <p className="text-xl font-bold text-camel-300">{formatNumber(totalReach)}</p>
            <p className="text-[10px] text-white/50 font-medium">Total Reach</p>
          </div>
          <div>
            <p className="text-xl font-bold text-camel-300">{formatNumber(sumMetrics(posted, 'followers_gained'))}</p>
            <p className="text-[10px] text-white/50 font-medium">New Followers</p>
          </div>
        </div>
      </div>

      {/* Metric grid */}
      <div>
        <p className="text-[13px] font-bold text-ink-700 mb-2.5">All Metrics</p>
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-5">
          {METRIC_CARDS.map((m) => {
            const Icon = m.icon
            const total = sumMetrics(posted, m.key)
            return (
              <div key={m.key} className="bg-white rounded-2xl border border-ivory-200 p-3 shadow-soft">
                <div className={`w-7 h-7 rounded-lg ${m.bg} flex items-center justify-center mb-2`}>
                  <Icon size={13} className={m.color} />
                </div>
                <p className="text-lg font-black text-ink-900 leading-none">{formatNumber(total)}</p>
                <p className="text-[10px] text-ink-400 font-medium mt-0.5">{m.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top performing post */}
      {topPost && (
        <div>
          <p className="text-[13px] font-bold text-ink-700 mb-2.5 flex items-center gap-1.5">
            <Award size={13} className="text-camel-500" /> Top Performing Post
          </p>
          <div className="bg-white rounded-2xl border border-camel-200 shadow-soft overflow-hidden">
            <div className="flex">
              {topPost.media_urls?.[0] && (
                <div className="w-24 h-24 flex-shrink-0 bg-ivory-100">
                  <img src={topPost.media_urls[0]} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 p-3">
                <p className="text-[13px] font-bold text-ink-900 mb-1 line-clamp-1">{topPost.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-ink-700">
                    <Heart size={11} className="text-rose-500" /> {formatNumber(topPost.analytics?.likes)}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-ink-700">
                    <MessageCircle size={11} className="text-moss-500" /> {formatNumber(topPost.analytics?.comments)}
                  </span>
                  {topPost.analytics?.views > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-ink-700">
                      <Eye size={11} className="text-camel-500" /> {formatNumber(topPost.analytics?.views)}
                    </span>
                  )}
                </div>
                {topPost.posting_date && (
                  <p className="text-[10px] text-ink-400 mt-1.5">
                    📅 {new Date(topPost.posting_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content type breakdown */}
      <div>
        <p className="text-[13px] font-bold text-ink-700 mb-2.5">Performance by Type</p>
        <div className="bg-white rounded-2xl border border-ivory-200 shadow-soft divide-y divide-ivory-100">
          {Object.entries(typeStats).sort((a, b) => b[1].likes - a[1].likes).map(([type, stats]) => (
            <div key={type} className="flex items-center justify-between p-3.5">
              <div>
                <p className="text-[13px] font-bold text-ink-800 capitalize">{type}</p>
                <p className="text-[11px] text-ink-400">{stats.count} posts</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-ink-900">{formatNumber(stats.likes)}</p>
                  <p className="text-[10px] text-ink-400">likes</p>
                </div>
                {stats.views > 0 && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-ink-900">{formatNumber(stats.views)}</p>
                    <p className="text-[10px] text-ink-400">views</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Per Post View ────────────────────────────────────────────────────────────
function PerPostView({ posted, selectedId, setSelectedId }) {
  const selected = posted.find((p) => p.id === selectedId)

  if (posted.length === 0) {
    return (
      <div className="bg-ivory-50 border border-ivory-200 rounded-2xl p-8 text-center">
        <p className="text-[13px] text-ink-400">No posted content yet.</p>
      </div>
    )
  }

  // Detail view
  if (selected) {
    const a = selected.analytics || {}
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedId(null)}
          className="flex items-center gap-1.5 text-[12px] font-bold text-camel-600 active:opacity-70">
          <ArrowLeft size={13} /> Back to all posts
        </button>

        {/* Post header */}
        <div className="bg-white rounded-2xl border border-ivory-200 shadow-soft overflow-hidden">
          {selected.media_urls?.[0] && (
            <img src={selected.media_urls[0]} alt="" className="w-full aspect-square object-cover" />
          )}
          <div className="p-4">
            <p className="text-[15px] font-black text-ink-900 leading-tight">{selected.title}</p>
            {selected.hook && <p className="text-[12px] text-ink-500 mt-1.5 italic">"{selected.hook}"</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold text-camel-600 bg-camel-50 px-2 py-0.5 rounded-full uppercase">
                {selected.content_type}
              </span>
              {selected.posting_date && (
                <span className="text-[10px] text-ink-400">
                  📅 {new Date(selected.posting_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* All metrics */}
        <div className="grid grid-cols-3 gap-2">
          {METRIC_CARDS.map((m) => {
            const Icon = m.icon
            const val = a[m.key] || 0
            return (
              <div key={m.key} className="bg-white rounded-2xl border border-ivory-200 p-3 shadow-soft">
                <div className={`w-7 h-7 rounded-lg ${m.bg} flex items-center justify-center mb-2`}>
                  <Icon size={13} className={m.color} />
                </div>
                <p className="text-xl font-black text-ink-900 leading-none">{formatNumber(val)}</p>
                <p className="text-[10px] text-ink-400 font-medium mt-0.5">{m.label}</p>
              </div>
            )
          })}
        </div>

        {/* Engagement rate */}
        {a.reach > 0 && (
          <div className="bg-gradient-to-r from-camel-500 to-camel-600 rounded-2xl p-4 text-white">
            <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Engagement Rate</p>
            <p className="text-3xl font-black mt-1">
              {(((a.likes || 0) + (a.comments || 0)) / a.reach * 100).toFixed(2)}%
            </p>
            <p className="text-[11px] text-white/70 mt-1">(likes + comments) ÷ reach</p>
          </div>
        )}
      </div>
    )
  }

  // List view
  return (
    <div>
      <p className="text-[13px] font-bold text-ink-700 mb-2.5">Select a post to view details</p>
      <div className="space-y-2.5">
        {posted.map((p) => {
          const eng = (p.analytics?.likes || 0) + (p.analytics?.comments || 0)
          return (
            <button key={p.id} onClick={() => setSelectedId(p.id)}
              className="w-full bg-white rounded-2xl border border-ivory-200 shadow-soft overflow-hidden flex
                active:opacity-90 transition-opacity text-left">
              {p.media_urls?.[0] && (
                <div className="w-20 h-20 flex-shrink-0 bg-ivory-100">
                  <img src={p.media_urls[0]} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 p-3 min-w-0">
                <p className="text-[13px] font-bold text-ink-900 line-clamp-1">{p.title}</p>
                <p className="text-[10px] text-ink-400 uppercase font-semibold mt-0.5">{p.content_type}</p>
                <div className="flex items-center gap-2.5 mt-1.5">
                  {p.analytics?.views > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-ink-700">
                      <Eye size={9} /> {formatNumber(p.analytics.views)}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10px] font-bold text-ink-700">
                    <Heart size={9} className="text-rose-400" /> {formatNumber(p.analytics?.likes)}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-ink-700">
                    <MessageCircle size={9} className="text-moss-400" /> {formatNumber(p.analytics?.comments)}
                  </span>
                </div>
              </div>
              <ChevronRight size={14} className="text-ink-300 self-center mr-3" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Day-wise View ────────────────────────────────────────────────────────────
function DayWiseView({ posted }) {
  // Group posts by date
  const byDate = useMemo(() => {
    const map = {}
    posted.forEach((p) => {
      const d = p.posting_date || p.created_at?.split('T')[0]
      if (!d) return
      const dayKey = d.split('T')[0]
      if (!map[dayKey]) map[dayKey] = { date: dayKey, posts: [], totalLikes: 0, totalViews: 0, totalReach: 0, totalEng: 0 }
      map[dayKey].posts.push(p)
      map[dayKey].totalLikes += p.analytics?.likes || 0
      map[dayKey].totalViews += p.analytics?.views || 0
      map[dayKey].totalReach += p.analytics?.reach || 0
      map[dayKey].totalEng += (p.analytics?.likes || 0) + (p.analytics?.comments || 0)
    })
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date))
  }, [posted])

  if (byDate.length === 0) {
    return (
      <div className="bg-ivory-50 border border-ivory-200 rounded-2xl p-8 text-center">
        <p className="text-[13px] text-ink-400">No posts with dates yet.</p>
      </div>
    )
  }

  // Find max for bar scaling
  const maxEng = Math.max(...byDate.map((d) => d.totalEng))
  const bestDay = byDate.reduce((best, d) => d.totalEng > best.totalEng ? d : best, byDate[0])

  return (
    <div className="space-y-5">
      {/* Best day */}
      <div className="bg-gradient-to-br from-camel-500 to-camel-600 rounded-3xl p-5 text-white shadow-lifted">
        <div className="flex items-center gap-2 mb-2">
          <Award size={15} className="text-white/80" />
          <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Best Day</p>
        </div>
        <p className="text-2xl font-black tracking-tight">
          {new Date(bestDay.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <p className="text-[12px] text-white/80 mt-1">
          {formatNumber(bestDay.totalEng)} engagements · {bestDay.posts.length} post{bestDay.posts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Daily breakdown */}
      <div>
        <p className="text-[13px] font-bold text-ink-700 mb-2.5">Daily Breakdown</p>
        <div className="space-y-2">
          {byDate.map((d) => {
            const widthPct = maxEng > 0 ? (d.totalEng / maxEng) * 100 : 0
            return (
              <div key={d.date} className="bg-white rounded-2xl border border-ivory-200 p-3.5 shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[13px] font-bold text-ink-800">
                      {new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-[10px] text-ink-400">{d.posts.length} post{d.posts.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-black text-ink-900">{formatNumber(d.totalEng)}</p>
                    <p className="text-[10px] text-ink-400">engagements</p>
                  </div>
                </div>

                {/* Bar */}
                <div className="h-1.5 bg-ivory-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-camel-400 to-camel-500 rounded-full transition-all duration-500"
                    style={{ width: `${widthPct}%` }} />
                </div>

                {/* Mini stats */}
                <div className="flex items-center gap-3 mt-2.5">
                  {d.totalViews > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-ink-500">
                      <Eye size={10} /> {formatNumber(d.totalViews)}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-ink-500">
                    <Heart size={10} className="text-rose-400" /> {formatNumber(d.totalLikes)}
                  </span>
                  {d.totalReach > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-ink-500">
                      <TrendingUp size={10} /> {formatNumber(d.totalReach)} reach
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Instagram Live Data View (from API) ──────────────────────────────────────
function InstagramLiveSection() {
  const { instagramAccount, igMedia, igLoading, syncInstagramData } = useStore()
  const [filter, setFilter] = useState('all')   // all | reel | post | carousel
  const [selected, setSelected] = useState(null)

  // Auto-sync on mount if data is stale
  useEffect(() => {
    if (instagramAccount?.access_token && igMedia.length === 0) {
      syncInstagramData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instagramAccount?.access_token])

  if (!instagramAccount?.access_token) return null

  // Filter media by type
  const filteredMedia = igMedia.filter((p) => {
    if (filter === 'all') return true
    if (filter === 'reel') return p.media_type === 'VIDEO'
    if (filter === 'carousel') return p.media_type === 'CAROUSEL_ALBUM'
    if (filter === 'post') return p.media_type === 'IMAGE'
    return true
  })

  // Stats
  const totalLikes    = igMedia.reduce((s, p) => s + (p.like_count || 0), 0)
  const totalComments = igMedia.reduce((s, p) => s + (p.comments_count || 0), 0)
  const avgLikes      = igMedia.length > 0 ? Math.round(totalLikes / igMedia.length) : 0
  const engRate       = instagramAccount.followers_count > 0 && igMedia.length > 0
    ? (((totalLikes + totalComments) / igMedia.length / instagramAccount.followers_count) * 100).toFixed(2)
    : '—'

  // Detail view
  if (selected) {
    const p = selected
    return (
      <div className="space-y-4">
        <button onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-[12px] font-bold text-camel-600 active:opacity-70">
          <ArrowLeft size={13} /> Back to all posts
        </button>

        <div className="bg-white rounded-2xl border border-ivory-200 shadow-soft overflow-hidden">
          <img
            src={p.media_type === 'VIDEO' ? p.thumbnail_url : p.media_url}
            alt=""
            className="w-full aspect-square object-cover bg-ivory-100"
          />
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-camel-600 bg-camel-50 px-2 py-0.5 rounded-full uppercase">
                {p.media_type === 'VIDEO' ? 'Reel' : p.media_type === 'CAROUSEL_ALBUM' ? 'Carousel' : 'Post'}
              </span>
              <span className="text-[10px] text-ink-400">
                📅 {new Date(p.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <a href={p.permalink} target="_blank" rel="noopener noreferrer"
                className="ml-auto text-[10px] font-bold text-camel-500 flex items-center gap-1">
                Open on IG <ExternalLink size={9} />
              </a>
            </div>
            {p.caption && (
              <p className="text-[12px] text-ink-700 leading-relaxed whitespace-pre-wrap line-clamp-6">
                {p.caption}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white rounded-2xl border border-ivory-200 p-4 shadow-soft">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Heart size={13} className="text-rose-500" />
              <p className="text-[10px] font-bold text-ink-500 uppercase">Likes</p>
            </div>
            <p className="text-2xl font-black text-ink-900">{formatNumber(p.like_count)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-ivory-200 p-4 shadow-soft">
            <div className="flex items-center gap-1.5 mb-1.5">
              <MessageCircle size={13} className="text-moss-500" />
              <p className="text-[10px] font-bold text-ink-500 uppercase">Comments</p>
            </div>
            <p className="text-2xl font-black text-ink-900">{formatNumber(p.comments_count)}</p>
          </div>
        </div>

        {instagramAccount.followers_count > 0 && (
          <div className="bg-gradient-to-r from-camel-500 to-camel-600 rounded-2xl p-4 text-white">
            <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Engagement Rate</p>
            <p className="text-3xl font-black mt-1">
              {(((p.like_count || 0) + (p.comments_count || 0)) / instagramAccount.followers_count * 100).toFixed(2)}%
            </p>
            <p className="text-[11px] text-white/70 mt-1">(likes + comments) ÷ followers</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Account header */}
      <div className="bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] rounded-3xl p-5 text-white shadow-lifted">
        <div className="flex items-center gap-3 mb-3">
          {instagramAccount.profile_picture_url ? (
            <img src={instagramAccount.profile_picture_url}
              className="w-12 h-12 rounded-full border-2 border-white/50" alt="" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Instagram size={20} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-black truncate">@{instagramAccount.username}</p>
            <p className="text-[11px] text-white/80 truncate">{instagramAccount.name}</p>
          </div>
          <button onClick={() => syncInstagramData()} disabled={igLoading}
            className="bg-white/20 active:bg-white/30 rounded-xl p-2">
            {igLoading
              ? <Loader2 size={14} className="animate-spin" />
              : <RefreshCw size={14} />
            }
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/20">
          <div>
            <p className="text-xl font-black">{formatNumber(instagramAccount.followers_count)}</p>
            <p className="text-[10px] text-white/70 font-medium">Followers</p>
          </div>
          <div>
            <p className="text-xl font-black">{formatNumber(instagramAccount.media_count)}</p>
            <p className="text-[10px] text-white/70 font-medium">Posts</p>
          </div>
          <div>
            <p className="text-xl font-black">{engRate}%</p>
            <p className="text-[10px] text-white/70 font-medium">Avg Eng.</p>
          </div>
        </div>
      </div>

      {/* Aggregate stats */}
      {igMedia.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <div className="bg-white rounded-2xl border border-ivory-200 p-3.5 shadow-soft">
            <div className="flex items-center gap-1.5 mb-1">
              <Heart size={12} className="text-rose-500" />
              <p className="text-[10px] font-bold text-ink-400 uppercase">Total Likes</p>
            </div>
            <p className="text-xl font-black text-ink-900">{formatNumber(totalLikes)}</p>
            <p className="text-[10px] text-ink-400">last {igMedia.length} posts</p>
          </div>
          <div className="bg-white rounded-2xl border border-ivory-200 p-3.5 shadow-soft">
            <div className="flex items-center gap-1.5 mb-1">
              <MessageCircle size={12} className="text-moss-500" />
              <p className="text-[10px] font-bold text-ink-400 uppercase">Total Comments</p>
            </div>
            <p className="text-xl font-black text-ink-900">{formatNumber(totalComments)}</p>
            <p className="text-[10px] text-ink-400">last {igMedia.length} posts</p>
          </div>
          <div className="bg-white rounded-2xl border border-ivory-200 p-3.5 shadow-soft">
            <div className="flex items-center gap-1.5 mb-1">
              <Heart size={12} className="text-rose-500" />
              <p className="text-[10px] font-bold text-ink-400 uppercase">Avg Likes</p>
            </div>
            <p className="text-xl font-black text-ink-900">{formatNumber(avgLikes)}</p>
            <p className="text-[10px] text-ink-400">per post</p>
          </div>
          <div className="bg-white rounded-2xl border border-ivory-200 p-3.5 shadow-soft">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={12} className="text-camel-500" />
              <p className="text-[10px] font-bold text-ink-400 uppercase">Engagement</p>
            </div>
            <p className="text-xl font-black text-ink-900">{engRate}%</p>
            <p className="text-[10px] text-ink-400">avg rate</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {igMedia.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'reel', 'post', 'carousel'].map((f) => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-colors
                ${filter === f ? 'bg-ink-900 text-white' : 'bg-ivory-100 text-ink-500 active:bg-ivory-200'}`}>
              {f === 'all' ? `All · ${igMedia.length}` :
               f === 'reel' ? `🎬 Reels · ${igMedia.filter(p => p.media_type === 'VIDEO').length}` :
               f === 'post' ? `📸 Posts · ${igMedia.filter(p => p.media_type === 'IMAGE').length}` :
               `🎠 Carousels · ${igMedia.filter(p => p.media_type === 'CAROUSEL_ALBUM').length}`}
            </button>
          ))}
        </div>
      )}

      {/* Media grid */}
      {igLoading && igMedia.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-3">
          <Loader2 size={24} className="text-camel-500 animate-spin" />
          <p className="text-[12px] text-ink-400">Loading your Instagram posts…</p>
        </div>
      ) : filteredMedia.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {filteredMedia.map((p) => (
            <button key={p.id} onClick={() => setSelected(p)}
              className="relative group rounded-xl overflow-hidden aspect-square bg-ivory-100">
              {(p.media_url || p.thumbnail_url) && (
                <img
                  src={p.media_type === 'VIDEO' ? p.thumbnail_url : p.media_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
              {/* Type indicator */}
              {p.media_type === 'VIDEO' && (
                <span className="absolute top-1.5 right-1.5 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                  🎬
                </span>
              )}
              {p.media_type === 'CAROUSEL_ALBUM' && (
                <span className="absolute top-1.5 right-1.5 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                  🎠
                </span>
              )}
              {/* Stats overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 text-white">
                  <span className="flex items-center gap-0.5 text-[10px] font-bold">
                    <Heart size={10} fill="white" /> {formatNumber(p.like_count)}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] font-bold">
                    <MessageCircle size={10} /> {formatNumber(p.comments_count)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center bg-ivory-50 rounded-2xl border border-ivory-200">
          <p className="text-[12px] text-ink-400">No posts in this category</p>
        </div>
      )}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
const VIEWS = [
  { id: 'overall',  label: 'Overall',  icon: BarChart3 },
  { id: 'per-post', label: 'Per Post', icon: ImageIcon },
  { id: 'day-wise', label: 'Day-wise', icon: Calendar },
]

export default function Insights() {
  const navigate = useNavigate()
  const { contentItems, shots, activeProjectId, instagramAccount } = useStore()
  const [view, setView] = useState('overall')
  const [source, setSource] = useState('pro')  // pro | live | manual
  const [selectedPostId, setSelectedPostId] = useState(null)

  const ig = contentItems.filter((c) => c.platform === 'instagram' && c.project_id === activeProjectId)
  const posted = ig.filter((c) => c.status === 'posted' || c.status === 'analyzed')

  const recs = generateRecommendations(contentItems, shots, activeProjectId)
  const igConnected = !!instagramAccount?.access_token

  return (
    <div className="space-y-5 pb-2">

      {/* ── Source switcher (always show — 3 modes) ────── */}
      <div className="bg-ivory-100 rounded-2xl p-1 flex gap-1">
        <button onClick={() => setSource('pro')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all
            ${source === 'pro' ? 'bg-ink-900 text-white shadow-soft' : 'text-ink-500'}`}>
          <Sparkles size={12} />
          Pro Reports
        </button>
        {igConnected && (
          <button onClick={() => setSource('live')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all
              ${source === 'live' ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500'}`}>
            <Instagram size={12} />
            IG Live
            <span className="w-1.5 h-1.5 rounded-full bg-moss-500" />
          </button>
        )}
        <button onClick={() => setSource('manual')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all
            ${source === 'manual' ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500'}`}>
          <BarChart3 size={12} />
          Simple
        </button>
      </div>

      {/* ── Pro Reports ─────────────────────────────────── */}
      {source === 'pro' && <ProAnalytics />}

      {/* ── Live Instagram data ──────────────────────────── */}
      {igConnected && source === 'live' && <InstagramLiveSection />}

      {/* ── AI Strategist (only on manual view) ──────────── */}
      {source === 'manual' && (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-camel-500 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-ink-900 leading-none">AI Strategist</p>
            <p className="text-[10px] text-ink-400">Based on your content plan</p>
          </div>
        </div>
        <div className="space-y-3">
          {recs.map((rec, i) => <RecCard key={i} rec={rec} navigate={navigate} />)}
        </div>
      </div>
      )}

      {/* ── Simple Manual Reports section ─────────────── */}
      {source === 'manual' && (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-ink-900 flex items-center justify-center">
            <BarChart3 size={14} className="text-white" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-ink-900 leading-none">Manual Reports</p>
            <p className="text-[10px] text-ink-400">{posted.length} posted · {ig.length - posted.length} in pipeline</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="bg-ivory-100 rounded-2xl p-1 flex gap-1 mb-4">
          {VIEWS.map((v) => {
            const Icon = v.icon
            const active = view === v.id
            return (
              <button key={v.id}
                onClick={() => { setView(v.id); setSelectedPostId(null) }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold transition-all
                  ${active
                    ? 'bg-white text-ink-900 shadow-soft'
                    : 'text-ink-500 active:text-ink-700'}`}>
                <Icon size={13} />
                {v.label}
              </button>
            )
          })}
        </div>

        {/* View content */}
        {view === 'overall'  && <OverallView posted={posted} />}
        {view === 'per-post' && <PerPostView  posted={posted} selectedId={selectedPostId} setSelectedId={setSelectedPostId} />}
        {view === 'day-wise' && <DayWiseView  posted={posted} />}
      </div>
      )}

    </div>
  )
}
