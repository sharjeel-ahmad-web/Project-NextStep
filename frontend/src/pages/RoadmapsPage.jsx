import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Map, Trash2, Eye, Plus, Compass } from 'lucide-react'
import toast from 'react-hot-toast'
import { roadmapAPI } from '../services/api'
import { EmptyState, LoadingScreen, PageContainer, PageIntro } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

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

const RoadmapsPage = () => {
  useDocumentMeta({
    title: 'Roadmaps | NextStep AI',
    description: 'Browse, manage, and continue your active learning roadmaps.',
    robots: 'noindex, follow',
  })

  const [roadmaps, setRoadmaps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoadmaps()
  }, [])

  const fetchRoadmaps = async () => {
    try {
      const { data } = await roadmapAPI.getAll()
      setRoadmaps(data)
    } catch (error) {
      toast.error('Failed to load roadmaps')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this roadmap?')) return

    try {
      await roadmapAPI.delete(id)
      setRoadmaps((currentRoadmaps) => currentRoadmaps.filter((roadmap) => roadmap.id !== id))
      toast.success('Roadmap deleted')
    } catch (error) {
      toast.error('Failed to delete roadmap')
    }
  }

  if (loading) {
    return <LoadingScreen label="Loading your roadmaps..." />
  }

  return (
    <PageContainer>
      <PageIntro
        eyebrow="Learning Roadmaps"
        title="Manage your active paths"
        description="Open, review, and organize the personalized learning roadmaps you have generated."
        actions={
          <Link to="/analyze" className="btn-primary shadow-lg shadow-[var(--brand-orange)]/20 hover:scale-105 transition-transform">
            <Plus size={18} />
            <span>Create New Path</span>
          </Link>
        }
      />

      {roadmaps.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <EmptyState
            icon={Compass}
            title="No roadmaps yet"
            description="Create your first personalized learning roadmap from a resume and target role."
            action={
              <Link to="/analyze" className="btn-primary px-8">
                Get Started
              </Link>
            }
          />
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer} 
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {roadmaps.map((roadmap) => (
            <motion.div key={roadmap.id} variants={fadeUp}>
              <div className="group relative h-full rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[var(--brand-blue)]/10 hover:border-[var(--brand-blue)]/30 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--brand-blue)] rounded-full mix-blend-screen filter blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"></div>

                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-strong)] text-[var(--text-primary)] shadow-sm group-hover:bg-[var(--brand-blue)] group-hover:text-white transition-colors duration-300">
                    <Map size={24} />
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => { e.preventDefault(); handleDelete(roadmap.id); }} 
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    aria-label="Delete roadmap"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h3 className="mt-6 text-xl font-extrabold leading-tight text-[var(--text-primary)] group-hover:text-[var(--brand-blue)] transition-colors">
                  {roadmap.target_role}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Created {new Date(roadmap.created_at).toLocaleDateString()}
                </p>
                
                <div className="mt-8 flex items-center justify-between gap-3 pt-4 border-t border-[var(--border-soft)] relative z-10">
                  <span className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-sm">
                    {roadmap.nodes?.length || 0} Skills
                  </span>
                  <Link to={`/roadmap/${roadmap.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-blue)] hover:text-[var(--brand-orange)] transition-colors">
                    <span>View Path</span>
                    <Eye size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageContainer>
  )
}

export default RoadmapsPage
