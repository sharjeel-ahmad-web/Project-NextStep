import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Circle, Play, HelpCircle, Lock, RefreshCw, Briefcase, ClipboardCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { roadmapAPI, progressAPI } from '../services/api'
import practiceTaskService from '../services/practiceTaskService'
import QuizModal from '../components/QuizModal'
import { LoadingScreen, PageContainer, PageIntro, SectionCard } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useLearningLanguage } from '../components/LanguageProvider'

const normalizeProgress = (progressData) => {
  if (Array.isArray(progressData)) return progressData
  if (progressData && typeof progressData === 'object') {
    return progressData.node_progress || []
  }
  return []
}

const RoadmapDetailPage = () => {
  const { id } = useParams()
  const { language } = useLearningLanguage()
  const [roadmap, setRoadmap] = useState(null)
  const [progress, setProgress] = useState([])
  const [passedQuizzes, setPassedQuizzes] = useState([])
  const [practiceTasks, setPracticeTasks] = useState([])
  const [videos, setVideos] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [taskForms, setTaskForms] = useState({})

  useDocumentMeta({
    title: roadmap ? `${roadmap.target_role} | NextStep AI` : 'Roadmap Detail | NextStep AI',
    description: 'Follow node-by-node roadmap progression, curated lessons, and quizzes.',
    robots: 'noindex, follow',
  })

  useEffect(() => {
    fetchRoadmap()
  }, [id])

  const fetchRoadmap = async () => {
    try {
      const [roadmapResponse, progressResponse] = await Promise.all([roadmapAPI.getOne(id), progressAPI.getRoadmapProgress(id)])
      setRoadmap(roadmapResponse.data)

      const progressData = progressResponse.data
      setProgress(normalizeProgress(progressData))
      setPassedQuizzes(progressData?.passed_quizzes || [])
      setPracticeTasks(progressData?.practice_tasks || [])
    } catch (error) {
      toast.error('Failed to load roadmap')
    } finally {
      setLoading(false)
    }
  }

  const progressByNode = useMemo(() => {
    const map = new Map()
    progress.forEach((item) => map.set(String(item.node_id), item))
    return map
  }, [progress])

  const currentProgressId = useMemo(() => {
    const first = progress[0]
    return first?.id || first?._id || first?.progress_id || null
  }, [progress])

  const handleNodeClick = async (node, isLocked) => {
    if (isLocked) {
      toast.error('Complete the previous skill first.')
      return
    }

    setSelectedNode(node)
    setSelectedVideo(null)

    try {
      const skillName = node.skill_name || node.skill || node.title
      const { data } = await roadmapAPI.getVideos(id, skillName, language.queryLabel)
      const resolvedVideos = data.videos || []
      setVideos(resolvedVideos)
      if (resolvedVideos.length > 0) {
        setSelectedVideo(resolvedVideos[0])
      }
    } catch (error) {
      toast.error('Failed to load learning videos')
    }
  }

  const handleStartNode = async () => {
    try {
      await progressAPI.start({ roadmap_id: id })
      await fetchRoadmap()
      toast.success('Progress started!')
    } catch (error) {
      toast.error('Failed to start progress')
    }
  }

  const handleCompleteNode = async (progressId, nodeId) => {
    const isQuizPassed = passedQuizzes.some((quizId) => videos.some((video) => video.video_id === quizId))

    if (!isQuizPassed) {
      toast.error('Pass the quiz for this skill before marking it complete.')
      return
    }

    try {
      await progressAPI.complete(progressId, { node_id: nodeId })
      await fetchRoadmap()
      toast.success('Skill mastered! +50 XP')
    } catch (error) {
      toast.error('Failed to complete node')
    }
  }

  const handlePracticeTaskToggle = async (taskId, completed) => {
    if (!currentProgressId) {
      toast.error('Start this roadmap first to unlock assignments.')
      return
    }

    try {
      const form = taskForms[taskId] || {}
      const { data } = await practiceTaskService.updateTask(currentProgressId, {
        task_id: taskId,
        completed,
        portfolio_url: form.portfolio_url || '',
        submission_notes: form.submission_notes || '',
      })
      setPracticeTasks(data.practice_tasks || [])
      toast.success(completed ? 'Assignment marked complete' : 'Assignment reopened')
    } catch (error) {
      toast.error('Failed to update assignment')
    }
  }

  const handleTaskFieldChange = (taskId, field, value) => {
    setTaskForms((current) => ({
      ...current,
      [taskId]: {
        ...current[taskId],
        [field]: value,
      },
    }))
  }

  const handleTaskFileUpload = async (taskId, file) => {
    if (!currentProgressId || !file) {
      return
    }

    const formData = new FormData()
    formData.append('task_id', taskId)
    formData.append('file', file)

    try {
      const { data } = await practiceTaskService.uploadSubmission(currentProgressId, formData)
      setPracticeTasks(data.practice_tasks || [])
      toast.success('Practice submission uploaded')
    } catch (error) {
      toast.error('Failed to upload submission')
    }
  }

  if (loading) {
    return <LoadingScreen label="Loading roadmap..." />
  }

  if (!roadmap) {
    return <LoadingScreen label="Roadmap not found." />
  }

  return (
    <PageContainer>
      <PageIntro
        eyebrow="Roadmap detail"
        title={roadmap.target_role}
        description={`Move through your skills in sequence, watch ${language.label} learning resources, and unlock the next step by passing each quiz.`}
        actions={<LanguageSwitcher />}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {(roadmap.nodes || []).map((node, index) => {
            const nodeProgress = progressByNode.get(String(node.id))
            const isCompleted = nodeProgress?.status === 'completed'
            const isInProgress = nodeProgress?.status === 'in_progress'
            const previousNode = index > 0 ? roadmap.nodes[index - 1] : null
            const previousProgress = previousNode ? progressByNode.get(String(previousNode.id)) : null
            const isLocked = index > 0 && previousProgress?.status !== 'completed'

            return (
              <motion.div key={node.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <SectionCard
                  className={`${selectedNode?.id === node.id ? 'border-[var(--brand-blue)]' : ''} ${isLocked ? 'opacity-70' : ''}`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                      <div className="mt-1">
                        {isLocked ? (
                          <Lock className="text-[var(--text-muted)]" size={22} />
                        ) : isCompleted ? (
                          <CheckCircle className="text-[var(--brand-green)]" size={22} />
                        ) : (
                          <Circle className="text-[var(--brand-blue)]" size={22} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold">{node.skill_name || node.skill || node.title}</h3>
                          {isLocked ? <span className="rounded-full bg-[var(--surface)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Locked</span> : null}
                        </div>
                        <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{node.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--text-secondary)]">{node.estimated_time}</span>
                          <span className="rounded-full bg-[var(--brand-sky)] px-3 py-2 text-xs font-bold text-[var(--brand-charcoal)]">{node.level}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => handleNodeClick(node, isLocked)} className="btn-secondary">
                        <Play size={16} />
                        <span>Open skill</span>
                      </button>
                      {isCompleted ? (
                        <span className="inline-flex items-center rounded-full bg-[var(--brand-green)]/15 px-4 py-2 text-sm font-bold text-[var(--text-primary)]">Mastered</span>
                      ) : isInProgress ? (
                        <button type="button" onClick={() => handleCompleteNode(nodeProgress.id || nodeProgress._id, node.id)} className="btn-primary">
                          Complete Skill
                        </button>
                      ) : !isLocked ? (
                        <button type="button" onClick={handleStartNode} className="btn-primary">
                          Unlock
                        </button>
                      ) : null}
                    </div>
                  </div>
                </SectionCard>
              </motion.div>
            )
          })}
        </div>

        <div>
          <SectionCard className="sticky top-24">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-sky)] text-[var(--brand-charcoal)]">
                <Play size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Learning resources</h2>
                <p className="text-sm text-[var(--text-secondary)]">Curated video lessons and quiz checks.</p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{language.label} mode</p>
              </div>
            </div>

            {!selectedNode ? (
              <div className="rounded-[1.5rem] bg-[var(--surface)] p-6 text-center">
                <Play size={30} className="mx-auto text-[var(--brand-blue)]" />
                <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">Select a roadmap skill to load relevant videos and assessment content.</p>
              </div>
            ) : (
              <>
                <div className="rounded-[1.5rem] bg-[var(--surface)] p-4">
                  <h3 className="text-lg font-bold">{selectedNode.skill_name || selectedNode.skill || selectedNode.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{selectedNode.description}</p>
                </div>

                <div className="mt-4 rounded-[1.5rem] bg-[var(--surface)] p-4">
                  <div className="flex items-start gap-3">
                    <Briefcase className="mt-1 text-[var(--brand-orange)]" size={18} />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Professional learning plan</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                        Watch the lesson, pass the quiz (required), repeat any weak part once more, then optionally build a mini task around this skill to make it job-usable.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.5rem] bg-[var(--surface)] p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <ClipboardCheck className="text-[var(--brand-green)]" size={18} />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Mini project assignment</p>
                      <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-[var(--brand-green)]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-primary)]">
                        Optional
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">Use this task to turn theory into job-ready proof. You can skip it; quizzes are the required checkpoint.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {practiceTasks
                      .filter((task) => String(task.node_id) === String(selectedNode.id))
                      .map((task) => (
                        <div key={task.task_id} className="rounded-[1.2rem] bg-[var(--surface-elevated)] p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <p className="text-sm font-bold">{task.title}</p>
                              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{task.deliverable}</p>
                              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{task.revision_step}</p>
                              <div className="mt-3 grid gap-3">
                                <input
                                  className="input-field"
                                  placeholder="Portfolio / GitHub / live demo link"
                                  value={taskForms[task.task_id]?.portfolio_url ?? task.portfolio_url ?? ''}
                                  onChange={(event) => handleTaskFieldChange(task.task_id, 'portfolio_url', event.target.value)}
                                />
                                <textarea
                                  className="input-field min-h-[90px] resize-none"
                                  placeholder="Submission notes: what you built, what you learned, what still needs work"
                                  value={taskForms[task.task_id]?.submission_notes ?? task.submission_notes ?? ''}
                                  onChange={(event) => handleTaskFieldChange(task.task_id, 'submission_notes', event.target.value)}
                                />
                                <label className="btn-secondary cursor-pointer">
                                  Upload Submission File
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(event) => handleTaskFileUpload(task.task_id, event.target.files?.[0])}
                                  />
                                </label>
                                <div className="rounded-[1rem] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                                  Mentor review status: <span className="font-bold text-[var(--text-primary)]">{task.mentor_review_status || 'not_submitted'}</span>
                                  {task.submission_file_url ? (
                                    <span className="block mt-2 break-all">File: {task.submission_file_url}</span>
                                  ) : null}
                                  {task.mentor_feedback ? (
                                    <span className="block mt-2">Feedback: {task.mentor_feedback}</span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handlePracticeTaskToggle(task.task_id, !task.completed)}
                              className={task.completed ? 'btn-secondary' : 'btn-primary'}
                            >
                              {task.completed ? 'Completed' : 'Mark Done'}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {selectedVideo ? (
                  <div className="mt-5">
                    <div className="aspect-video overflow-hidden rounded-[1.5rem] border border-[var(--border-soft)] bg-black">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${selectedVideo.video_id}?autoplay=0&modestbranding=1&rel=0`}
                        title={selectedVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <h3 className="mt-4 text-sm font-bold leading-6">{selectedVideo.title}</h3>

                    {passedQuizzes.includes(selectedVideo.video_id) ? (
                      <div className="mt-4 rounded-[1.4rem] bg-[var(--brand-green)]/15 p-4 text-sm font-semibold text-[var(--text-primary)]">
                        Quiz passed. This lesson is validated.
                      </div>
                    ) : (
                      <button type="button" onClick={() => setShowQuizModal(true)} className="btn-primary mt-4 w-full">
                        <HelpCircle size={16} />
                        <span>Take Assessment Quiz</span>
                      </button>
                    )}

                    <div className="mt-4 rounded-[1.3rem] bg-[var(--surface)] p-4">
                      <p className="text-sm font-bold">Practice after video</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        Build something small with this skill, write down the main idea in your own words, and update your resume once you can explain the result confidently.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.5rem] bg-[var(--surface)] p-6 text-center">
                    <RefreshCw size={28} className="mx-auto animate-spin text-[var(--brand-blue)]" />
                    <p className="mt-4 text-sm font-semibold text-[var(--text-secondary)]">Searching for lessons...</p>
                  </div>
                )}

                <div className="mt-5 space-y-2">
                  {videos.slice(0, 5).map((video) => {
                    const isSelected = selectedVideo?.video_id === video.video_id
                    const isPassed = passedQuizzes.includes(video.video_id)

                    return (
                      <button
                        key={video.video_id}
                        type="button"
                        onClick={() => setSelectedVideo(video)}
                        className={`flex w-full items-start gap-3 rounded-[1.4rem] border p-4 text-left transition ${
                          isSelected ? 'border-[var(--brand-blue)] bg-[var(--brand-blue)]/10' : 'border-[var(--border-soft)] bg-[var(--surface)]'
                        }`}
                      >
                        <div className="mt-0.5">{isPassed ? <CheckCircle size={16} className="text-[var(--brand-green)]" /> : <Play size={16} className="text-[var(--text-muted)]" />}</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{video.title}</p>
                          {isPassed ? <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--brand-green)]">Validated</p> : null}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </SectionCard>
        </div>
      </div>

      {showQuizModal && selectedVideo && selectedNode ? (
        <QuizModal
          video={selectedVideo}
          skillName={selectedNode.skill_name || selectedNode.skill || selectedNode.title}
          progressId={progressByNode.get(String(selectedNode.id))?.id || progressByNode.get(String(selectedNode.id))?._id}
          nodeId={selectedNode.id}
          onClose={() => setShowQuizModal(false)}
          onSuccess={() => {
            fetchRoadmap()
            setShowQuizModal(false)
          }}
        />
      ) : null}
    </PageContainer>
  )
}

export default RoadmapDetailPage
