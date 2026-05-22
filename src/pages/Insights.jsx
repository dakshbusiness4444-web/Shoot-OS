import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Sparkles, ChevronRight, Instagram,
  RefreshCw, Loader2, Heart, MessageCircle, Users, ImageIcon, Link } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

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
  const posted    = ig.filter((c) => c.status === 'posted')
  const analyzed  = ig.filter((c) => c.status === 'analyzed')

  // No content at all
  if (ig.length === 0) {
    recs.push({ type: 'warning', text: "You haven't planned any Instagram content yet. Start with 3–5 reels for this week.", action: 'Plan now', route: '/content' })
  }

  // BTS missing
  if (ig.length > 3 && bts.length === 0) {
    recs.push({ type: 'insight', text: "BTS content is missing from your plan. Behind-the-scenes consistently drives higher saves and connection.", action: 'Add BTS', route: '/content' })
  }

  // Too many product-only, no lifestyle
  const productOnly = ig.filter((c) => c.content_type === 'post' || c.content_type === 'reel').length
  if (productOnly > 3 && lifestyle.length === 0 && ig.length >= 4) {
    recs.push({ type: 'insight', text: "Too many product-focused posts in a row. Mix in lifestyle or storytelling content to avoid a salesy feed.", action: 'Add lifestyle', route: '/content' })
  }

  // No collabs
  if (ig.length > 5 && collab.length === 0) {
    recs.push({ type: 'opportunity', text: "No collab reels planned. Collaborations typically generate 30–50% wider reach. Consider one this week.", action: 'Plan collab', route: '/content' })
  }

  // Pinterest gap
  if (ig.length > 2 && pins.length === 0) {
    recs.push({ type: 'opportunity', text: "Pinterest board is empty. Content there has longer shelf life — a single pin can drive traffic for months.", action: 'Start pinning', route: '/content' })
  }

  // Educational content missing
  if (ig.length > 4 && edu.length === 0) {
    recs.push({ type: 'insight', text: "No educational content in your plan. Value-led posts build authority and attract your ideal audience.", action: 'Add educational', route: '/content' })
  }

  // Reels heavy without captions
  const reelsNoCaption = reels.filter((r) => !r.caption || r.caption.trim().length < 20)
  if (reelsNoCaption.length > 2) {
    recs.push({ type: 'warning', text: `${reelsNoCaption.length} reels have no caption drafted. Captions significantly improve saves and shares.`, action: 'Fill captions', route: '/content' })
  }

  // Shoot planning gap
  const pendingShots = shots.filter((s) => s.status === 'pending' && s.shot_type === 'product')
  if (pendingShots.length > 5) {
    recs.push({ type: 'warning', text: `${pendingShots.length} product shots still pending. Consider scheduling a shoot soon.`, action: 'View shot list', route: '/shoot' })
  }

  // Great consistency signal
  if (posted.length >= 3) {
    recs.push({ type: 'positive', text: `${posted.length} posts published so far. Great consistency — keep the momentum going.`, action: null })
  }

  return recs.length > 0 ? recs : [
    { type: 'positive', text: "Looking good! Add more content to your plan to get smarter insights here.", action: 'Open Plan', route: '/content' },
  ]
}

// ── Rec card ──────────────────────────────────────────────────────────────────
const REC_STYLES = {
  insight:     { bg: 'bg-camel-50  border-camel-100',  icon: '💡', tag: 'Insight',     tagCls: 'bg-camel-100 text-camel-600' },
  opportunity: { bg: 'bg-sand-100  border-sand-200',   icon: '🚀', tag: 'Opportunity', tagCls: 'bg-sand-100 text-earth-500' },
  warning:     { bg: 'bg-rose-100  border-rose-300',   icon: '⚠️', tag: 'Action',      tagCls: 'bg-rose-100 text-rose-500' },
  positive:    { bg: 'bg-moss-100  border-moss-200',   icon: '✅', tag: 'On Track',    tagCls: 'bg-moss-100 text-moss-600' },
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

// ── Stat card ──────────────────────────────────────────────────────────────────
function InsightStat({ value, label, sub, trend }) {
  return (
    <div className="bg-white rounded-2xl border border-ivory-200 p-4 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-ink-900 tracking-tight">{value}</p>
          <p className="text-[12px] font-semibold text-ink-600 mt-0.5">{label}</p>
          {sub && <p className="text-[10px] text-ink-400 mt-0.5">{sub}</p>}
        </div>
        {trend === 'up'   && <TrendingUp  size={18} className="text-moss-500 mt-1" />}
        {trend === 'down' && <TrendingDown size={18} className="text-rose-500 mt-1" />}
        {trend === 'flat' && <Minus        size={18} className="text-ink-300 mt-1" />}
      </div>
    </div>
  )
}

// ── Format distribution ───────────────────────────────────────────────────────
const FORMAT_LABELS = {
  reel: '🎬 Reels', post: '📸 Posts', story: '⚡ Stories',
  carousel: '🎠 Carousel', collab: '🤝 Collab', bts: '🎥 BTS',
  educational: '📚 Educational', lifestyle: '✨ Lifestyle',
}

function FormatBar({ type, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] font-medium text-ink-600 w-28 flex-shrink-0">
        {FORMAT_LABELS[type] || type}
      </span>
      <div className="flex-1 h-2 bg-ivory-200 rounded-full">
        <div className="h-full bg-camel-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-bold text-ink-500 w-8 text-right">{count}</span>
    </div>
  )
}

// ── Instagram live analytics ──────────────────────────────────────────────────
function InstagramAnalytics() {
  const navigate = useNavigate()
  const { instagramAccount, igMedia, igLoading, syncInstagramData } = useStore()

  if (!instagramAccount?.instagram_user_id) {
    return (
      <div className="bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] rounded-3xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Instagram size={18} className="text-white/80" />
          <p className="text-[13px] font-bold">Instagram Analytics</p>
        </div>
        <p className="text-sm text-white/70 leading-relaxed mb-4">
          Connect your Instagram account to see real engagement, reach, follower data and top-performing posts.
        </p>
        <button onClick={() => navigate('/account')}
          className="bg-white/20 text-white text-[12px] font-bold px-4 py-2 rounded-xl
            border border-white/20 active:bg-white/30 transition-colors">
          Connect Instagram →
        </button>
      </div>
    )
  }

  const totalLikes    = igMedia.reduce((s, p) => s + (p.like_count    || 0), 0)
  const totalComments = igMedia.reduce((s, p) => s + (p.comments_count || 0), 0)
  const avgLikes      = igMedia.length > 0 ? Math.round(totalLikes / igMedia.length) : 0
  const avgComments   = igMedia.length > 0 ? Math.round(totalComments / igMedia.length) : 0
  const engRate       = instagramAccount.followers_count > 0
    ? (((totalLikes + totalComments) / igMedia.length / instagramAccount.followers_count) * 100).toFixed(2)
    : '—'

  // Sort by likes for top posts
  const topPosts = [...igMedia].sort((a, b) => (b.like_count || 0) - (a.like_count || 0)).slice(0, 6)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#833ab4] to-[#fcb045] flex items-center justify-center">
            <Instagram size={14} className="text-white" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-ink-900 leading-none">Instagram</p>
            <p className="text-[10px] text-ink-400">@{instagramAccount.username}</p>
          </div>
        </div>
        <button onClick={() => syncInstagramData()}
          disabled={igLoading}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-500
            bg-ivory-100 px-3 py-1.5 rounded-xl active:bg-ivory-200 disabled:opacity-50">
          {igLoading
            ? <Loader2 size={11} className="animate-spin" />
            : <RefreshCw size={11} />
          }
          {igLoading ? 'Syncing…' : 'Sync'}
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="bg-white rounded-2xl border border-ivory-200 p-4 shadow-soft">
          <div className="flex items-center gap-1.5 mb-1">
            <Users size={13} className="text-camel-500" />
            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wide">Followers</p>
          </div>
          <p className="text-2xl font-black text-ink-900 tracking-tight">
            {(instagramAccount.followers_count || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-ivory-200 p-4 shadow-soft">
          <div className="flex items-center gap-1.5 mb-1">
            <ImageIcon size={13} className="text-camel-500" />
            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wide">Total Posts</p>
          </div>
          <p className="text-2xl font-black text-ink-900 tracking-tight">
            {(instagramAccount.media_count || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-ivory-200 p-4 shadow-soft">
          <div className="flex items-center gap-1.5 mb-1">
            <Heart size={13} className="text-rose-400" />
            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wide">Avg Likes</p>
          </div>
          <p className="text-2xl font-black text-ink-900 tracking-tight">{avgLikes.toLocaleString()}</p>
          {igMedia.length > 0 && <p className="text-[10px] text-ink-400 mt-0.5">last {igMedia.length} posts</p>}
        </div>
        <div className="bg-white rounded-2xl border border-ivory-200 p-4 shadow-soft">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={13} className="text-moss-500" />
            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wide">Eng. Rate</p>
          </div>
          <p className="text-2xl font-black text-ink-900 tracking-tight">{engRate}%</p>
          <p className="text-[10px] text-ink-400 mt-0.5">per post</p>
        </div>
      </div>

      {/* Extra stats row */}
      {igMedia.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white rounded-2xl border border-ivory-200 p-4 shadow-soft">
            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wide mb-1">Avg Comments</p>
            <p className="text-xl font-black text-ink-900">{avgComments}</p>
          </div>
          <div className="bg-white rounded-2xl border border-ivory-200 p-4 shadow-soft">
            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wide mb-1">Total Likes</p>
            <p className="text-xl font-black text-ink-900">{totalLikes.toLocaleString()}</p>
            <p className="text-[10px] text-ink-400">last {igMedia.length} posts</p>
          </div>
        </div>
      )}

      {/* Top posts grid */}
      {topPosts.length > 0 && (
        <div>
          <p className="text-[13px] font-bold text-ink-700 mb-2.5">Top Performing Posts</p>
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-6">
            {topPosts.map((post) => (
              <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer"
                className="relative group rounded-xl overflow-hidden aspect-square bg-ivory-100 block">
                {(post.media_url || post.thumbnail_url) ? (
                  <img
                    src={post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={20} className="text-ink-300" />
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1
                  opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 text-white">
                    <Heart size={11} fill="white" />
                    <span className="text-[11px] font-bold">{post.like_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/80">
                    <MessageCircle size={10} />
                    <span className="text-[10px]">{post.comments_count || 0}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {igMedia.length === 0 && !igLoading && (
        <div className="bg-ivory-50 border border-ivory-200 rounded-2xl p-5 text-center">
          <p className="text-[13px] text-ink-500">No posts loaded yet.</p>
          <button onClick={() => syncInstagramData()}
            className="mt-2 text-[12px] font-bold text-camel-500 active:text-camel-600">
            Tap Sync to load →
          </button>
        </div>
      )}

      {/* Biography */}
      {instagramAccount.biography && (
        <div className="bg-ivory-50 border border-ivory-200 rounded-xl p-3">
          <p className="text-[11px] text-ink-500 italic">"{instagramAccount.biography}"</p>
        </div>
      )}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Insights() {
  const navigate = useNavigate()
  const { contentItems, shots, activeProjectId } = useStore()

  const ig   = contentItems.filter((c) => c.platform === 'instagram' && c.project_id === activeProjectId)
  const pins = contentItems.filter((c) => c.platform === 'pinterest'  && c.project_id === activeProjectId)

  const posted    = ig.filter((c) => c.status === 'posted').length
  const planned   = ig.filter((c) => c.status !== 'posted' && c.status !== 'analyzed').length
  const scheduled = ig.filter((c) => c.status === 'scheduled').length
  const totalShots = shots.filter((s) => s.shot_type === 'product').length
  const doneShots  = shots.filter((s) => s.shot_type === 'product' && s.status === 'done').length

  // Format distribution
  const formatCounts = {}
  ig.forEach((c) => {
    if (c.content_type) formatCounts[c.content_type] = (formatCounts[c.content_type] || 0) + 1
  })
  const formats = Object.entries(formatCounts).sort((a, b) => b[1] - a[1])

  const recs = generateRecommendations(contentItems, shots, activeProjectId)

  return (
    <div className="space-y-6 pb-2">

      {/* ── AI Strategist ────────────────────────────────── */}
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

      {/* ── Content stats ────────────────────────────────── */}
      <div>
        <p className="text-[15px] font-bold text-ink-900 tracking-tight mb-3">Content Overview</p>
        <div className="grid grid-cols-2 gap-2.5">
          <InsightStat value={ig.length}    label="Instagram Items"   sub="total planned"   trend={ig.length > 3 ? 'up' : 'flat'} />
          <InsightStat value={pins.length}  label="Pinterest Pins"    sub="total planned"   trend={pins.length > 0 ? 'up' : 'flat'} />
          <InsightStat value={posted}       label="Posts Published"   sub="all time"        trend={posted > 0 ? 'up' : 'flat'} />
          <InsightStat value={scheduled}    label="Scheduled"         sub="ready to go"     trend={scheduled > 0 ? 'up' : 'flat'} />
        </div>
      </div>

      {/* ── Shoot progress ───────────────────────────────── */}
      {totalShots > 0 && (
        <div>
          <p className="text-[15px] font-bold text-ink-900 tracking-tight mb-3">Shoot Progress</p>
          <div className="bg-white rounded-2xl border border-ivory-200 p-4 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-2xl font-bold text-ink-900">{doneShots}<span className="text-ink-300 font-normal">/{totalShots}</span></p>
                <p className="text-[12px] font-semibold text-ink-500">shots completed</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-camel-500">
                  {Math.round((doneShots / totalShots) * 100)}%
                </p>
                <p className="text-[12px] font-semibold text-ink-400">done</p>
              </div>
            </div>
            <div className="h-2 bg-ivory-200 rounded-full overflow-hidden">
              <div className="h-full bg-camel-500 rounded-full transition-all duration-700"
                style={{ width: `${(doneShots / totalShots) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Format distribution ──────────────────────────── */}
      {formats.length > 0 && (
        <div>
          <p className="text-[15px] font-bold text-ink-900 tracking-tight mb-3">Content Mix</p>
          <div className="bg-white rounded-2xl border border-ivory-200 p-4 shadow-soft space-y-3">
            {formats.map(([type, count]) => (
              <FormatBar key={type} type={type} count={count} total={ig.length} />
            ))}
          </div>
        </div>
      )}

      {/* ── Instagram Analytics ─────────────────────────── */}
      <InstagramAnalytics />

    </div>
  )
}
