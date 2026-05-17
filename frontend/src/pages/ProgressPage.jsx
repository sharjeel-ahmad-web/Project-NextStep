import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, CheckCircle, Clock, Award, AlertTriangle, RotateCcw, ClipboardCheck, ExternalLink, Target } from 'lucide-react'
import toast from 'react-hot-toast'
import { roadmapAPI, progressAPI } from '../services/api'
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

const ProgressPage = () => {
  useDocumentMeta({
    title: 'Progress | NextStep AI',
    description: 'Track roadmap completion, current activity, and learning progress across the platform.',
    robots: 'noindex, follow',
  })

  const [roadmaps, setRoadmaps] = useState([])
  const [weeklyInsights, setWeeklyInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const { data } = await roadmapAPI.getAll()
      const weeklyInsightsResponse = await progressAPI.getWeeklyInsights()
      const roadmapsWithProgress = await Promise.all(
        data.map(async (roadmap) => {
          try {
            const progressResponse = await progressAPI.getRoadmapProgress(roadmap.id)
            const progressData = progressResponse.data?.node_progress || progressResponse.data || []
            return { ...roadmap, progress: Array.isArray(progressData) ? progressData : [] }
          } catch (error) {
            return { ...roadmap, progress: [] }
          }
        }),
      )
      setRoadmaps(roadmapsWithProgress)
      setWeeklyInsights(weeklyInsightsResponse.data)
    } catch (error) {
      toast.error('Failed to load progress')
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = (roadmap) => {
    if (!roadmap.nodes || roadmap.nodes.length === 0) return 0
    const completed = roadmap.progress?.filter((item) => item.status === 'completed').length || 0
    return Math.round((completed / roadmap.nodes.length) * 100)
  }

  if (loading) {
    return <LoadingScreen label="Loading progress data..." />
  }

  return (
    <PageContainer>
      <PageIntro
        eyebrow="Learning Progress"
        title="Track Your Journey"
        description="Review your active roadmaps, identify weak points, and track weekly learning momentum."
      />

      {roadmaps.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <EmptyState icon={TrendingUp} title="No progress yet" description="Start a roadmap to begin tracking your learning performance." />
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
          {weeklyInsights ? (
            <motion.div variants={fadeUp}>
              <div className="rounded-[2rem] border border-[var(--brand-blue)]/20 bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--surface)] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-blue)] rounded-full mix-blend-screen filter blur-[80px] opacity-10 pointer-events-none"></div>

                <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr] relative z-10">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-blue)]/20 bg-[var(--brand-blue)]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--brand-blue)] mb-4">
                      <Target size={14} /> Weekly Insights
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">{weeklyInsights.summary?.headline}</h2>
                    <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">{weeklyInsights.summary?.message}</p>
                    
                    <div className="mt-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 text-sm leading-relaxed text-[var(--text-secondary)] shadow-inner">
                      <span className="font-bold text-[var(--text-primary)]">Pro Tip: </span>
                      Repeat weak topics, finish one real task, and only then move to the next concept.
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { label: 'Completed', value: weeklyInsights.stats?.completed_this_week ?? 0, tone: 'text-[var(--brand-green)]' },
                        { label: 'Active Paths', value: weeklyInsights.stats?.active_roadmaps ?? 0, tone: 'text-[var(--brand-blue)]' },
                        { label: 'Weak Points', value: weeklyInsights.stats?.weak_points_count ?? 0, tone: 'text-[var(--brand-orange)]' },
                        { label: 'Assignments', value: weeklyInsights.stats?.assignments_count ?? 0, tone: 'text-[var(--brand-lilac)]' },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 hover:-translate-y-1 transition-transform">
                          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">{item.label}</p>
                          <p className={`mt-2 text-2xl font-black ${item.tone}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-2xl bg-gradient-to-r from-[var(--brand-green)]/20 to-[var(--brand-blue)]/20 p-5 text-sm font-semibold text-[var(--text-primary)] border border-[var(--brand-green)]/30 flex justify-between items-center">
                      <span>Estimated Job-Readiness:</span>
                      <span className="text-xl font-black text-[var(--brand-green)]">
                        {Math.min(100, ((weeklyInsights.stats?.completed_this_week || 0) * 10) + ((weeklyInsights.stats?.assignments_count || 0) * 10) + 20)}/100
                      </span>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-strong)] p-6">
                    <div className="mb-6 flex items-center gap-4 border-b border-[var(--border-soft)] pb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-orange)]/20 text-[var(--brand-orange)]">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Weak Points to Review</h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mt-1">Review these to unblock progress</p>
                      </div>
                    </div>

                    <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {(weeklyInsights.weak_points || []).map((item) => (
                        <div key={`${item.roadmap_id}-${item.skill_name}`} className="group rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--brand-orange)]/50">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <p className="text-base font-extrabold text-[var(--brand-orange)]">{item.skill_name}</p>
                              <p className="mt-1 text-xs font-bold text-[var(--text-secondary)]">{item.target_role}</p>
                              <p className="mt-3 text-sm leading-relaxed text-[var(--text-primary)]">{item.reason}</p>
                            </div>
                            <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[var(--brand-charcoal)]">
                              {item.level}
                            </span>
                          </div>

                          <div className="mt-4 flex items-start gap-3 rounded-xl bg-[var(--brand-blue)]/5 border border-[var(--brand-blue)]/10 px-4 py-3">
                            <RotateCcw size={16} className="mt-1 shrink-0 text-[var(--brand-blue)]" />
                            <p className="text-sm font-medium leading-relaxed text-[var(--text-primary)]">{item.recommendation}</p>
                          </div>
                        </div>
                      ))}
                      {(!weeklyInsights.weak_points || weeklyInsights.weak_points.length === 0) && (
                        <div className="text-center p-8 text-[var(--text-muted)] font-semibold">No weak points identified this week! Keep it up.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}

          {weeklyInsights?.weekly_assignments?.length ? (
            <motion.div variants={fadeUp}>
              <div className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-8">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-green)]/20 text-[var(--brand-green)]">
                    <ClipboardCheck size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Weekly Mini Projects</h2>
                    <p className="text-sm font-semibold text-[var(--text-secondary)] mt-1">Practical assignments to solidify your knowledge.</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {weeklyInsights.weekly_assignments.map((item) => (
                    <div key={item.task_id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 transition-transform hover:-translate-y-1">
                      <p className="text-lg font-bold">{item.title}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[var(--brand-blue)]">{item.target_role}</p>
                      <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">{item.deliverable}</p>
                      <div className="mt-4 rounded-xl bg-[var(--surface-strong)] px-4 py-3 text-sm leading-relaxed text-[var(--text-secondary)] border border-[var(--border-soft)]">
                        {item.revision_step}
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-[var(--border-soft)] pt-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Status</span>
                        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-strong)] px-3 py-1.5 text-xs font-black text-[var(--text-primary)]">
                          <ExternalLink size={14} />
                          {item.mentor_review_status || 'NOT SUBMITTED'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}

          <div className="grid gap-6">
            {roadmaps.map((roadmap) => {
              const progressPercent = calculateProgress(roadmap)
              const completed = roadmap.progress?.filter((item) => item.status === 'completed').length || 0
              const inProgress = roadmap.progress?.filter((item) => item.status === 'in_progress').length || 0
              const total = roadmap.nodes?.length || 0

              return (
                <motion.div key={roadmap.id} variants={fadeUp}>
                  <div className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-8 transition-all hover:border-[var(--brand-blue)]/30 hover:shadow-xl">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">{roadmap.target_role}</h2>
                        <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
                          Started on {new Date(roadmap.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-end gap-3 lg:text-right">
                        <p className="text-5xl font-black text-[var(--brand-blue)] tracking-tighter">{progressPercent}%</p>
                        <p className="text-sm font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">Completed</p>
                      </div>
                    </div>

                    <div className="mt-8 h-4 overflow-hidden rounded-full bg-[var(--surface-strong)] border border-[var(--border-soft)]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-lilac)] shadow-[0_0_10px_rgba(74,159,228,0.5)]"
                      />
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      {[
                        { icon: CheckCircle, label: 'Completed', value: completed, tone: 'text-[var(--brand-green)]', bg: 'bg-[var(--brand-green)]/10' },
                        { icon: Clock, label: 'In Progress', value: inProgress, tone: 'text-[var(--brand-orange)]', bg: 'bg-[var(--brand-orange)]/10' },
                        { icon: Award, label: 'Total Topics', value: total, tone: 'text-[var(--brand-lilac)]', bg: 'bg-[var(--brand-lilac)]/10' },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 flex items-center gap-4">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.tone}`}>
                            <item.icon size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">{item.label}</p>
                            <p className="mt-1 text-2xl font-black text-[var(--text-primary)]">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </PageContainer>
  )
}

export default ProgressPage
