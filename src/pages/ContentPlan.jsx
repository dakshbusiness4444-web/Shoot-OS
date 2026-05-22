import { useState } from 'react'
import { Instagram, Calendar, Zap, Layers, Send } from 'lucide-react'
import InstagramPlan from './plan/InstagramPlan'
import PinterestPlan from './plan/PinterestPlan'
import InstagramCompose from '../components/ui/InstagramCompose'
import useStore from '../store/useStore'

const TABS = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'pinterest', label: 'Pinterest',  icon: '📌' },
  { id: 'calendar',  label: 'Calendar',   icon: '📅', soon: true },
  { id: 'campaigns', label: 'Campaigns',  icon: '🎯', soon: true },
]

function ComingSoon({ label }) {
  return (
    <div className="py-20 text-center">
      <div className="w-16 h-16 bg-ivory-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Zap size={24} className="text-ink-300" />
      </div>
      <p className="text-[15px] font-bold text-ink-700 mb-1">{label} — Coming Soon</p>
      <p className="text-sm text-ink-400">This module is being built next.</p>
    </div>
  )
}

export default function ContentPlan() {
  const [activeTab,    setActiveTab]    = useState('instagram')
  const [composeOpen,  setComposeOpen]  = useState(false)
  const { contentItems, activeProjectId, instagramAccount } = useStore()

  const igCount  = contentItems.filter((c) => c.platform === 'instagram' && c.project_id === activeProjectId).length
  const pinCount = contentItems.filter((c) => c.platform === 'pinterest'  && c.project_id === activeProjectId).length

  const counts = { instagram: igCount, pinterest: pinCount }

  return (
    <>
    <InstagramCompose open={composeOpen} onClose={() => setComposeOpen(false)} />

    <div className="space-y-0 -mx-4">
      {/* Tab bar */}
      <div className="flex border-b border-ivory-200 bg-white sticky top-14 z-10 px-4 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const active  = activeTab === tab.id
          const count   = counts[tab.id]
          return (
            <button
              key={tab.id}
              onClick={() => !tab.soon && setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3.5 text-[13px] font-bold whitespace-nowrap
                border-b-2 transition-colors flex-shrink-0
                ${active
                  ? 'border-camel-500 text-camel-600'
                  : 'border-transparent text-ink-400'
                }
                ${tab.soon ? 'opacity-40' : ''}`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center
                  ${active ? 'bg-camel-100 text-camel-600' : 'bg-ivory-200 text-ink-500'}`}>
                  {count}
                </span>
              )}
              {tab.soon && (
                <span className="text-[9px] font-semibold bg-ivory-200 text-ink-400 px-1.5 py-0.5 rounded-full">
                  Soon
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="px-4 pt-5">
        {activeTab === 'instagram' && (
          <>
            {/* Quick-publish bar (only when Instagram is connected) */}
            {instagramAccount?.instagram_user_id && (
              <button onClick={() => setComposeOpen(true)}
                className="w-full mb-4 flex items-center gap-2.5 px-4 py-3 rounded-2xl
                  bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white
                  shadow-lifted active:opacity-90 transition-all">
                <Send size={15} />
                <span className="text-[13px] font-bold">New Post · Compose &amp; Publish</span>
                <span className="ml-auto text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                  @{instagramAccount.username}
                </span>
              </button>
            )}
            <InstagramPlan />
          </>
        )}
        {activeTab === 'pinterest' && <PinterestPlan />}
        {activeTab === 'calendar'  && <ComingSoon label="Content Calendar" />}
        {activeTab === 'campaigns' && <ComingSoon label="Campaigns" />}
      </div>
    </div>
    </>
  )
}
