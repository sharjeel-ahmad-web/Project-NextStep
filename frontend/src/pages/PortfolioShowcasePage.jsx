import { useEffect, useState } from 'react'
import { ExternalLink, FolderKanban } from 'lucide-react'
import toast from 'react-hot-toast'
import { progressAPI, roadmapAPI } from '../services/api'
import { EmptyState, LoadingScreen, PageContainer, PageIntro, SectionCard } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const PortfolioShowcasePage = () => {
  useDocumentMeta({
    title: 'Portfolio Showcase | NextStep AI',
    description: 'View completed mini projects and portfolio-ready assignments built through roadmap learning.',
    robots: 'noindex, follow',
  })

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: roadmaps } = await roadmapAPI.getAll()
        const progressResponses = await Promise.all(
          (roadmaps || []).map(async (roadmap) => {
            const response = await progressAPI.getRoadmapProgress(roadmap.id)
            return { roadmap, progress: response.data }
          }),
        )

        const showcaseItems = progressResponses.flatMap(({ roadmap, progress }) =>
          (progress?.practice_tasks || [])
            .filter((task) => task.completed || task.portfolio_url || task.submission_file_url)
            .map((task) => ({
              ...task,
              target_role: roadmap.target_role,
            })),
        )

        setItems(showcaseItems)
      } catch (error) {
        toast.error('Failed to load portfolio showcase')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <LoadingScreen label="Loading portfolio showcase..." />
  }

  return (
    <PageContainer>
      <PageIntro
        eyebrow="Portfolio showcase"
        title="Practical work built from your learning roadmap"
        description="This page highlights mini projects, portfolio links, and submitted task work that proves your skills beyond course completion."
      />

      {items.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No showcase items yet" description="Complete and submit mini project assignments to build your visible professional proof." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <SectionCard key={`${item.task_id}-${item.target_role}`} className="h-full">
              <p className="text-sm font-bold text-[var(--brand-blue)]">{item.target_role}</p>
              <h2 className="mt-2 text-xl font-bold">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.deliverable}</p>
              <div className="mt-4 rounded-[1rem] bg-[var(--surface)] px-3 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                {item.submission_notes || item.revision_step}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {item.portfolio_url ? (
                  <a href={item.portfolio_url} target="_blank" rel="noreferrer" className="btn-secondary">
                    <ExternalLink size={16} />
                    <span>Open Portfolio</span>
                  </a>
                ) : null}
                {item.submission_file_url ? (
                  <a href={item.submission_file_url} target="_blank" rel="noreferrer" className="btn-secondary">
                    <ExternalLink size={16} />
                    <span>Open Submission</span>
                  </a>
                ) : null}
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </PageContainer>
  )
}

export default PortfolioShowcasePage
