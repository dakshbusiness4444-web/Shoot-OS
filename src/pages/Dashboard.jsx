import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Layout, Clock, Plus, Package, BookImage, Clapperboard, Star } from 'lucide-react'
import useStore from '../store/useStore'
import { Card, ProgressBar, CreatorTag, StatusBadge, SearchBar } from '../components/ui'
import { CATEGORY_LABELS } from '../data/seedData'

function RecentItem({ shot }) {
  const { products } = useStore()
  const product = products.find((p) => p.id === shot.product_id)
  return (
    <div className="flex items-start gap-3 py-3 border-b border-ivory-200 last:border-0">
      <StatusBadge status={shot.status} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-800 truncate">{shot.title}</p>
        {product && <p className="text-xs text-ink-400 mt-0.5">{product.name}</p>}
      </div>
      <CreatorTag creator={shot.creator} />
    </div>
  )
}

function QuickNav({ icon: Icon, label, to, color }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(to)}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-ivory-50 border border-ivory-200 active:bg-ivory-200 transition-colors"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <span className="text-[11px] font-medium text-ink-700 text-center leading-tight">{label}</span>
    </button>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentUser, shots, products, activeProjectId, projects } = useStore()
  const [search, setSearch] = useState('')

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0]

  const productShots = shots.filter((s) => s.shot_type === 'product')
  const done = productShots.filter((s) => s.status === 'done').length
  const total = productShots.length

  const recent = [...shots]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  const searchResults = search.length > 1
    ? shots.filter(
        (s) =>
          s.title?.toLowerCase().includes(search.toLowerCase()) ||
          s.description?.toLowerCase().includes(search.toLowerCase()) ||
          s.notes?.toLowerCase().includes(search.toLowerCase())
      )
    : []

  const productCount = products.filter((p) => p.project_id === activeProjectId).length

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-sm text-ink-400">Good to see you,</p>
        <h1 className="font-display text-2xl font-medium text-ink-900">
          {currentUser?.displayName}
        </h1>
      </div>

      {/* Active project */}
      {activeProject && (
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-ink-400 mb-0.5">Active Project</p>
              <h2 className="font-display text-base font-medium text-ink-900">{activeProject.name}</h2>
              {activeProject.description && (
                <p className="text-xs text-ink-400 mt-0.5">{activeProject.description}</p>
              )}
            </div>
            <span className="text-xs bg-moss-100 text-moss-500 px-2.5 py-1 rounded-full font-medium">
              Active
            </span>
          </div>
          <ProgressBar done={done} total={total} />
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-ink-400">{productCount} products</span>
            <span className="text-ink-200">·</span>
            <span className="text-xs text-ink-400">{total} shots planned</span>
          </div>
        </Card>
      )}

      {/* Primary CTA buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/shoot')}
          className="relative overflow-hidden bg-ink-900 text-ivory-100 rounded-2xl p-5 text-left
            active:bg-ink-800 transition-colors"
        >
          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
          <Camera size={20} className="mb-3 opacity-80" />
          <p className="text-sm font-medium leading-tight">Enter Shoot Mode</p>
          <p className="text-xs opacity-50 mt-0.5">{total - done} shots left</p>
        </button>

        <button
          onClick={() => navigate('/plan')}
          className="relative overflow-hidden bg-camel-300 text-white rounded-2xl p-5 text-left
            active:bg-camel-400 transition-colors"
        >
          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
          <Layout size={20} className="mb-3 opacity-80" />
          <p className="text-sm font-medium leading-tight">Continue Planning</p>
          <p className="text-xs opacity-60 mt-0.5">Add shots & ideas</p>
        </button>
      </div>

      {/* Search */}
      <div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search shots, products, notes…" />
        {search.length > 1 && (
          <Card className="mt-2 divide-y divide-ivory-200">
            {searchResults.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-6">No results for "{search}"</p>
            ) : (
              searchResults.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSearch(''); navigate('/shoot') }}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 active:bg-ivory-200"
                >
                  <StatusBadge status={s.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{s.title}</p>
                    {s.description && (
                      <p className="text-xs text-ink-400 truncate mt-0.5">{s.description}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </Card>
        )}
      </div>

      {/* Quick nav */}
      <div>
        <p className="text-xs text-ink-400 uppercase tracking-widest mb-3">Quick Access</p>
        <div className="grid grid-cols-4 gap-2">
          <QuickNav icon={Package} label="Products" to="/products" color="bg-camel-100 text-camel-500" />
          <QuickNav icon={BookImage} label="References" to="/references" color="bg-sand-100 text-earth-400" />
          <QuickNav icon={Clapperboard} label="BTS" to="/bts" color="bg-moss-100 text-moss-500" />
          <QuickNav icon={Star} label="Extras" to="/extra" color="bg-ivory-200 text-ink-600" />
        </div>
      </div>

      {/* Recent activity */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-ink-400" />
            <p className="text-xs text-ink-400 uppercase tracking-widest">Recent</p>
          </div>
          <Card className="divide-y divide-ivory-200 px-4">
            {recent.map((s) => (
              <RecentItem key={s.id} shot={s} />
            ))}
          </Card>
        </div>
      )}

      {/* No shots yet CTA */}
      {total === 0 && (
        <Card className="p-6 text-center">
          <p className="font-display text-base font-medium text-ink-700 mb-1">No shots planned yet</p>
          <p className="text-sm text-ink-400 mb-4">Start by adding shots in Planning Mode</p>
          <button
            onClick={() => navigate('/plan')}
            className="btn-primary"
          >
            <Plus size={16} />
            Start Planning
          </button>
        </Card>
      )}
    </div>
  )
}
