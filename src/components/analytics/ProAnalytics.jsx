import { useState, useMemo, useRef, useEffect } from 'react'
import {
  BarChart3, TrendingUp, Heart, MessageCircle, Eye, Bookmark, Share2,
  Calendar, Award, Users, Sparkles, Target, FileDown, Hash, Type,
  ChevronRight, ChevronDown, ChevronUp, Filter, ArrowRightLeft, Crown, Flame,
  Loader2, Plus, X, Search, SlidersHorizontal, RefreshCw, CalendarDays, Clock
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar
} from 'recharts'
import useStore from '../../store/useStore'

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return Math.round(n).toString()
}

function getEngagement(p) {
  const a = p.analytics || {}
  return (a.likes || 0) + (a.comments || 0) + (a.shares || 0) + (a.saves || 0)
}

function getEngRate(p, followers) {
  const a = p.analytics || {}
  const eng = (a.likes || 0) + (a.comments || 0)
  const denom = a.reach || followers
  if (!denom) return 0
  return (eng / denom) * 100
}

// Camel/brand colors
const COLORS = ['#c4a572', '#8b6f3c', '#d4b785', '#5a4a2e', '#e6d4a6']

// ── 1. Leaderboard (Top/Bottom) ────────────────────────────────────────────
function Leaderboard({ posted }) {
  const [metric, setMetric] = useState('likes')
  const [direction, setDirection] = useState('top') // top | bottom
  const [limit, setLimit] = useState(10)

  const METRICS = [
    { key: 'likes',    label: 'Likes',    icon: Heart },
    { key: 'comments', label: 'Comments', icon: MessageCircle },
    { key: 'views',    label: 'Views',    icon: Eye },
    { key: 'saves',    label: 'Saves',    icon: Bookmark },
    { key: 'reach',    label: 'Reach',    icon: TrendingUp },
    { key: 'engagement', label: 'Total Engagement', icon: Flame },
  ]

  const sorted = useMemo(() => {
    const arr = [...posted].sort((a, b) => {
      const av = metric === 'engagement' ? getEngagement(a) : (a.analytics?.[metric] || 0)
      const bv = metric === 'engagement' ? getEngagement(b) : (b.analytics?.[metric] || 0)
      return direction === 'top' ? bv - av : av - bv
    })
    return arr.slice(0, limit)
  }, [posted, metric, direction, limit])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-[13px] font-bold text-ink-700 flex items-center gap-1.5">
          <Crown size={13} className="text-camel-500" />
          {direction === 'top' ? 'Top' : 'Bottom'} {limit} by {metric === 'engagement' ? 'engagement' : metric}
        </p>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setDirection(direction === 'top' ? 'bottom' : 'top')}
            className="text-[10px] font-bold bg-ivory-100 text-ink-600 px-2.5 py-1 rounded-full active:bg-ivory-200">
            {direction === 'top' ? '⬇️ Bottom' : '⬆️ Top'}
          </button>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}
            className="text-[10px] font-bold bg-ivory-100 text-ink-600 px-2 py-1 rounded-full">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>
      </div>

      {/* Metric chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {METRICS.map((m) => {
          const Icon = m.icon
          const active = metric === m.key
          return (
            <button key={m.key} onClick={() => setMetric(m.key)}
              className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-full transition-colors
                ${active ? 'bg-camel-500 text-white' : 'bg-ivory-100 text-ink-500 active:bg-ivory-200'}`}>
              <Icon size={10} />
              {m.label}
            </button>
          )
        })}
      </div>

      {/* List */}
      <div className="space-y-1.5">
        {sorted.map((p, i) => {
          const val = metric === 'engagement' ? getEngagement(p) : (p.analytics?.[metric] || 0)
          const rank = direction === 'top' ? i + 1 : posted.length - i
          return (
            <div key={p.id} className="bg-white rounded-xl border border-ivory-200 p-2.5 flex items-center gap-2.5 shadow-soft">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                ${i === 0 && direction === 'top' ? 'bg-amber-400 text-white' :
                  i === 1 && direction === 'top' ? 'bg-ink-300 text-white' :
                  i === 2 && direction === 'top' ? 'bg-amber-700 text-white' :
                  'bg-ivory-100 text-ink-500'}`}>
                <span className="text-[11px] font-black">#{rank}</span>
              </div>
              {p.media_urls?.[0] && (
                <img src={p.media_urls[0]} className="w-10 h-10 rounded-lg object-cover bg-ivory-100 flex-shrink-0" alt="" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-ink-800 line-clamp-1">{p.title}</p>
                <p className="text-[10px] text-ink-400 uppercase">{p.content_type}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-black text-ink-900">{fmt(val)}</p>
                <p className="text-[9px] text-ink-400">{metric}</p>
              </div>
            </div>
          )
        })}
        {sorted.length === 0 && (
          <div className="text-center py-6 text-[12px] text-ink-400">No data yet</div>
        )}
      </div>
    </div>
  )
}

// ── 2. Posting Time Heatmap ─────────────────────────────────────────────────
function PostingTimeHeatmap({ posted }) {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const HOURS = Array.from({ length: 24 }, (_, i) => i)

  // Build day x hour engagement grid
  const grid = useMemo(() => {
    const g = Array.from({ length: 7 }, () => Array(24).fill({ count: 0, eng: 0 }))
    posted.forEach((p) => {
      const date = p.posting_date || p.posted_at
      if (!date) return
      const d = new Date(date)
      const day = d.getDay()
      const hour = d.getHours()
      const eng = getEngagement(p)
      g[day][hour] = { count: g[day][hour].count + 1, eng: g[day][hour].eng + eng }
    })
    return g
  }, [posted])

  // Find max for color scaling
  const maxEng = Math.max(...grid.flat().map((c) => c.eng), 1)

  // Best slot
  const best = useMemo(() => {
    let bestSlot = { day: 0, hour: 0, eng: 0 }
    grid.forEach((row, d) => row.forEach((cell, h) => {
      if (cell.eng > bestSlot.eng) bestSlot = { day: d, hour: h, eng: cell.eng }
    }))
    return bestSlot
  }, [grid])

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-bold text-ink-700 flex items-center gap-1.5">
        <Flame size={13} className="text-rose-500" />
        Posting Time Heatmap
      </p>

      {best.eng > 0 && (
        <div className="bg-gradient-to-r from-camel-500 to-camel-600 rounded-xl p-3 text-white">
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Best Slot</p>
          <p className="text-[14px] font-black mt-0.5">
            {DAYS[best.day]} · {best.hour}:00–{best.hour + 1}:00 · {fmt(best.eng)} engagements
          </p>
        </div>
      )}

      {/* Heatmap grid */}
      <div className="bg-white rounded-xl border border-ivory-200 p-3 overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[40px_repeat(24,1fr)] gap-0.5 text-[8px] font-bold text-ink-400">
            <div></div>
            {HOURS.map((h) => <div key={h} className="text-center">{h}</div>)}
          </div>
          {DAYS.map((day, dIdx) => (
            <div key={day} className="grid grid-cols-[40px_repeat(24,1fr)] gap-0.5 mt-0.5">
              <div className="text-[10px] font-bold text-ink-500 flex items-center">{day}</div>
              {HOURS.map((h) => {
                const cell = grid[dIdx][h]
                const intensity = cell.eng / maxEng
                return (
                  <div key={h}
                    className="aspect-square rounded-sm relative group cursor-default"
                    style={{
                      backgroundColor: intensity > 0
                        ? `rgba(196, 165, 114, ${0.15 + intensity * 0.85})`
                        : 'rgb(245, 240, 232)'
                    }}
                    title={cell.count > 0 ? `${day} ${h}:00 — ${cell.count} posts, ${fmt(cell.eng)} eng` : ''}>
                    {cell.count > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-ink-700">
                        {cell.count}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-ink-400 mt-2 italic">Numbers = post count. Color = engagement intensity.</p>
      </div>
    </div>
  )
}

// ── 3. Trend Charts ──────────────────────────────────────────────────────────
function TrendCharts({ posted }) {
  // Group by month-day
  const data = useMemo(() => {
    const byDate = {}
    posted.forEach((p) => {
      const date = p.posting_date || p.posted_at
      if (!date) return
      const key = date.split('T')[0]
      if (!byDate[key]) byDate[key] = { date: key, likes: 0, comments: 0, views: 0, reach: 0, posts: 0, followers: 0 }
      byDate[key].likes += p.analytics?.likes || 0
      byDate[key].comments += p.analytics?.comments || 0
      byDate[key].views += p.analytics?.views || 0
      byDate[key].reach += p.analytics?.reach || 0
      byDate[key].posts += 1
      byDate[key].followers += p.analytics?.followers_gained || 0
    })
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
  }, [posted])

  // Build cumulative followers
  const followersData = useMemo(() => {
    let cum = 0
    return data.map((d) => {
      cum += d.followers
      return { ...d, cumFollowers: cum }
    })
  }, [data])

  if (data.length < 2) {
    return (
      <div className="bg-ivory-50 border border-ivory-200 rounded-xl p-6 text-center">
        <p className="text-[13px] text-ink-500">Need at least 2 posted items with dates to show trends.</p>
      </div>
    )
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  return (
    <div className="space-y-4">
      {/* Engagement Trend */}
      <div>
        <p className="text-[13px] font-bold text-ink-700 mb-2 flex items-center gap-1.5">
          <TrendingUp size={13} className="text-camel-500" />
          Engagement Trend
        </p>
        <div className="bg-white rounded-xl border border-ivory-200 p-3 shadow-soft">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c4a572" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#c4a572" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 9, fill: '#a8a39a' }} />
              <YAxis tick={{ fontSize: 9, fill: '#a8a39a' }} tickFormatter={fmt} />
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <Tooltip
                labelFormatter={formatDate}
                contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e5e0d4' }}
              />
              <Area type="monotone" dataKey="likes" stroke="#c4a572" strokeWidth={2} fill="url(#engGrad)" name="Likes" />
              <Area type="monotone" dataKey="comments" stroke="#7aa37a" strokeWidth={2} fill="transparent" name="Comments" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Followers Growth */}
      <div>
        <p className="text-[13px] font-bold text-ink-700 mb-2 flex items-center gap-1.5">
          <Users size={13} className="text-moss-500" />
          Followers Growth (cumulative)
        </p>
        <div className="bg-white rounded-xl border border-ivory-200 p-3 shadow-soft">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={followersData}>
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 9, fill: '#a8a39a' }} />
              <YAxis tick={{ fontSize: 9, fill: '#a8a39a' }} tickFormatter={fmt} />
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <Tooltip labelFormatter={formatDate} contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e5e0d4' }} />
              <Line type="monotone" dataKey="cumFollowers" stroke="#7aa37a" strokeWidth={2.5} dot={{ r: 3 }} name="New Followers" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ── 4. Content Type Pie Chart ───────────────────────────────────────────────
function ContentTypePie({ posted }) {
  const data = useMemo(() => {
    const stats = {}
    posted.forEach((p) => {
      const t = p.content_type || 'other'
      if (!stats[t]) stats[t] = { name: t, count: 0, engagement: 0 }
      stats[t].count++
      stats[t].engagement += getEngagement(p)
    })
    return Object.values(stats).sort((a, b) => b.engagement - a.engagement)
  }, [posted])

  if (data.length === 0) return null

  return (
    <div>
      <p className="text-[13px] font-bold text-ink-700 mb-2 flex items-center gap-1.5">
        <BarChart3 size={13} className="text-camel-500" />
        Content Type Performance
      </p>
      <div className="bg-white rounded-xl border border-ivory-200 p-3 shadow-soft">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="engagement" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip
              formatter={(v) => fmt(v)}
              contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e5e0d4' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="font-semibold text-ink-700 capitalize">{d.name}</span>
              <span className="text-ink-400 ml-auto">{d.count}p · {fmt(d.engagement)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 5. Auto Patterns / AI Insights ──────────────────────────────────────────
function AutoPatterns({ posted, followers }) {
  const patterns = useMemo(() => {
    const out = []
    if (posted.length < 3) return out

    // Pattern 1: best content type by engagement rate
    const types = {}
    posted.forEach((p) => {
      const t = p.content_type
      if (!types[t]) types[t] = { count: 0, totalEng: 0, totalReach: 0 }
      types[t].count++
      types[t].totalEng += (p.analytics?.likes || 0) + (p.analytics?.comments || 0)
      types[t].totalReach += p.analytics?.reach || 0
    })
    const typeRates = Object.entries(types).map(([t, s]) => ({
      type: t, count: s.count, avgEng: s.totalEng / s.count,
      rate: s.totalReach > 0 ? (s.totalEng / s.totalReach * 100) : 0,
    })).filter((t) => t.count >= 2).sort((a, b) => b.avgEng - a.avgEng)
    if (typeRates.length >= 2) {
      const top = typeRates[0]
      const bot = typeRates[typeRates.length - 1]
      const ratio = top.avgEng / Math.max(bot.avgEng, 1)
      out.push({
        emoji: '🏆',
        title: `${top.type} performs ${ratio.toFixed(1)}x better than ${bot.type}`,
        desc: `Avg ${fmt(top.avgEng)} engagement on ${top.type}s vs ${fmt(bot.avgEng)} on ${bot.type}s.`,
      })
    }

    // Pattern 2: best day of week
    const byDay = Array(7).fill(0).map(() => ({ count: 0, eng: 0 }))
    posted.forEach((p) => {
      if (!p.posting_date) return
      const d = new Date(p.posting_date).getDay()
      byDay[d].count++
      byDay[d].eng += getEngagement(p)
    })
    const dayAvgs = byDay.map((b, i) => ({ day: i, avg: b.count > 0 ? b.eng / b.count : 0, count: b.count }))
      .filter((d) => d.count > 0)
      .sort((a, b) => b.avg - a.avg)
    if (dayAvgs.length >= 2) {
      const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      out.push({
        emoji: '📅',
        title: `${DAYS[dayAvgs[0].day]} posts get the most engagement`,
        desc: `Avg ${fmt(dayAvgs[0].avg)} engagement on ${DAYS[dayAvgs[0].day]}s.`,
      })
    }

    // Pattern 3: caption length vs saves
    const withSaves = posted.filter((p) => (p.analytics?.saves || 0) > 0 && p.caption)
    if (withSaves.length >= 3) {
      const longCaps = withSaves.filter((p) => (p.caption?.length || 0) > 200)
      const shortCaps = withSaves.filter((p) => (p.caption?.length || 0) <= 200)
      if (longCaps.length && shortCaps.length) {
        const longAvgSaves = longCaps.reduce((s, p) => s + (p.analytics?.saves || 0), 0) / longCaps.length
        const shortAvgSaves = shortCaps.reduce((s, p) => s + (p.analytics?.saves || 0), 0) / shortCaps.length
        if (longAvgSaves > shortAvgSaves * 1.3) {
          out.push({
            emoji: '📝',
            title: 'Longer captions drive more saves',
            desc: `Posts with 200+ char captions get ${(longAvgSaves / shortAvgSaves).toFixed(1)}x more saves.`,
          })
        } else if (shortAvgSaves > longAvgSaves * 1.3) {
          out.push({
            emoji: '✂️',
            title: 'Short captions perform better',
            desc: `Posts under 200 chars get ${(shortAvgSaves / longAvgSaves).toFixed(1)}x more saves.`,
          })
        }
      }
    }

    // Pattern 4: engagement trend
    if (posted.length >= 6) {
      const sorted = [...posted].filter((p) => p.posting_date).sort((a, b) => a.posting_date.localeCompare(b.posting_date))
      const half = Math.floor(sorted.length / 2)
      const recent = sorted.slice(half)
      const old = sorted.slice(0, half)
      const recentAvg = recent.reduce((s, p) => s + getEngagement(p), 0) / recent.length
      const oldAvg = old.reduce((s, p) => s + getEngagement(p), 0) / old.length
      if (recentAvg > oldAvg * 1.15) {
        out.push({
          emoji: '📈',
          title: 'Engagement is trending UP',
          desc: `Recent posts averaging ${fmt(recentAvg)} engagement, up from ${fmt(oldAvg)} earlier.`,
        })
      } else if (oldAvg > recentAvg * 1.15) {
        out.push({
          emoji: '📉',
          title: 'Engagement is dropping',
          desc: `Recent posts averaging ${fmt(recentAvg)} vs ${fmt(oldAvg)} earlier. Refresh your content style.`,
        })
      }
    }

    // Pattern 5: posting frequency
    if (posted.length >= 4) {
      const sorted = [...posted].filter((p) => p.posting_date).sort((a, b) => a.posting_date.localeCompare(b.posting_date))
      const days = (new Date(sorted[sorted.length - 1].posting_date) - new Date(sorted[0].posting_date)) / (1000 * 60 * 60 * 24)
      const freq = sorted.length / Math.max(days / 7, 1)
      if (freq < 2) {
        out.push({
          emoji: '⏰',
          title: 'Try posting more often',
          desc: `Currently ${freq.toFixed(1)} posts/week. Consistent posters see 50% more engagement.`,
        })
      }
    }

    return out
  }, [posted])

  if (patterns.length === 0) {
    return (
      <div className="bg-ivory-50 border border-ivory-200 rounded-xl p-6 text-center">
        <Sparkles size={20} className="text-ink-300 mx-auto mb-2" />
        <p className="text-[12px] text-ink-400">Need more posted content for AI patterns to emerge.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {patterns.map((p, i) => (
        <div key={i} className="bg-gradient-to-br from-white to-ivory-50 rounded-xl border border-camel-100 p-3 shadow-soft">
          <div className="flex items-start gap-2.5">
            <span className="text-xl flex-shrink-0">{p.emoji}</span>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-ink-900 leading-snug">{p.title}</p>
              <p className="text-[11px] text-ink-500 mt-1 leading-relaxed">{p.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── 6. Compare Posts ────────────────────────────────────────────────────────
function ComparePosts({ posted }) {
  const [aId, setAId] = useState('')
  const [bId, setBId] = useState('')

  const a = posted.find((p) => p.id === aId)
  const b = posted.find((p) => p.id === bId)

  const metrics = ['views', 'likes', 'comments', 'shares', 'saves', 'reach', 'impressions', 'profile_visits', 'followers_gained']
  const LABELS = {
    views: 'Views', likes: 'Likes', comments: 'Comments', shares: 'Shares', saves: 'Saves',
    reach: 'Reach', impressions: 'Impressions', profile_visits: 'Profile Visits', followers_gained: 'New Followers',
  }

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-bold text-ink-700 flex items-center gap-1.5">
        <ArrowRightLeft size={13} className="text-camel-500" />
        Compare 2 Posts
      </p>

      <div className="grid grid-cols-2 gap-2">
        {[{ val: aId, set: setAId, label: 'Post A' }, { val: bId, set: setBId, label: 'Post B' }].map((s, i) => (
          <select key={i} value={s.val} onChange={(e) => s.set(e.target.value)}
            className="w-full bg-white border border-ivory-300 rounded-xl px-3 py-2 text-[12px]
              text-ink-900 focus:outline-none focus:ring-2 focus:ring-camel-300">
            <option value="">Select {s.label}…</option>
            {posted.map((p) => (
              <option key={p.id} value={p.id}>{p.title?.slice(0, 40) || p.id}</option>
            ))}
          </select>
        ))}
      </div>

      {a && b && (
        <div className="bg-white rounded-xl border border-ivory-200 overflow-hidden shadow-soft">
          {/* Headers */}
          <div className="grid grid-cols-2 border-b border-ivory-200">
            {[a, b].map((p, i) => (
              <div key={i} className={`p-3 ${i === 0 ? 'border-r border-ivory-200' : ''}`}>
                {p.media_urls?.[0] && (
                  <img src={p.media_urls[0]} className="w-full aspect-square object-cover rounded-lg bg-ivory-100" alt="" />
                )}
                <p className="text-[11px] font-bold text-ink-800 mt-2 line-clamp-2">{p.title}</p>
                <p className="text-[9px] text-ink-400 uppercase">{p.content_type}</p>
              </div>
            ))}
          </div>

          {/* Metrics rows */}
          {metrics.map((m) => {
            const av = a.analytics?.[m] || 0
            const bv = b.analytics?.[m] || 0
            const winner = av === bv ? null : av > bv ? 'a' : 'b'
            return (
              <div key={m} className="grid grid-cols-2 border-b border-ivory-100 last:border-0">
                <div className={`p-2.5 text-center ${winner === 'a' ? 'bg-moss-50' : ''} ${winner === 'b' ? 'opacity-50' : ''}`}>
                  <p className="text-sm font-black text-ink-900">{fmt(av)}</p>
                  <p className="text-[9px] text-ink-400 uppercase">{LABELS[m]}</p>
                </div>
                <div className={`p-2.5 text-center border-l border-ivory-100 ${winner === 'b' ? 'bg-moss-50' : ''} ${winner === 'a' ? 'opacity-50' : ''}`}>
                  <p className="text-sm font-black text-ink-900">{fmt(bv)}</p>
                  <p className="text-[9px] text-ink-400 uppercase">{LABELS[m]}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {(!a || !b) && (
        <div className="bg-ivory-50 border border-ivory-200 rounded-xl p-4 text-center">
          <p className="text-[12px] text-ink-400">Pick 2 posts to compare side-by-side.</p>
        </div>
      )}
    </div>
  )
}

// ── 7. Custom Report Builder ────────────────────────────────────────────────
function CustomReportBuilder({ posted }) {
  const [filters, setFilters] = useState({
    type: 'all', dateFrom: '', dateTo: '', minMetric: '', minMetricValue: '', sortBy: 'likes', limit: 25,
  })

  const result = useMemo(() => {
    let arr = [...posted]
    if (filters.type !== 'all') arr = arr.filter((p) => p.content_type === filters.type)
    if (filters.dateFrom) arr = arr.filter((p) => (p.posting_date || '') >= filters.dateFrom)
    if (filters.dateTo) arr = arr.filter((p) => (p.posting_date || '') <= filters.dateTo)
    if (filters.minMetric && filters.minMetricValue) {
      const v = Number(filters.minMetricValue)
      arr = arr.filter((p) => (p.analytics?.[filters.minMetric] || 0) >= v)
    }
    arr.sort((a, b) => (b.analytics?.[filters.sortBy] || 0) - (a.analytics?.[filters.sortBy] || 0))
    return arr.slice(0, filters.limit)
  }, [posted, filters])

  // Totals
  const totals = useMemo(() => {
    return result.reduce((t, p) => {
      const a = p.analytics || {}
      return {
        likes: t.likes + (a.likes || 0),
        comments: t.comments + (a.comments || 0),
        views: t.views + (a.views || 0),
        reach: t.reach + (a.reach || 0),
        saves: t.saves + (a.saves || 0),
      }
    }, { likes: 0, comments: 0, views: 0, reach: 0, saves: 0 })
  }, [result])

  const TYPES = ['all', 'reel', 'post', 'carousel', 'story', 'collab', 'bts', 'educational', 'lifestyle']
  const METRICS = ['likes', 'comments', 'views', 'shares', 'saves', 'reach', 'impressions']

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-bold text-ink-700 flex items-center gap-1.5">
        <Filter size={13} className="text-camel-500" />
        Custom Report Builder
      </p>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-ivory-200 p-3 space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-ink-400 uppercase mb-1">Content Type</label>
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full bg-ivory-100 border border-ivory-200 rounded-lg px-2 py-1.5 text-[12px]">
              {TYPES.map((t) => <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-ink-400 uppercase mb-1">Sort by</label>
            <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full bg-ivory-100 border border-ivory-200 rounded-lg px-2 py-1.5 text-[12px]">
              {METRICS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-ink-400 uppercase mb-1">From</label>
            <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full bg-ivory-100 border border-ivory-200 rounded-lg px-2 py-1.5 text-[12px]" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-ink-400 uppercase mb-1">To</label>
            <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full bg-ivory-100 border border-ivory-200 rounded-lg px-2 py-1.5 text-[12px]" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-ink-400 uppercase mb-1">Min metric</label>
            <select value={filters.minMetric} onChange={(e) => setFilters({ ...filters, minMetric: e.target.value })}
              className="w-full bg-ivory-100 border border-ivory-200 rounded-lg px-2 py-1.5 text-[12px]">
              <option value="">none</option>
              {METRICS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-ink-400 uppercase mb-1">Value ≥</label>
            <input type="number" value={filters.minMetricValue} onChange={(e) => setFilters({ ...filters, minMetricValue: e.target.value })}
              placeholder="0"
              className="w-full bg-ivory-100 border border-ivory-200 rounded-lg px-2 py-1.5 text-[12px]" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-ink-400 uppercase mb-1">Limit</label>
            <input type="number" value={filters.limit} onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value) })}
              className="w-full bg-ivory-100 border border-ivory-200 rounded-lg px-2 py-1.5 text-[12px]" />
          </div>
        </div>
      </div>

      {/* Result summary */}
      <div className="bg-gradient-to-br from-ink-900 to-ink-800 rounded-xl p-3 text-white">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-white/70 uppercase">Result · {result.length} posts</p>
        </div>
        <div className="grid grid-cols-5 gap-2 mt-2">
          {['likes', 'comments', 'views', 'reach', 'saves'].map((m) => (
            <div key={m} className="text-center">
              <p className="text-sm font-black">{fmt(totals[m])}</p>
              <p className="text-[8px] text-white/60 uppercase">{m}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Results list */}
      <div className="space-y-1.5">
        {result.slice(0, 10).map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-ivory-200 p-2.5 flex items-center gap-2.5 shadow-soft">
            {p.media_urls?.[0] && (
              <img src={p.media_urls[0]} className="w-10 h-10 rounded-lg object-cover bg-ivory-100 flex-shrink-0" alt="" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-ink-800 line-clamp-1">{p.title}</p>
              <p className="text-[10px] text-ink-400">
                {p.posting_date && new Date(p.posting_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {p.content_type}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-black text-ink-900">{fmt(p.analytics?.[filters.sortBy] || 0)}</p>
              <p className="text-[9px] text-ink-400">{filters.sortBy}</p>
            </div>
          </div>
        ))}
        {result.length > 10 && (
          <p className="text-center text-[10px] text-ink-400 italic">+ {result.length - 10} more in summary above</p>
        )}
      </div>
    </div>
  )
}

// ── 8. Goals ─────────────────────────────────────────────────────────────────
const LOCAL_GOALS_KEY = 'brandrop_goals_v1'
function Goals({ posted, followers }) {
  const [goals, setGoals] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_GOALS_KEY) || '[]') } catch { return [] }
  })
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ metric: 'likes', target: '', deadline: '' })

  const saveGoals = (g) => {
    setGoals(g)
    localStorage.setItem(LOCAL_GOALS_KEY, JSON.stringify(g))
  }

  const addGoal = () => {
    if (!form.target) return
    saveGoals([...goals, { ...form, target: Number(form.target), id: Date.now() }])
    setForm({ metric: 'likes', target: '', deadline: '' })
    setAdding(false)
  }

  const deleteGoal = (id) => saveGoals(goals.filter((g) => g.id !== id))

  // Calculate progress for each goal
  const goalsWithProgress = goals.map((g) => {
    let current = 0
    if (g.metric === 'followers') current = followers
    else if (g.metric === 'posts') current = posted.length
    else current = posted.reduce((s, p) => s + (p.analytics?.[g.metric] || 0), 0)
    const pct = Math.min((current / g.target) * 100, 100)
    return { ...g, current, pct }
  })

  const METRICS = [
    { key: 'followers', label: 'Followers' },
    { key: 'likes', label: 'Total Likes' },
    { key: 'comments', label: 'Total Comments' },
    { key: 'views', label: 'Total Views' },
    { key: 'posts', label: 'Posts Count' },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold text-ink-700 flex items-center gap-1.5">
          <Target size={13} className="text-rose-500" />
          Goals
        </p>
        <button onClick={() => setAdding(true)}
          className="text-[10px] font-bold bg-camel-500 text-white px-2.5 py-1 rounded-full">
          + Add Goal
        </button>
      </div>

      {adding && (
        <div className="bg-white rounded-xl border border-camel-200 p-3 space-y-2">
          <select value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })}
            className="w-full bg-ivory-100 border border-ivory-200 rounded-lg px-2 py-1.5 text-[12px]">
            {METRICS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
          <input type="number" placeholder="Target (e.g. 10000)" value={form.target}
            onChange={(e) => setForm({ ...form, target: e.target.value })}
            className="w-full bg-ivory-100 border border-ivory-200 rounded-lg px-2 py-1.5 text-[12px]" />
          <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="w-full bg-ivory-100 border border-ivory-200 rounded-lg px-2 py-1.5 text-[12px]" />
          <div className="flex gap-2">
            <button onClick={addGoal}
              className="flex-1 bg-camel-500 text-white text-[11px] font-bold py-1.5 rounded-lg active:bg-camel-600">
              Save Goal
            </button>
            <button onClick={() => setAdding(false)}
              className="px-3 bg-ivory-100 text-ink-600 text-[11px] font-bold py-1.5 rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {goalsWithProgress.length === 0 && !adding && (
          <div className="bg-ivory-50 rounded-xl p-6 text-center">
            <p className="text-[12px] text-ink-400">Set your first goal — track progress to a specific target.</p>
          </div>
        )}
        {goalsWithProgress.map((g) => {
          const metricLabel = METRICS.find((m) => m.key === g.metric)?.label || g.metric
          const done = g.pct >= 100
          return (
            <div key={g.id} className={`bg-white rounded-xl border p-3 shadow-soft
              ${done ? 'border-moss-200 bg-moss-50' : 'border-ivory-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[12px] font-bold text-ink-800">{metricLabel}</p>
                  <p className="text-[10px] text-ink-400">
                    {fmt(g.current)} / {fmt(g.target)} {g.deadline && `· by ${new Date(g.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[14px] font-black ${done ? 'text-moss-600' : 'text-ink-900'}`}>
                    {g.pct.toFixed(0)}%
                  </span>
                  <button onClick={() => deleteGoal(g.id)}
                    className="text-ink-300 active:text-rose-500">
                    <X size={12} />
                  </button>
                </div>
              </div>
              <div className="h-1.5 bg-ivory-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-moss-500' : 'bg-gradient-to-r from-camel-400 to-camel-500'}`}
                  style={{ width: `${g.pct}%` }} />
              </div>
              {done && <p className="text-[10px] text-moss-600 font-bold mt-1">🎉 Goal achieved!</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 9. PDF Export ────────────────────────────────────────────────────────────
function ExportPDF({ reportRef, brandName }) {
  const [exporting, setExporting] = useState(false)

  const exportToPdf = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#faf8f3', useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth  = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth   = pageWidth - 20
      const imgHeight  = (canvas.height * imgWidth) / canvas.width
      let position = 10
      let heightLeft = imgHeight
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pageHeight - 20
      while (heightLeft > 0) {
        position = position - pageHeight + 20
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pageHeight - 20
      }
      pdf.save(`${brandName || 'analytics'}-report-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      alert('Export failed: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <button onClick={exportToPdf} disabled={exporting}
      className="flex items-center gap-1.5 bg-ink-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-full
        active:bg-ink-800 disabled:opacity-50 transition-colors">
      {exporting
        ? <><Loader2 size={11} className="animate-spin" /> Exporting…</>
        : <><FileDown size={11} /> Export PDF</>
      }
    </button>
  )
}

// ── Hashtag Analysis ────────────────────────────────────────────────────────
function HashtagAnalysis({ posted }) {
  const stats = useMemo(() => {
    const tags = {}
    posted.forEach((p) => {
      const caption = (p.caption || '') + ' ' + (p.hashtags || '')
      const found = caption.match(/#[a-zA-Z0-9_]+/g) || []
      const uniq = [...new Set(found.map((t) => t.toLowerCase()))]
      const eng = getEngagement(p)
      const reach = p.analytics?.reach || 0
      uniq.forEach((t) => {
        if (!tags[t]) tags[t] = { tag: t, count: 0, totalEng: 0, totalReach: 0, totalLikes: 0 }
        tags[t].count++
        tags[t].totalEng += eng
        tags[t].totalReach += reach
        tags[t].totalLikes += p.analytics?.likes || 0
      })
    })
    return Object.values(tags)
      .map((t) => ({ ...t, avgEng: t.totalEng / t.count, avgReach: t.totalReach / t.count }))
      .filter((t) => t.count >= 1)
      .sort((a, b) => b.avgEng - a.avgEng)
  }, [posted])

  if (stats.length === 0) {
    return (
      <div className="bg-ivory-50 border border-ivory-200 rounded-xl p-6 text-center">
        <Hash size={20} className="text-ink-300 mx-auto mb-2" />
        <p className="text-[12px] text-ink-400">No hashtags found in captions yet.</p>
      </div>
    )
  }

  const top = stats.slice(0, 15)
  const maxEng = Math.max(...top.map((t) => t.avgEng), 1)

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-bold text-ink-700 flex items-center gap-1.5">
        <Hash size={13} className="text-camel-500" />
        Hashtag Performance · Top {top.length} of {stats.length}
      </p>
      <p className="text-[10px] text-ink-400">Ranked by avg engagement per use. Min 1 use shown.</p>

      <div className="space-y-1.5">
        {top.map((t, i) => {
          const w = (t.avgEng / maxEng) * 100
          return (
            <div key={t.tag} className="bg-white rounded-xl border border-ivory-200 p-2.5 shadow-soft">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[9px] font-bold text-ink-400">#{i + 1}</span>
                  <span className="text-[12px] font-bold text-camel-600 truncate">{t.tag}</span>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="text-[10px] text-ink-400">{t.count}× used</span>
                  <span className="text-[12px] font-black text-ink-900">{fmt(t.avgEng)}</span>
                </div>
              </div>
              <div className="h-1 bg-ivory-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-camel-400 to-camel-500"
                  style={{ width: `${w}%` }} />
              </div>
              <p className="text-[9px] text-ink-400 mt-1">
                avg eng/post · reach avg: {fmt(t.avgReach)} · likes total: {fmt(t.totalLikes)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Day-of-Week breakdown ───────────────────────────────────────────────────
function DayOfWeekChart({ posted }) {
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const data = useMemo(() => {
    const byDay = DAYS.map((d) => ({ day: d.slice(0, 3), count: 0, totalEng: 0, totalReach: 0, totalLikes: 0 }))
    posted.forEach((p) => {
      const date = p.posting_date || p.posted_at
      if (!date) return
      const d = new Date(date).getDay()
      byDay[d].count++
      byDay[d].totalEng += getEngagement(p)
      byDay[d].totalReach += p.analytics?.reach || 0
      byDay[d].totalLikes += p.analytics?.likes || 0
    })
    return byDay.map((d) => ({
      ...d,
      avgEng: d.count > 0 ? Math.round(d.totalEng / d.count) : 0,
      avgReach: d.count > 0 ? Math.round(d.totalReach / d.count) : 0,
    }))
  }, [posted])

  const best = [...data].sort((a, b) => b.avgEng - a.avgEng)[0]

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-bold text-ink-700 flex items-center gap-1.5">
        <CalendarDays size={13} className="text-camel-500" />
        Engagement by Day of Week
      </p>

      {best && best.count > 0 && (
        <div className="bg-gradient-to-r from-moss-500 to-moss-600 rounded-xl p-3 text-white">
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Best Day</p>
          <p className="text-[14px] font-black mt-0.5">
            {DAYS[data.findIndex((d) => d.day === best.day)]} · avg {fmt(best.avgEng)} engagement
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-ivory-200 p-3 shadow-soft">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b6359' }} />
            <YAxis tick={{ fontSize: 9, fill: '#a8a39a' }} tickFormatter={fmt} />
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e5e0d4' }} />
            <Bar dataKey="avgEng" fill="#c4a572" radius={[6, 6, 0, 0]} name="Avg Engagement" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {data.map((d) => (
          <div key={d.day} className="bg-white rounded-lg border border-ivory-200 p-2 text-center">
            <p className="text-[10px] font-bold text-ink-500">{d.day}</p>
            <p className="text-[14px] font-black text-ink-900 leading-tight mt-1">{d.count}</p>
            <p className="text-[8px] text-ink-400">posts</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Caption Length Analysis ─────────────────────────────────────────────────
function CaptionAnalysis({ posted }) {
  const buckets = useMemo(() => {
    const b = [
      { label: '<50 chars',    min: 0,    max: 50,    posts: [], count: 0, eng: 0, saves: 0 },
      { label: '50-150',       min: 50,   max: 150,   posts: [], count: 0, eng: 0, saves: 0 },
      { label: '150-300',      min: 150,  max: 300,   posts: [], count: 0, eng: 0, saves: 0 },
      { label: '300-500',      min: 300,  max: 500,   posts: [], count: 0, eng: 0, saves: 0 },
      { label: '500+',         min: 500,  max: Infinity, posts: [], count: 0, eng: 0, saves: 0 },
    ]
    posted.forEach((p) => {
      const len = (p.caption || '').length
      const bucket = b.find((x) => len >= x.min && len < x.max)
      if (bucket) {
        bucket.count++
        bucket.eng += getEngagement(p)
        bucket.saves += p.analytics?.saves || 0
      }
    })
    return b.map((x) => ({
      ...x,
      avgEng: x.count > 0 ? Math.round(x.eng / x.count) : 0,
      avgSaves: x.count > 0 ? Math.round(x.saves / x.count) : 0,
    }))
  }, [posted])

  const best = [...buckets].filter((b) => b.count > 0).sort((a, b) => b.avgEng - a.avgEng)[0]

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-bold text-ink-700 flex items-center gap-1.5">
        <Type size={13} className="text-camel-500" />
        Caption Length Performance
      </p>

      {best && (
        <div className="bg-gradient-to-r from-camel-500 to-camel-600 rounded-xl p-3 text-white">
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Sweet Spot</p>
          <p className="text-[14px] font-black mt-0.5">
            {best.label} · avg {fmt(best.avgEng)} engagement
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-ivory-200 p-3 shadow-soft">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={buckets}>
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#6b6359' }} />
            <YAxis tick={{ fontSize: 9, fill: '#a8a39a' }} tickFormatter={fmt} />
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e5e0d4' }} />
            <Bar dataKey="avgEng" fill="#8b6f3c" radius={[6, 6, 0, 0]} name="Avg Engagement" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {buckets.map((b) => (
          <div key={b.label} className="bg-white rounded-lg border border-ivory-200 p-2 text-center">
            <p className="text-[9px] font-bold text-ink-400">{b.label}</p>
            <p className="text-[14px] font-black text-ink-900 mt-1">{b.count}</p>
            <p className="text-[8px] text-ink-400">posts</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Period Comparison ───────────────────────────────────────────────────────
function PeriodComparison({ posted }) {
  const [period, setPeriod] = useState('30')   // 7 | 30 | 90 | days

  const { current, prev } = useMemo(() => {
    const days = Number(period)
    const now = Date.now()
    const curStart = now - days * 86400 * 1000
    const prevStart = now - 2 * days * 86400 * 1000
    const curr = posted.filter((p) => {
      const t = new Date(p.posting_date || p.posted_at).getTime()
      return t >= curStart && t <= now
    })
    const previous = posted.filter((p) => {
      const t = new Date(p.posting_date || p.posted_at).getTime()
      return t >= prevStart && t < curStart
    })
    return { current: curr, prev: previous }
  }, [posted, period])

  const sum = (arr, key) => arr.reduce((s, p) => s + (p.analytics?.[key] || 0), 0)

  const metrics = [
    { key: 'likes', label: 'Likes' },
    { key: 'comments', label: 'Comments' },
    { key: 'views', label: 'Views' },
    { key: 'reach', label: 'Reach' },
    { key: 'saves', label: 'Saves' },
    { key: 'shares', label: 'Shares' },
  ]

  const compare = metrics.map((m) => {
    const c = sum(current, m.key)
    const p = sum(prev, m.key)
    const change = p > 0 ? ((c - p) / p) * 100 : (c > 0 ? 100 : 0)
    return { ...m, cur: c, prev: p, change }
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold text-ink-700 flex items-center gap-1.5">
          <ArrowRightLeft size={13} className="text-camel-500" />
          Period Comparison
        </p>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="text-[10px] font-bold bg-ivory-100 text-ink-600 px-2.5 py-1 rounded-full border-0">
          <option value="7">Last 7 days vs prior 7</option>
          <option value="30">Last 30 vs prior 30</option>
          <option value="90">Last 90 vs prior 90</option>
        </select>
      </div>

      <div className="bg-ivory-100 rounded-xl p-3 grid grid-cols-2 gap-3 text-center">
        <div>
          <p className="text-[10px] font-bold text-ink-400 uppercase">Current</p>
          <p className="text-2xl font-black text-ink-900">{current.length}</p>
          <p className="text-[10px] text-ink-400">posts</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-ink-400 uppercase">Previous</p>
          <p className="text-2xl font-black text-ink-500">{prev.length}</p>
          <p className="text-[10px] text-ink-400">posts</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {compare.map((m) => {
          const up = m.change > 0
          const down = m.change < 0
          return (
            <div key={m.key} className="bg-white rounded-xl border border-ivory-200 p-3 shadow-soft">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[12px] font-bold text-ink-700">{m.label}</p>
                <span className={`text-[11px] font-black px-2 py-0.5 rounded-full
                  ${up ? 'bg-moss-100 text-moss-700' : down ? 'bg-rose-100 text-rose-700' : 'bg-ivory-100 text-ink-500'}`}>
                  {up ? '↑' : down ? '↓' : '–'} {Math.abs(m.change).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-lg font-black text-ink-900 leading-none">{fmt(m.cur)}</p>
                  <p className="text-[9px] text-ink-400">current</p>
                </div>
                <p className="text-[10px] text-ink-300 mb-0.5">vs</p>
                <div>
                  <p className="text-base font-bold text-ink-500 leading-none">{fmt(m.prev)}</p>
                  <p className="text-[9px] text-ink-400">previous</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Advanced Filter Panel ───────────────────────────────────────────────────
const DATE_PRESETS = [
  { label: 'All',    days: null },
  { label: 'Last 7d', days: 7 },
  { label: '30d',     days: 30 },
  { label: '90d',     days: 90 },
  { label: '1y',      days: 365 },
]

function FilterPanel({ filters, setFilters, posted }) {
  const [expanded, setExpanded] = useState(false)

  const allTypes = [...new Set(posted.map((p) => p.content_type).filter(Boolean))]
  const toggleType = (t) => {
    const types = filters.types || []
    setFilters({ ...filters, types: types.includes(t) ? types.filter((x) => x !== t) : [...types, t] })
  }
  const reset = () => setFilters({ days: null, types: [], keyword: '', minLikes: '', minReach: '', sortBy: 'date' })
  const active = (filters.days !== null) ||
                 (filters.types?.length > 0) ||
                 filters.keyword || filters.minLikes || filters.minReach

  return (
    <div className="bg-white border border-ivory-200 rounded-2xl shadow-soft overflow-hidden">
      <button onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-camel-500" />
          <p className="text-[12px] font-bold text-ink-700">Filters</p>
          {active && (
            <span className="text-[9px] font-bold bg-camel-100 text-camel-700 px-1.5 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={14} className="text-ink-400" /> : <ChevronDown size={14} className="text-ink-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-ivory-100">
          {/* Date presets */}
          <div className="pt-2">
            <p className="text-[9px] font-bold text-ink-400 uppercase mb-1.5">Time Range</p>
            <div className="flex gap-1.5">
              {DATE_PRESETS.map((d) => (
                <button key={d.label}
                  onClick={() => setFilters({ ...filters, days: d.days })}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full
                    ${filters.days === d.days ? 'bg-ink-900 text-white' : 'bg-ivory-100 text-ink-500 active:bg-ivory-200'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content types */}
          {allTypes.length > 0 && (
            <div>
              <p className="text-[9px] font-bold text-ink-400 uppercase mb-1.5">Content Types</p>
              <div className="flex flex-wrap gap-1.5">
                {allTypes.map((t) => {
                  const on = filters.types?.includes(t)
                  return (
                    <button key={t} onClick={() => toggleType(t)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors
                        ${on ? 'bg-camel-500 text-white' : 'bg-ivory-100 text-ink-500 active:bg-ivory-200'}`}>
                      {on ? '✓ ' : ''}{t}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Search + min thresholds */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3">
              <p className="text-[9px] font-bold text-ink-400 uppercase mb-1">Caption / Hashtag Search</p>
              <div className="relative">
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input value={filters.keyword || ''}
                  onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                  placeholder="diwali, #fashion, indirookh…"
                  className="w-full bg-ivory-100 border border-ivory-200 rounded-lg pl-7 pr-2 py-1.5 text-[11px]
                    focus:outline-none focus:ring-1 focus:ring-camel-400" />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold text-ink-400 uppercase mb-1">Min Likes</p>
              <input type="number" value={filters.minLikes || ''}
                onChange={(e) => setFilters({ ...filters, minLikes: e.target.value })}
                placeholder="0"
                className="w-full bg-ivory-100 border border-ivory-200 rounded-lg px-2 py-1.5 text-[11px]" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-ink-400 uppercase mb-1">Min Reach</p>
              <input type="number" value={filters.minReach || ''}
                onChange={(e) => setFilters({ ...filters, minReach: e.target.value })}
                placeholder="0"
                className="w-full bg-ivory-100 border border-ivory-200 rounded-lg px-2 py-1.5 text-[11px]" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-ink-400 uppercase mb-1">Sort By</p>
              <select value={filters.sortBy || 'date'} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full bg-ivory-100 border border-ivory-200 rounded-lg px-2 py-1.5 text-[11px]">
                <option value="date">Newest</option>
                <option value="likes">Most Likes</option>
                <option value="comments">Most Comments</option>
                <option value="reach">Most Reach</option>
                <option value="engagement">Total Engagement</option>
              </select>
            </div>
          </div>

          {/* Reset */}
          {active && (
            <button onClick={reset}
              className="text-[10px] font-bold text-rose-500 active:text-rose-600 flex items-center gap-1">
              <X size={10} /> Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function applyFilters(posted, filters) {
  let arr = [...posted]
  if (filters.days) {
    const cutoff = Date.now() - filters.days * 86400 * 1000
    arr = arr.filter((p) => {
      const t = new Date(p.posting_date || p.posted_at).getTime()
      return t >= cutoff
    })
  }
  if (filters.types?.length > 0) {
    arr = arr.filter((p) => filters.types.includes(p.content_type))
  }
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase()
    arr = arr.filter((p) => {
      return (p.caption || '').toLowerCase().includes(kw) ||
             (p.title || '').toLowerCase().includes(kw) ||
             (p.hashtags || '').toLowerCase().includes(kw)
    })
  }
  if (filters.minLikes) {
    arr = arr.filter((p) => (p.analytics?.likes || 0) >= Number(filters.minLikes))
  }
  if (filters.minReach) {
    arr = arr.filter((p) => (p.analytics?.reach || 0) >= Number(filters.minReach))
  }
  // Sort
  const sortBy = filters.sortBy || 'date'
  if (sortBy === 'date') {
    arr.sort((a, b) => new Date(b.posting_date || b.posted_at) - new Date(a.posting_date || a.posted_at))
  } else if (sortBy === 'engagement') {
    arr.sort((a, b) => getEngagement(b) - getEngagement(a))
  } else {
    arr.sort((a, b) => (b.analytics?.[sortBy] || 0) - (a.analytics?.[sortBy] || 0))
  }
  return arr
}

// ── Main Pro Analytics Component ────────────────────────────────────────────
const SECTIONS = [
  { id: 'patterns',    label: 'AI Insights',    icon: Sparkles },
  { id: 'leaderboard', label: 'Leaderboard',    icon: Crown },
  { id: 'trends',      label: 'Trends',         icon: TrendingUp },
  { id: 'compare-period', label: 'Period Compare', icon: ArrowRightLeft },
  { id: 'types',       label: 'Content Mix',    icon: BarChart3 },
  { id: 'heatmap',     label: 'Time Heatmap',   icon: Flame },
  { id: 'dow',         label: 'Day of Week',    icon: CalendarDays },
  { id: 'hashtags',    label: 'Hashtags',       icon: Hash },
  { id: 'captions',    label: 'Caption Length', icon: Type },
  { id: 'compare',     label: 'Compare Posts',  icon: ArrowRightLeft },
  { id: 'custom',      label: 'Custom Report',  icon: Filter },
  { id: 'goals',       label: 'Goals',          icon: Target },
]

// Map Instagram live media (with insights) to content_item shape
function normalizeIgMedia(media) {
  const typeMap = { 'VIDEO': 'reel', 'IMAGE': 'post', 'CAROUSEL_ALBUM': 'carousel' }
  return media.map((m) => {
    const ins = m.insights || {}
    const isReel = m.media_type === 'VIDEO' || m.media_product_type === 'REELS'
    return {
      id:            'ig_' + m.id,
      title:         (m.caption || '').slice(0, 60) || `${typeMap[m.media_type] || 'post'} · ${(m.timestamp || '').split('T')[0]}`,
      caption:       m.caption || '',
      content_type:  isReel ? 'reel' : (typeMap[m.media_type] || 'post'),
      status:        'posted',
      posting_date:  (m.timestamp || '').split('T')[0],
      posted_at:     m.timestamp,
      media_urls:    [m.media_type === 'VIDEO' ? (m.thumbnail_url || m.media_url) : m.media_url].filter(Boolean),
      permalink:     m.permalink,
      analytics: {
        likes:    ins.likes    ?? m.like_count     ?? 0,
        comments: ins.comments ?? m.comments_count ?? 0,
        views:    ins.plays    ?? 0,
        saves:    ins.saved    ?? 0,
        shares:   ins.shares   ?? 0,
        reach:    ins.reach    ?? 0,
        impressions:      ins.reach ?? 0,   // v21 deprecated 'impressions' field
        total_interactions: ins.total_interactions ?? 0,
        profile_visits:   0,
        followers_gained: 0,
      },
      _source: 'instagram_live',
    }
  })
}

export default function ProAnalytics() {
  const { contentItems, activeProjectId, instagramAccount, userProfile, igMedia } = useStore()
  const [section, setSection] = useState('patterns')
  const [sourceFilter, setSourceFilter] = useState('all')   // all | manual | live
  const reportRef = useRef()

  // Manual posted content
  const manualPosted = contentItems.filter((c) =>
    c.platform === 'instagram' &&
    c.project_id === activeProjectId &&
    (c.status === 'posted' || c.status === 'analyzed')
  ).map((c) => ({ ...c, _source: 'manual' }))

  // Live Instagram data (normalized)
  const livePosted = normalizeIgMedia(igMedia || [])

  // Combine based on filter
  const posted = useMemo(() => {
    if (sourceFilter === 'manual') return manualPosted
    if (sourceFilter === 'live')   return livePosted
    return [...manualPosted, ...livePosted]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFilter, manualPosted.length, livePosted.length])

  const followers = instagramAccount?.followers_count || 0
  const brandName = userProfile?.workspace_name || userProfile?.username || 'analytics'
  const hasBoth   = manualPosted.length > 0 && livePosted.length > 0

  // Global filter state — applies to all sections
  const [filters, setFilters] = useState({
    days: null, types: [], keyword: '', minLikes: '', minReach: '', sortBy: 'date'
  })

  // Apply filters to posted data
  const filtered = useMemo(() => applyFilters(posted, filters), [posted, filters])

  // Auto-fetch Instagram media if connected but not loaded yet
  useEffect(() => {
    if (instagramAccount?.access_token && (igMedia?.length || 0) === 0) {
      useStore.getState().syncInstagramData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instagramAccount?.access_token])

  // Show empty state if no data at all
  if (posted.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-ink-900 to-ink-700 rounded-3xl p-6 text-white text-center">
          <Sparkles size={28} className="text-camel-300 mx-auto mb-3" />
          <p className="text-[16px] font-black mb-1">Pro Analytics is empty</p>
          <p className="text-[12px] text-white/70 mb-4 leading-relaxed">
            {instagramAccount?.access_token
              ? 'Instagram is connected but no posts loaded yet. Try syncing.'
              : 'Connect Instagram or add past posts manually to see advanced reports.'}
          </p>
          {instagramAccount?.access_token ? (
            <button onClick={() => useStore.getState().syncInstagramData()}
              className="bg-white/15 active:bg-white/25 text-white text-[12px] font-bold px-4 py-2 rounded-xl">
              🔄 Sync Instagram Data
            </button>
          ) : (
            <p className="text-[11px] text-white/50">
              Go to Content → Instagram → "Add Past Post / Reel" to backfill
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with export + sync */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-ink-900 to-ink-700 flex items-center justify-center flex-shrink-0">
            <Sparkles size={13} className="text-camel-300" />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-black text-ink-900 leading-none">Pro Analytics</p>
            <p className="text-[10px] text-ink-400 truncate">
              {filtered.length}/{posted.length} posts · {livePosted.length} IG · {manualPosted.length} manual
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {instagramAccount?.access_token && (
            <button onClick={() => useStore.getState().syncInstagramData()}
              disabled={useStore.getState().igLoading}
              className="flex items-center gap-1 bg-ivory-100 text-ink-600 text-[10px] font-bold px-2.5 py-1.5 rounded-full
                active:bg-ivory-200 disabled:opacity-50">
              <RefreshCw size={10} className={useStore.getState().igLoading ? 'animate-spin' : ''} />
              Sync
            </button>
          )}
          <ExportPDF reportRef={reportRef} brandName={brandName} />
        </div>
      </div>

      {/* Source filter — only show when both sources have data */}
      {hasBoth && (
        <div className="bg-ivory-100 rounded-xl p-1 flex gap-1 text-[11px] font-bold">
          <button onClick={() => setSourceFilter('all')}
            className={`flex-1 py-1.5 rounded-lg transition-all
              ${sourceFilter === 'all' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'}`}>
            All · {manualPosted.length + livePosted.length}
          </button>
          <button onClick={() => setSourceFilter('live')}
            className={`flex-1 py-1.5 rounded-lg transition-all
              ${sourceFilter === 'live' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'}`}>
            IG Live · {livePosted.length}
          </button>
          <button onClick={() => setSourceFilter('manual')}
            className={`flex-1 py-1.5 rounded-lg transition-all
              ${sourceFilter === 'manual' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'}`}>
            Manual · {manualPosted.length}
          </button>
        </div>
      )}

      {/* Section tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
        {SECTIONS.map((s) => {
          const Icon = s.icon
          const active = section === s.id
          return (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl transition-colors
                ${active ? 'bg-ink-900 text-white shadow-sm' : 'bg-ivory-100 text-ink-500 active:bg-ivory-200'}`}>
              <Icon size={11} />
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Global filter panel */}
      <FilterPanel filters={filters} setFilters={setFilters} posted={posted} />

      {/* Content (wrapped for PDF capture) */}
      <div ref={reportRef} className="bg-ivory-50 rounded-2xl p-3 space-y-3">
        {section === 'patterns'       && <AutoPatterns        posted={filtered} followers={followers} />}
        {section === 'leaderboard'    && <Leaderboard         posted={filtered} />}
        {section === 'trends'         && <TrendCharts         posted={filtered} />}
        {section === 'compare-period' && <PeriodComparison    posted={posted} />}
        {section === 'types'          && <ContentTypePie      posted={filtered} />}
        {section === 'heatmap'        && <PostingTimeHeatmap  posted={filtered} />}
        {section === 'dow'            && <DayOfWeekChart      posted={filtered} />}
        {section === 'hashtags'       && <HashtagAnalysis     posted={filtered} />}
        {section === 'captions'       && <CaptionAnalysis     posted={filtered} />}
        {section === 'compare'        && <ComparePosts        posted={filtered} />}
        {section === 'custom'         && <CustomReportBuilder posted={filtered} />}
        {section === 'goals'          && <Goals               posted={posted} followers={followers} />}
      </div>
    </div>
  )
}
