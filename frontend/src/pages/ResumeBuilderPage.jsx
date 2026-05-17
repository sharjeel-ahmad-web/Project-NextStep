import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, ImagePlus, Save, Sparkles, FileText, Wand2, UploadCloud, Printer, ScanSearch, GitCompareArrows, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageContainer, PageIntro, SectionCard, EmptyState, LoadingScreen } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { resumeAPI } from '../services/api'

const templateCatalog = [
  { id: 'TEMPL_CLASSIC_SERIF', name: 'Classic Serif', bestFor: 'Finance, Law, Senior Managers', accent: 'bg-[var(--brand-cream)]' },
  { id: 'TEMPL_TECH_MINIMAL', name: 'Tech Minimal', bestFor: 'Software, Data, Product, Startups', accent: 'bg-[var(--brand-sky)]' },
  { id: 'TEMPL_CREATIVE_MODERN', name: 'Creative Modern', bestFor: 'Design, Marketing, Media, Brand Roles', accent: 'bg-[var(--brand-orange)]/18' },
  { id: 'TEMPL_EXECUTIVE_BOLD', name: 'Executive Bold', bestFor: 'Director, Head, C-Suite Profiles', accent: 'bg-[var(--brand-charcoal)]/16' },
  { id: 'TEMPL_GLOBAL_PRO', name: 'Global Pro', bestFor: 'General international applications', accent: 'bg-[var(--brand-green)]/15' },
]

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

const emptyResumeData = {
  personal_info: {
    full_name: '',
    professional_title: '',
    email: '',
    phone: '',
    linkedin_url: '',
    location: '',
    photo_url_placeholder: '',
  },
  summary: '',
  skills: {
    hard_skills: [],
    soft_skills: [],
    tools_technologies: [],
  },
  work_experience: [],
  education: [],
  languages: [],
  certifications: [],
}

const ResumeBuilderPage = () => {
  useDocumentMeta({
    title: 'Resume Builder | NextStep AI',
    description: 'Generate ATS-focused professional resumes with AI, editable sections, photo support, and multiple templates.',
    robots: 'noindex, follow',
  })

  const [resumes, setResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState(null)
  const [editorState, setEditorState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [improvingExisting, setImprovingExisting] = useState(false)
  const [existingResumeFile, setExistingResumeFile] = useState(null)
  const [gapAnalysis, setGapAnalysis] = useState(null)
  const [form, setForm] = useState({
    prompt: '',
    target_role: '',
    industry: '',
    experience_level: '',
    raw_input: '',
  })

  useEffect(() => {
    fetchResumes()
  }, [])

  const selectedResume = useMemo(
    () => resumes.find((item) => item.id === selectedResumeId) || null,
    [resumes, selectedResumeId],
  )

  const fetchResumes = async () => {
    try {
      const { data } = await resumeAPI.getAll()
      const list = Array.isArray(data) ? data : []
      setResumes(list)
      if (list[0]) {
        setSelectedResumeId(list[0].id)
        setEditorState(normalizeResume(list[0]))
      }
    } catch (error) {
      toast.error('Failed to load resumes')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (event) => {
    event.preventDefault()
    setGenerating(true)

    try {
      const { data } = await resumeAPI.generate({
        ...form,
        raw_input: form.raw_input || form.prompt,
        has_photo: Boolean(selectedResume?.photo_url || editorState?.photo_url),
      })

      const normalized = normalizeResume(data)
      setResumes((current) => [data, ...current])
      setSelectedResumeId(data.id)
      setEditorState(normalized)
      toast.success('Resume generated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate resume')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!selectedResumeId || !editorState) return

    setSaving(true)

    try {
      const payload = {
        title: editorState.resume_data.personal_info.professional_title || 'Professional Resume',
        target_role: editorState.target_role,
        industry: editorState.industry,
        experience_level: editorState.experience_level,
        meta_data: editorState.meta_data,
        resume_data: editorState.resume_data,
      }

      const { data } = await resumeAPI.update(selectedResumeId, payload)
      const normalized = normalizeResume(data)
      setResumes((current) => current.map((item) => (item.id === data.id ? data : item)))
      setEditorState(normalized)
      toast.success('Resume updated')
    } catch (error) {
      toast.error('Failed to save resume')
    } finally {
      setSaving(false)
    }
  }

  const handleImproveExisting = async (event) => {
    event.preventDefault()

    if (!existingResumeFile) {
      toast.error('Please upload an existing resume PDF')
      return
    }

    const formData = new FormData()
    formData.append('resume', existingResumeFile)
    formData.append('target_role', form.target_role || 'Professional Role')
    formData.append('industry', form.industry || '')
    formData.append('experience_level', form.experience_level || '')
    formData.append('prompt', form.prompt || 'Improve my existing resume for international ATS standards')

    setImprovingExisting(true)

    try {
      const { data } = await resumeAPI.improveExisting(formData)
      const createdResume = data.resume
      setGapAnalysis(data.gap_analysis || null)
      setResumes((current) => [createdResume, ...current])
      setSelectedResumeId(createdResume.id)
      setEditorState(normalizeResume(createdResume))
      toast.success('Existing resume improved successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to improve existing resume')
    } finally {
      setImprovingExisting(false)
    }
  }

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !selectedResumeId) return

    const formData = new FormData()
    formData.append('image', file)
    setUploadingPhoto(true)

    try {
      const { data } = await resumeAPI.uploadPhoto(selectedResumeId, formData)
      const normalized = normalizeResume(data)
      setResumes((current) => current.map((item) => (item.id === data.id ? data : item)))
      setEditorState(normalized)
      toast.success('Resume photo uploaded')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Photo upload failed')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handlePrintResume = () => {
    if (!editorState) return

    const popup = window.open('', '_blank', 'width=960,height=1200')
    if (!popup) {
      toast.error('Popup blocked. Please allow popups to export PDF.')
      return
    }

    const data = editorState.resume_data
    const personal = data.personal_info || {}
    const experiences = (data.work_experience || []).map((item) => `
      <section style="margin-bottom:20px;">
        <h3 style="margin:0 0 6px;font-size:18px;">${escapeHtml(item.role || '')} - ${escapeHtml(item.company || '')}</h3>
        <p style="margin:0 0 8px;color:#555;">${escapeHtml(item.location || '')} | ${escapeHtml(item.duration || '')}</p>
        <ul style="margin:0;padding-left:18px;">${(item.achievements || []).map((point) => `<li style="margin-bottom:6px;">${escapeHtml(point)}</li>`).join('')}</ul>
      </section>
    `).join('')

    const education = (data.education || []).map((item) => `
      <section style="margin-bottom:14px;">
        <h3 style="margin:0 0 6px;font-size:16px;">${escapeHtml(item.degree || '')}</h3>
        <p style="margin:0;color:#555;">${escapeHtml(item.institution || '')} | ${escapeHtml(item.year || '')} ${item.gpa_or_honors ? `| ${escapeHtml(item.gpa_or_honors)}` : ''}</p>
      </section>
    `).join('')

    popup.document.write(`
      <html>
      <head>
        <title>${escapeHtml(personal.full_name || 'Resume')}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111; margin: 36px; line-height: 1.45; }
          h1,h2,h3 { margin: 0; }
          .muted { color: #555; }
          .section { margin-top: 28px; }
          .chips { margin-top: 10px; }
          .chip { display: inline-block; margin: 0 8px 8px 0; padding: 6px 10px; background: #eef4fb; border-radius: 999px; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1 style="font-size:32px;">${escapeHtml(personal.full_name || '')}</h1>
        <p class="muted" style="margin-top:8px;">${escapeHtml(personal.professional_title || '')}</p>
        <p class="muted" style="margin-top:8px;">${escapeHtml(personal.email || '')} ${personal.phone ? `| ${escapeHtml(personal.phone)}` : ''} ${personal.linkedin_url ? `| ${escapeHtml(personal.linkedin_url)}` : ''}</p>
        <p class="muted">${escapeHtml(personal.location || '')}</p>

        <div class="section">
          <h2 style="font-size:20px;">Professional Summary</h2>
          <p style="margin-top:10px;">${escapeHtml(data.summary || '')}</p>
        </div>

        <div class="section">
          <h2 style="font-size:20px;">Skills</h2>
          <div class="chips">${[...(data.skills?.hard_skills || []), ...(data.skills?.tools_technologies || []), ...(data.skills?.soft_skills || [])].map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join('')}</div>
        </div>

        <div class="section">
          <h2 style="font-size:20px;">Experience</h2>
          <div style="margin-top:12px;">${experiences}</div>
        </div>

        <div class="section">
          <h2 style="font-size:20px;">Education</h2>
          <div style="margin-top:12px;">${education}</div>
        </div>
      </body>
      </html>
    `)
    popup.document.close()
    popup.focus()
    popup.print()
  }

  const handleDownloadResume = async (format) => {
    if (!selectedResumeId) return

    try {
      const response = await resumeAPI.download(selectedResumeId, format)
      const blob = new Blob([response.data], {
        type: format === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${(editorState?.target_role || 'resume').replaceAll(' ', '_')}_resume.${format}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(`Failed to download ${format.toUpperCase()}`)
    }
  }

  const updateMeta = (field, value) => {
    setEditorState((current) => ({
      ...current,
      meta_data: {
        ...current.meta_data,
        [field]: value,
      },
    }))
  }

  const updatePersonal = (field, value) => {
    setEditorState((current) => ({
      ...current,
      resume_data: {
        ...current.resume_data,
        personal_info: {
          ...current.resume_data.personal_info,
          [field]: value,
        },
      },
    }))
  }

  const updateResumeData = (field, value) => {
    setEditorState((current) => ({
      ...current,
      resume_data: {
        ...current.resume_data,
        [field]: value,
      },
    }))
  }

  const updateSkills = (field, value) => {
    setEditorState((current) => ({
      ...current,
      resume_data: {
        ...current.resume_data,
        skills: {
          ...current.resume_data.skills,
          [field]: splitList(value),
        },
      },
    }))
  }

  const updateExperience = (index, field, value) => {
    setEditorState((current) => {
      const next = [...current.resume_data.work_experience]
      next[index] = { ...next[index], [field]: field === 'achievements' ? splitLines(value) : value }
      return {
        ...current,
        resume_data: { ...current.resume_data, work_experience: next },
      }
    })
  }

  const updateEducation = (index, field, value) => {
    setEditorState((current) => {
      const next = [...current.resume_data.education]
      next[index] = { ...next[index], [field]: value }
      return {
        ...current,
        resume_data: { ...current.resume_data, education: next },
      }
    })
  }

  if (loading) {
    return <LoadingScreen label="Loading resume builder..." />
  }

  return (
    <PageContainer>
      <PageIntro
        eyebrow="Resume builder"
        title="Create international-standard resumes with AI"
        description="Generate ATS-focused resume content from a simple prompt, choose from 5 professional designs, upload a profile photo later, and edit every section before final use."
      />

      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid gap-6 2xl:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-6">
          <motion.div variants={fadeUp}>
            <SectionCard>
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--brand-orange)]/12 p-3 text-[var(--brand-orange)]">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Generate from simple prompt</h2>
                <p className="text-sm text-[var(--text-secondary)]">Paste a short brief, old resume text, or OCR content.</p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <textarea
                value={form.prompt}
                onChange={(event) => setForm((current) => ({ ...current, prompt: event.target.value }))}
                className="input-field min-h-[150px] resize-none"
                placeholder="Example: I am Ali, frontend developer with 2 years experience in React, Tailwind, APIs, and dashboard projects. I want an ATS resume for an international frontend developer role."
                required
              />

              <div className="grid gap-4 md:grid-cols-2">
                <input className="input-field" placeholder="Target role" value={form.target_role} onChange={(event) => setForm((current) => ({ ...current, target_role: event.target.value }))} />
                <input className="input-field" placeholder="Industry" value={form.industry} onChange={(event) => setForm((current) => ({ ...current, industry: event.target.value }))} />
                <input className="input-field" placeholder="Experience level" value={form.experience_level} onChange={(event) => setForm((current) => ({ ...current, experience_level: event.target.value }))} />
                <textarea className="input-field min-h-[52px] resize-none" placeholder="Optional raw resume / OCR text" value={form.raw_input} onChange={(event) => setForm((current) => ({ ...current, raw_input: event.target.value }))} />
              </div>

              <button type="submit" disabled={generating} className="btn-primary w-full">
                <Wand2 size={18} />
                <span>{generating ? 'Generating...' : 'Generate Resume'}</span>
              </button>
            </form>
          </SectionCard>

          <SectionCard>
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--brand-green)]/15 p-3 text-[var(--brand-green)]">
                <UploadCloud size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Improve existing resume</h2>
                <p className="text-sm text-[var(--text-secondary)]">Upload a PDF and get an updated ATS-optimized version with gap-based improvements.</p>
              </div>
            </div>

            <form onSubmit={handleImproveExisting} className="space-y-4">
              <label className="block cursor-pointer rounded-[1.4rem] border-2 border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-5 text-center transition hover:border-[var(--brand-blue)]">
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(event) => setExistingResumeFile(event.target.files?.[0] || null)}
                />
                <p className="text-sm font-bold">{existingResumeFile ? existingResumeFile.name : 'Choose existing resume PDF'}</p>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">The system extracts text, finds gaps, and creates an updated editable resume.</p>
              </label>

              <button type="submit" disabled={improvingExisting || !existingResumeFile} className="btn-primary w-full">
                <Sparkles size={18} />
                <span>{improvingExisting ? 'Improving Resume...' : 'Analyze and Improve Resume'}</span>
              </button>
            </form>
          </SectionCard>

          <SectionCard>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--brand-blue)]/12 p-3 text-[var(--brand-blue)]">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Saved resumes</h2>
                <p className="text-sm text-[var(--text-secondary)]">Open and continue editing any generated resume.</p>
              </div>
            </div>

            {resumes.length === 0 ? (
              <EmptyState icon={Briefcase} title="No resumes yet" description="Generate your first ATS-ready resume from a simple prompt." />
            ) : (
              <div className="grid gap-3">
                {resumes.map((resume) => (
                  <button
                    key={resume.id}
                    type="button"
                    onClick={() => {
                      setSelectedResumeId(resume.id)
                      setEditorState(normalizeResume(resume))
                    }}
                    className={`rounded-[1.4rem] border px-4 py-4 text-left transition ${
                      resume.id === selectedResumeId
                        ? 'border-[var(--brand-blue)] bg-[var(--brand-blue)]/10'
                        : 'border-[var(--border-soft)] bg-[var(--surface)]'
                    }`}
                  >
                    <p className="text-sm font-bold">{resume.title || resume.target_role || 'Professional Resume'}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">{resume.meta_data?.recommended_template_id || 'Template pending'}</p>
                  </button>
                ))}
              </div>
            )}
          </SectionCard>
          </motion.div>
        </div>

        {!editorState ? (
          <motion.div variants={fadeUp}>
            <EmptyState icon={FileText} title="Generate or open a resume" description="Once a resume is generated, you can edit content, upload a photo, and choose a template here." />
          </motion.div>
        ) : (
          <div className="space-y-6">
            <motion.div variants={fadeUp}>
              <SectionCard>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Resume editor</h2>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Edit all generated sections before using the resume for applications.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => handleDownloadResume('pdf')} className="btn-secondary">
                    <Download size={16} />
                    <span>Styled PDF</span>
                  </button>
                  <button type="button" onClick={() => handleDownloadResume('docx')} className="btn-secondary">
                    <FileText size={16} />
                    <span>DOCX</span>
                  </button>
                  <button type="button" onClick={handlePrintResume} className="btn-secondary">
                    <Printer size={16} />
                    <span>Print / PDF</span>
                  </button>
                  <label className="btn-secondary cursor-pointer">
                    <ImagePlus size={16} />
                    <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                  <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : 'Save Resume'}</span>
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
                <div className="rounded-[1.5rem] bg-[var(--surface)] p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Template recommendation</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {templateCatalog.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => updateMeta('recommended_template_id', template.id)}
                        className={`rounded-[1.2rem] border p-4 text-left transition ${
                          editorState.meta_data.recommended_template_id === template.id
                            ? 'border-[var(--brand-blue)] bg-[var(--brand-blue)]/10'
                            : 'border-[var(--border-soft)] bg-[var(--surface-elevated)]'
                        }`}
                      >
                        <div className={`mb-3 h-12 rounded-xl ${template.accent}`} />
                        <p className="text-sm font-bold">{template.name}</p>
                        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{template.bestFor}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-[var(--surface)] p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <input className="input-field" value={editorState.target_role || ''} onChange={(event) => setEditorState((current) => ({ ...current, target_role: event.target.value }))} placeholder="Target role" />
                    <input className="input-field" value={editorState.industry || ''} onChange={(event) => setEditorState((current) => ({ ...current, industry: event.target.value }))} placeholder="Industry" />
                    <input className="input-field" value={editorState.experience_level || ''} onChange={(event) => setEditorState((current) => ({ ...current, experience_level: event.target.value }))} placeholder="Experience level" />
                    <input className="input-field" value={editorState.meta_data.ats_score_forecast || ''} onChange={(event) => updateMeta('ats_score_forecast', event.target.value)} placeholder="ATS score forecast" />
                  </div>
                  <textarea
                    className="input-field mt-4 min-h-[90px] resize-none"
                    value={editorState.meta_data.image_processing_directive || ''}
                    onChange={(event) => updateMeta('image_processing_directive', event.target.value)}
                    placeholder="Image processing directive"
                  />
                </div>
              </div>
              </SectionCard>
            </motion.div>

            {gapAnalysis ? (
              <motion.div variants={fadeUp}>
                <SectionCard>
                <h2 className="text-2xl font-bold">Detected gaps from uploaded resume</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.4rem] bg-[var(--surface)] p-4">
                    <p className="text-sm font-bold text-[var(--brand-green)]">Current skills</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{(gapAnalysis.current_skills || []).join(', ') || 'Not detected'}</p>
                  </div>
                  <div className="rounded-[1.4rem] bg-[var(--surface)] p-4">
                    <p className="text-sm font-bold text-[var(--brand-blue)]">Required skills</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{(gapAnalysis.required_skills || []).join(', ') || 'Not detected'}</p>
                  </div>
                  <div className="rounded-[1.4rem] bg-[var(--surface)] p-4">
                    <p className="text-sm font-bold text-[var(--brand-orange)]">Skill gaps</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{(gapAnalysis.skill_gaps || []).join(', ') || 'No major gaps detected'}</p>
                  </div>
                </div>
                </SectionCard>
              </motion.div>
            ) : null}

            {editorState?.meta_data?.ats_breakdown ? (
              <motion.div variants={fadeUp}>
                <SectionCard>
                <div className="mb-4 flex items-center gap-3">
                  <ScanSearch className="text-[var(--brand-blue)]" size={20} />
                  <div>
                    <h2 className="text-2xl font-bold">ATS score breakdown</h2>
                    <p className="text-sm text-[var(--text-secondary)]">Forecast score with section-level reasoning.</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  {[
                    ['Keyword coverage', editorState.meta_data.ats_breakdown.keyword_coverage],
                    ['Experience strength', editorState.meta_data.ats_breakdown.experience_strength],
                    ['Structure quality', editorState.meta_data.ats_breakdown.structure_quality],
                    ['Formatting readiness', editorState.meta_data.ats_breakdown.formatting_readiness],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[1.3rem] bg-[var(--surface)] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
                      <p className="mt-2 text-2xl font-extrabold">{value}</p>
                    </div>
                  ))}
                </div>
                </SectionCard>
              </motion.div>
            ) : null}

            {gapAnalysis && editorState ? (
              <motion.div variants={fadeUp}>
                <SectionCard>
                <div className="mb-4 flex items-center gap-3">
                  <GitCompareArrows className="text-[var(--brand-orange)]" size={20} />
                  <div>
                    <h2 className="text-2xl font-bold">Old vs improved comparison</h2>
                    <p className="text-sm text-[var(--text-secondary)]">Highlighting what the new version added for stronger ATS positioning.</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-[var(--surface)] p-4">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Uploaded resume text</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">
                      {editorState.raw_input || 'No original text stored.'}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-[var(--surface)] p-4">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Improved summary</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{editorState.resume_data.summary || 'No summary generated.'}</p>
                    <div className="mt-4">
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Improved keywords</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                        {(editorState.resume_data.skills.hard_skills || []).join(', ') || 'No optimized keywords generated.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-[var(--surface)] p-4">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">New ATS keywords added</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {getAddedKeywords(gapAnalysis, editorState).map((item) => (
                        <span key={item} className="rounded-full bg-[var(--brand-green)]/15 px-3 py-2 text-xs font-bold text-[var(--text-primary)]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] bg-[var(--surface)] p-4">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Improved achievements</p>
                    <div className="mt-3 space-y-2">
                      {(editorState.resume_data.work_experience || []).flatMap((item) => item.achievements || []).slice(0, 4).map((item, index) => (
                        <div key={`${index}-${item}`} className="rounded-[1rem] bg-[var(--surface-elevated)] px-3 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                </SectionCard>
              </motion.div>
            ) : null}

            <motion.div variants={fadeUp}>
              <SectionCard>
              <div className="grid gap-5 xl:grid-cols-[auto_1fr]">
                <div className="mx-auto w-full max-w-[220px]">
                  <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)]">
                    {editorState.photo_url || editorState.resume_data.personal_info.photo_url_placeholder ? (
                      <img
                        src={editorState.photo_url || editorState.resume_data.personal_info.photo_url_placeholder}
                        alt="Resume profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="px-5 text-center text-sm font-semibold text-[var(--text-secondary)]">
                        No photo uploaded yet. User can upload it later.
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ['full_name', 'Full name'],
                    ['professional_title', 'Professional title'],
                    ['email', 'Email'],
                    ['phone', 'Phone'],
                    ['linkedin_url', 'LinkedIn URL'],
                    ['location', 'Location'],
                  ].map(([field, label]) => (
                    <input
                      key={field}
                      className="input-field"
                      placeholder={label}
                      value={editorState.resume_data.personal_info[field] || ''}
                      onChange={(event) => updatePersonal(field, event.target.value)}
                    />
                  ))}
                </div>
              </div>

              <textarea
                className="input-field mt-5 min-h-[120px] resize-none"
                placeholder="Professional summary"
                value={editorState.resume_data.summary || ''}
                onChange={(event) => updateResumeData('summary', event.target.value)}
              />
            </SectionCard>

            <SectionCard>
              <h2 className="text-2xl font-bold">Skills and strengths</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <textarea className="input-field min-h-[120px] resize-none" value={(editorState.resume_data.skills.hard_skills || []).join(', ')} onChange={(event) => updateSkills('hard_skills', event.target.value)} placeholder="Hard skills, comma separated" />
                <textarea className="input-field min-h-[120px] resize-none" value={(editorState.resume_data.skills.soft_skills || []).join(', ')} onChange={(event) => updateSkills('soft_skills', event.target.value)} placeholder="Soft skills, comma separated" />
                <textarea className="input-field min-h-[120px] resize-none" value={(editorState.resume_data.skills.tools_technologies || []).join(', ')} onChange={(event) => updateSkills('tools_technologies', event.target.value)} placeholder="Tools and technologies, comma separated" />
              </div>
            </SectionCard>

            <SectionCard>
              <h2 className="text-2xl font-bold">Work experience</h2>
              <div className="mt-4 space-y-4">
                {(editorState.resume_data.work_experience || []).map((item, index) => (
                  <div key={`${item.company}-${index}`} className="rounded-[1.4rem] bg-[var(--surface)] p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <input className="input-field" value={item.company || ''} onChange={(event) => updateExperience(index, 'company', event.target.value)} placeholder="Company" />
                      <input className="input-field" value={item.role || ''} onChange={(event) => updateExperience(index, 'role', event.target.value)} placeholder="Role" />
                      <input className="input-field" value={item.location || ''} onChange={(event) => updateExperience(index, 'location', event.target.value)} placeholder="Location" />
                      <input className="input-field" value={item.duration || ''} onChange={(event) => updateExperience(index, 'duration', event.target.value)} placeholder="Duration" />
                    </div>
                    <textarea className="input-field mt-4 min-h-[140px] resize-none" value={(item.achievements || []).join('\n')} onChange={(event) => updateExperience(index, 'achievements', event.target.value)} placeholder="One achievement per line" />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard>
              <h2 className="text-2xl font-bold">Education and extras</h2>
              <div className="mt-4 space-y-4">
                {(editorState.resume_data.education || []).map((item, index) => (
                  <div key={`${item.institution}-${index}`} className="grid gap-4 rounded-[1.4rem] bg-[var(--surface)] p-4 md:grid-cols-2">
                    <input className="input-field" value={item.degree || ''} onChange={(event) => updateEducation(index, 'degree', event.target.value)} placeholder="Degree" />
                    <input className="input-field" value={item.institution || ''} onChange={(event) => updateEducation(index, 'institution', event.target.value)} placeholder="Institution" />
                    <input className="input-field" value={item.year || ''} onChange={(event) => updateEducation(index, 'year', event.target.value)} placeholder="Year" />
                    <input className="input-field" value={item.gpa_or_honors || ''} onChange={(event) => updateEducation(index, 'gpa_or_honors', event.target.value)} placeholder="GPA or honors" />
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <textarea className="input-field min-h-[110px] resize-none" value={(editorState.resume_data.languages || []).join(', ')} onChange={(event) => updateResumeData('languages', splitList(event.target.value))} placeholder="Languages, comma separated" />
                <textarea className="input-field min-h-[110px] resize-none" value={(editorState.resume_data.certifications || []).join(', ')} onChange={(event) => updateResumeData('certifications', splitList(event.target.value))} placeholder="Certifications, comma separated" />
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-start gap-3">
                <UploadCloud className="mt-1 text-[var(--brand-blue)]" size={18} />
                <div>
                  <h2 className="text-xl font-bold">How this feature works</h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                    AI generates structured JSON using the International Resume Architect prompt style, then you manually refine it. If no image exists, user can upload a professional photo later and the system stores an image-processing directive for background cleanup.
                  </p>
                </div>
              </div>
              </SectionCard>
            </motion.div>
          </div>
        )}
      </motion.div>
    </PageContainer>
  )
}

const normalizeResume = (resume) => ({
  ...resume,
  meta_data: {
    recommended_template_id: 'TEMPL_GLOBAL_PRO',
    ats_score_forecast: '75',
    image_processing_directive: null,
    ...(resume.meta_data || {}),
  },
  resume_data: {
    ...emptyResumeData,
    ...(resume.resume_data || {}),
    personal_info: {
      ...emptyResumeData.personal_info,
      ...(resume.resume_data?.personal_info || {}),
    },
    skills: {
      ...emptyResumeData.skills,
      ...(resume.resume_data?.skills || {}),
    },
    work_experience: resume.resume_data?.work_experience?.length ? resume.resume_data.work_experience : [{
      company: '',
      role: '',
      location: '',
      duration: '',
      achievements: [],
    }],
    education: resume.resume_data?.education?.length ? resume.resume_data.education : [{
      degree: '',
      institution: '',
      year: '',
      gpa_or_honors: '',
    }],
  },
})

const splitList = (value) => value.split(',').map((item) => item.trim()).filter(Boolean)
const splitLines = (value) => value.split('\n').map((item) => item.trim()).filter(Boolean)
const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
const getAddedKeywords = (gapAnalysis, editorState) => {
  const currentSkills = new Set((gapAnalysis?.current_skills || []).map((item) => item.toLowerCase()))
  return (editorState?.resume_data?.skills?.hard_skills || []).filter((item) => !currentSkills.has(item.toLowerCase())).slice(0, 8)
}

export default ResumeBuilderPage
