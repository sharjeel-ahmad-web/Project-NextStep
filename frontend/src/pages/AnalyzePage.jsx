import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Upload, FileText, Briefcase, Sparkles, AlertCircle, ArrowRight, FileCheck, Target } from 'lucide-react'
import toast from 'react-hot-toast'
import { skillGapAPI, roadmapAPI } from '../services/api'
import { LoadingScreen, PageContainer, PageIntro, SectionCard } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import LanguageSwitcher from '../components/LanguageSwitcher'
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

const AnalyzePage = () => {
  const { language } = useLearningLanguage()

  useDocumentMeta({
    title: 'Analyze Skills | NextStep AI',
    description: 'Upload a resume and generate targeted education recommendations and roadmap inputs.',
    robots: 'noindex, follow',
  })

  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const navigate = useNavigate()

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/pdf') {
      setResume(file)
    } else {
      toast.error('Please upload a PDF file')
    }
  }

  const handleAnalyze = async (event) => {
    event.preventDefault()

    if (!resume) {
      toast.error('Please upload your resume')
      return
    }

    setAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append('resume', resume)
      formData.append('target_role', targetRole)
      formData.append('job_description', jobDescription)
      formData.append('language', language.queryLabel)

      const { data } = await skillGapAPI.analyze(formData)
      setAnalysis(data)
      toast.success('Analysis complete!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleGenerateRoadmap = async () => {
    if (!analysis) return

    setGenerating(true)

    try {
      const { data } = await roadmapAPI.generate({
        target_role: targetRole,
        job_description: jobDescription,
        skill_gaps: analysis.skill_gaps,
        current_skills: analysis.current_skills,
        language: language.queryLabel,
      })

      toast.success('Roadmap generated!')
      navigate(`/roadmap/${data.id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate roadmap')
    } finally {
      setGenerating(false)
    }
  }

  if (analyzing && !analysis) {
    return <LoadingScreen label="Analyzing your resume and role targets..." />
  }

  return (
    <PageContainer narrow>
      <PageIntro
        eyebrow="Skill Gap Analysis"
        title="Turn a resume into a learning plan"
        description={`Upload your resume, define your target role, and generate a customized roadmap for ${language.label}-based preparation.`}
        actions={<LanguageSwitcher />}
      />

      {!analysis ? (
        <motion.form 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer} 
          onSubmit={handleAnalyze} 
          className="space-y-6"
        >
          <motion.div variants={fadeUp}>
            <SectionCard className="border-[var(--brand-blue)]/30 shadow-lg shadow-[var(--brand-blue)]/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-blue)] rounded-full mix-blend-screen filter blur-[80px] opacity-10 pointer-events-none"></div>
              
              <label className="mb-4 block text-lg font-bold">Upload Resume (PDF)</label>
              <label className="block cursor-pointer rounded-3xl border-2 border-dashed border-[var(--brand-blue)]/40 bg-[var(--brand-blue)]/5 p-12 text-center transition-all hover:border-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/10">
                <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                
                {resume ? (
                  <div className="flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-[var(--brand-green)]/20 text-[var(--brand-green)] flex items-center justify-center mb-4">
                       <FileCheck size={32} />
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-green)]/15 px-4 py-2 text-sm font-bold text-[var(--text-primary)]">
                      {resume.name}
                    </div>
                    <p className="mt-3 text-xs text-[var(--text-secondary)]">Click to change file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-[var(--brand-blue)]">
                    <div className="w-16 h-16 rounded-full bg-[var(--brand-blue)]/10 flex items-center justify-center mb-4">
                      <Upload size={32} />
                    </div>
                    <p className="text-lg font-bold text-[var(--text-primary)]">Drag and drop your PDF here</p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">or click to browse from your computer (Max 10MB)</p>
                  </div>
                )}
              </label>
            </SectionCard>
          </motion.div>

          <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-6">
            <SectionCard>
              <label className="mb-4 block text-lg font-bold">Target Role</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  className="input-field pl-12 bg-[var(--surface)]"
                  placeholder="e.g. Full Stack Developer"
                  required
                />
              </div>
            </SectionCard>

            <SectionCard>
              <label className="mb-4 block text-lg font-bold">Preparation Language</label>
              <div className="rounded-[1rem] bg-[var(--surface)] p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--brand-blue)]">{language.label}</p>
                  <p className="text-xs text-[var(--text-secondary)]">For lessons & videos</p>
                </div>
                <LanguageSwitcher />
              </div>
            </SectionCard>
          </motion.div>

          <motion.div variants={fadeUp}>
            <SectionCard>
              <div className="mb-4 flex items-center justify-between">
                <label className="block text-lg font-bold">Job Description <span className="text-xs font-normal text-[var(--text-muted)]">(Optional but recommended)</span></label>
              </div>
              <textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                className="input-field min-h-[160px] resize-none bg-[var(--surface)]"
                placeholder="Paste the target job description here. This helps our AI provide much more accurate skill gap analysis..."
              />
            </SectionCard>
          </motion.div>

          <motion.div variants={fadeUp} className="pt-4">
            <button type="submit" disabled={analyzing || !resume} className="btn-primary w-full py-4 text-lg shadow-lg shadow-[var(--brand-orange)]/20 hover:scale-[1.02] transition-transform">
              <Sparkles size={20} />
              <span>{analyzing ? 'Analyzing Profile...' : 'Analyze Skills & Generate Profile'}</span>
            </button>
          </motion.div>
        </motion.form>
      ) : (
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer} 
          className="space-y-6"
        >
          <motion.div variants={fadeUp}>
            <SectionCard className="border-[var(--brand-green)]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-green)] rounded-full mix-blend-screen filter blur-[80px] opacity-10 pointer-events-none"></div>
              
              <div className="mb-6 flex items-center gap-3 border-b border-[var(--border-soft)] pb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-green)]/20 text-[var(--brand-green)] flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-2xl font-bold">Analysis Results</h2>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2">
                <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border-soft)]">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--brand-green)] flex items-center gap-2">
                    <FileCheck size={16}/> Verified Current Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.current_skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-[var(--brand-green)]/15 border border-[var(--brand-green)]/20 px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border-soft)]">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--brand-orange)] flex items-center gap-2">
                    <Target size={16}/> Identified Skill Gaps
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skill_gaps.map((skill) => (
                      <span key={skill} className="rounded-full bg-[var(--brand-orange)]/15 border border-[var(--brand-orange)]/20 px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {analysis.recommendations ? (
                <div className="mt-8 rounded-2xl bg-[var(--brand-blue)]/5 border border-[var(--brand-blue)]/20 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-[var(--brand-blue)]/20 text-[var(--brand-blue)] flex items-center justify-center">
                      <AlertCircle size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-blue)] mb-2">AI Recommendations</p>
                      <p className="text-base leading-relaxed text-[var(--text-primary)]">{analysis.recommendations}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </SectionCard>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-4">
            <button type="button" onClick={handleGenerateRoadmap} disabled={generating} className="btn-primary flex-1 py-4 text-lg shadow-lg shadow-[var(--brand-orange)]/20 hover:scale-[1.02] transition-transform">
              <span>{generating ? 'Building Your Roadmap...' : 'Generate Learning Roadmap'}</span>
              <ArrowRight size={20} />
            </button>
            <button type="button" onClick={() => setAnalysis(null)} className="btn-secondary px-8">
              Start Over
            </button>
          </motion.div>
        </motion.div>
      )}
    </PageContainer>
  )
}

export default AnalyzePage
