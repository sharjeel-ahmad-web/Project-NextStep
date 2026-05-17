import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, TrendingUp, Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { gamificationAPI } from '../services/api'
import { EmptyState, LoadingScreen, PageContainer, PageIntro } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const LeaderboardPage = () => {
  useDocumentMeta({
    title: 'Leaderboard | NextStep AI',
    description: 'Compare XP, level, and rank with other learners on the platform.',
    robots: 'noindex, follow',
  })

  const { user } = useAuthStore()
  const [leaderboard, setLeaderboard] = useState([])
  const [timeframe, setTimeframe] = useState('all_time')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [timeframe])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const { data } = await gamificationAPI.getLeaderboard({ timeframe })
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankStyle = (rank) => {
    if (rank === 1) return { icon: <Crown size={24} className="text-[#fbbf24]" />, bg: 'bg-[#fbbf24]/10', border: 'border-[#fbbf24]/30', text: 'text-[#fbbf24]' }
    if (rank === 2) return { icon: <Medal size={24} className="text-[#94a3b8]" />, bg: 'bg-[#94a3b8]/10', border: 'border-[#94a3b8]/30', text: 'text-[#94a3b8]' }
    if (rank === 3) return { icon: <Medal size={24} className="text-[#b45309]" />, bg: 'bg-[#b45309]/10', border: 'border-[#b45309]/30', text: 'text-[#b45309]' }
    return { icon: <span className="text-xl font-black text-[var(--text-muted)]">#{rank}</span>, bg: 'bg-[var(--surface)]', border: 'border-[var(--border-soft)]', text: 'text-[var(--text-primary)]' }
  }

  if (loading) {
    return <LoadingScreen label="Loading leaderboard..." />
  }

  return (
    <PageContainer narrow>
      <PageIntro
        eyebrow="Global Rankings"
        title="Leaderboard"
        description="Track your position against other learners and compare your performance across different timeframes."
      />

      <div className="mb-8 flex flex-wrap gap-3 p-1 bg-[var(--surface-strong)] rounded-full w-fit">
        {['all_time', 'monthly', 'weekly'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTimeframe(item)}
            className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 ${
              timeframe === item
                ? 'bg-[var(--surface-elevated)] text-[var(--brand-blue)] shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {item.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {leaderboard.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <EmptyState icon={TrendingUp} title="No leaderboard data" description="No ranking data is available for the selected timeframe yet." />
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3 relative">
          
          <div className="absolute top-20 right-10 w-96 h-96 bg-[var(--brand-orange)] rounded-full mix-blend-screen filter blur-[120px] opacity-5 pointer-events-none"></div>

          {leaderboard.map((entry, index) => {
            const rankStyle = getRankStyle(entry.rank)
            const isCurrentUser = entry.user_id === user?.id

            return (
              <motion.div key={entry.user_id} variants={fadeUp}>
                <div className={`relative flex items-center gap-5 p-5 rounded-[1.5rem] border transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${rankStyle.bg} ${isCurrentUser ? 'border-[var(--brand-blue)] shadow-[var(--brand-blue)]/10' : rankStyle.border}`}>
                  
                  {isCurrentUser && (
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-12 bg-[var(--brand-blue)] rounded-r-full"></div>
                  )}

                  <div className="flex w-14 justify-center items-center drop-shadow-sm">
                    {rankStyle.icon}
                  </div>
                  
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--surface-strong)] to-[var(--surface)] text-xl font-bold shadow-inner text-[var(--text-primary)] border border-[var(--border-soft)]">
                    {entry.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className={`truncate text-lg font-extrabold ${rankStyle.text}`}>{entry.name}</h3>
                      {isCurrentUser && (
                        <span className="rounded-full bg-[var(--brand-blue)]/10 border border-[var(--brand-blue)]/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[var(--brand-blue)]">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-muted)] mt-0.5">Level {entry.level}</p>
                  </div>

                  <div className="text-right pr-2">
                    <p className={`text-2xl font-black tabular-nums tracking-tight ${isCurrentUser ? 'text-[var(--brand-blue)]' : rankStyle.text}`}>
                      {entry.xp.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-1">XP</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </PageContainer>
  )
}

export default LeaderboardPage
