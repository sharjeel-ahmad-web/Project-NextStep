import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, Map, Award, Zap, Calendar, ArrowRight, FileText, Sparkles, Compass, Play } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { gamificationAPI, roadmapAPI } from '../services/api'
import { EmptyState, LoadingScreen, PageContainer } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { useLearningLanguage } from '../components/LanguageProvider'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const DashboardPage = () => {
  const { language } = useLearningLanguage()

  useDocumentMeta({
    title: 'Dashboard | NextStep AI',
    description: 'Review your education progress, active roadmaps, XP, and quick actions in one dashboard.',
    robots: 'noindex, follow',
  })

  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [roadmaps, setRoadmaps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, roadmapsResponse] = await Promise.all([
          gamificationAPI.getStats(),
          roadmapAPI.getAll(),
        ])
        setStats(statsResponse.data)
        setRoadmaps(roadmapsResponse.data)
      } catch (error) {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const primaryNextAction = useMemo(() => {
    if (roadmaps.length > 0) {
      return { label: 'Continue roadmap', link: `/roadmap/${roadmaps[0].id}` }
    }
    return { label: 'Start with skill analysis', link: '/analyze' }
  }, [roadmaps])

  if (loading) {
    return <LoadingScreen label="Loading your dashboard..." />
  }

  return (
    <PageContainer>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
        
        {/* Hero Welcome Banner */}
        <motion.div variants={fadeUp}>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a1d21] via-[var(--brand-charcoal)] to-[#2a3038] p-8 md:p-12 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-[var(--brand-blue)] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>
            
            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-sky)] backdrop-blur-md border border-white/10">
                  <Sparkles size={14} /> Learner dashboard
                </div>
                <h1 className="text-4xl font-extrabold sm:text-5xl tracking-tight mb-4">
                  Welcome back, {user?.name?.split(' ')[0] || 'Learner'}
                </h1>
                <p className="text-lg leading-relaxed text-white/80 mb-8 max-w-xl">
                  Ready to level up? Your learning language is set to <span className="text-white font-semibold">{language.label}</span>. Jump back into your path.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to={primaryNextAction.link} className="btn-primary shadow-lg shadow-[var(--brand-orange)]/30 hover:scale-105 transition-transform">
                    {primaryNextAction.label} <ArrowRight size={16} />
                  </Link>
                  <Link to="/roadmaps" className="btn-secondary !text-white border-white/20 hover:bg-white/10 hover:border-white transition-all">
                    View Library
                  </Link>
                </div>
              </div>

              {/* Mini Stats in Banner */}
              <div className="grid grid-cols-2 gap-3 w-full md:w-auto mt-6 md:mt-0">
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-transform hover:scale-105">
                  <Zap className="text-[var(--brand-orange)] mb-2" size={24} />
                  <span className="text-2xl font-black">{stats?.xp || 0}</span>
                  <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Total XP</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-transform hover:scale-105">
                  <Calendar className="text-[var(--brand-lilac)] mb-2" size={24} />
                  <span className="text-2xl font-black">{stats?.streak || 0}</span>
                  <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Day Streak</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Target, label: 'Analyze Skills', link: '/analyze', color: 'text-[var(--brand-blue)]' },
            { icon: Map, label: 'Roadmaps', link: '/roadmaps', color: 'text-[var(--brand-green)]' },
            { icon: FileText, label: 'Resume', link: '/resume-builder', color: 'text-[var(--brand-orange)]' },
            { icon: Award, label: 'Certificates', link: '/certificates', color: 'text-[var(--brand-lilac)]' },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.link}
              className="group flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-6 transition-all hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-lg"
            >
              <div className={`rounded-xl bg-[var(--surface)] p-3 shadow-sm transition-transform group-hover:scale-110 ${item.color}`}>
                <item.icon size={24} />
              </div>
              <span className="text-sm font-bold text-[var(--text-primary)]">{item.label}</span>
            </Link>
          ))}
        </motion.div>

        {/* Recent Roadmaps */}
        <motion.div variants={fadeUp}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Active Paths</h2>
            <Link to="/roadmaps" className="text-sm font-semibold text-[var(--brand-blue)] hover:underline">
              View all
            </Link>
          </div>

          {roadmaps.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="No active paths"
              description="Start by analyzing your skills to generate your very first roadmap."
              action={
                <Link to="/analyze" className="btn-primary">
                  Start Analysis
                </Link>
              }
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {roadmaps.slice(0, 3).map((roadmap, index) => (
                <motion.div 
                  key={roadmap.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2 + (index * 0.1) }}
                >
                  <Link to={`/roadmap/${roadmap.id}`} className="group block rounded-[1.8rem] border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--brand-blue)]/5">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--surface-strong)] flex items-center justify-center text-[var(--text-primary)] shadow-sm group-hover:bg-[var(--brand-blue)] group-hover:text-white transition-colors">
                        <Map size={20} />
                      </div>
                      <span className="rounded-full bg-[var(--surface)] border border-[var(--border-soft)] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
                        {roadmap.nodes?.length || 0} Skills
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-[var(--brand-blue)] transition-colors">{roadmap.target_role}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-6">
                      Last active: {new Date(roadmap.updated_at || roadmap.created_at).toLocaleDateString()}
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-[var(--border-soft)] pt-4 mt-auto">
                       <span className="text-sm font-semibold text-[var(--text-primary)]">Continue learning</span>
                       <div className="w-8 h-8 rounded-full bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] flex items-center justify-center group-hover:bg-[var(--brand-blue)] group-hover:text-white transition-colors">
                         <Play size={14} className="ml-0.5" />
                       </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </motion.div>
    </PageContainer>
  )
}

export default DashboardPage
