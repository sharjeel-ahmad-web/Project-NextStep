import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Download, Eye, Sparkles, FileType, FileText, X, Loader2, CheckCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { certificateAPI, roadmapAPI } from '../services/api'
import { EmptyState, LoadingScreen, PageContainer, PageIntro } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

// --- Framer Motion Variants ---
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

const CertificatesPage = () => {
  useDocumentMeta({
    title: 'Certificates | NextStep AI',
    description: 'Manage, preview, verify, and download education certificates issued by NextStep AI.',
    robots: 'noindex, follow',
  })

  const { user } = useAuthStore()
  const [certificates, setCertificates] = useState([])
  const [roadmaps, setRoadmaps] = useState([])
  const [selectedCert, setSelectedCert] = useState(null)

  // Localized Loading States
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [generatingId, setGeneratingId] = useState(null)
  const [downloadState, setDownloadState] = useState({ id: null, format: null })

  const fetchData = useCallback(async () => {
    try {
      const [certRes, roadmapRes] = await Promise.all([
        certificateAPI.getAll(),
        roadmapAPI.getAll()
      ])

      const certsRaw = certRes.data?.data || certRes.data || []
      const roadmapsRaw = roadmapRes.data?.data || roadmapRes.data || []

      setCertificates(Array.isArray(certsRaw) ? certsRaw : [])
      setRoadmaps(Array.isArray(roadmapsRaw) ? roadmapsRaw : [])
    } catch (error) {
      toast.error('Failed to load certificates. Please try refreshing.')
    } finally {
      setIsPageLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Accessibility: Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedCert) setSelectedCert(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCert])

  const handleGenerate = useCallback(async (roadmapId) => {
    if (generatingId) return
    setGeneratingId(roadmapId)

    try {
      const { data } = await certificateAPI.generate(roadmapId)
      const newCertificate = data?.data || data
      setCertificates((prev) => [...prev, newCertificate])
      toast.success('Certificate generated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate certificate')
    } finally {
      setGeneratingId(null)
    }
  }, [generatingId])

  const handleDownload = useCallback(async (id, format = 'pdf') => {
    if (downloadState.id) return
    setDownloadState({ id, format })

    try {
      const response = await certificateAPI.download(id, format)
      const disposition = response.headers['content-disposition']
      const fallbackName = `NextStep_Certificate_${id.slice(-4)}.${format}`
      const filenameMatch = disposition?.match(/filename="?([^";]+)"?/)
      const filename = filenameMatch?.[1] || fallbackName

      const mimeType = format === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

      const blob = new Blob([response.data], { type: mimeType })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      toast.error(`Failed to download ${format.toUpperCase()} file`)
    } finally {
      setDownloadState({ id: null, format: null })
    }
  }, [downloadState])

  if (isPageLoading) {
    return <LoadingScreen label="Verifying credentials..." />
  }

  const availableRoadmaps = roadmaps.filter(
    (roadmap) => !certificates.some((cert) => String(cert.roadmap_id) === String(roadmap.id))
  )

  return (
    <PageContainer>
      <PageIntro
        eyebrow="Credentials"
        title="Verified Certificates"
        description="Generate, view, and download official certificates for your completed learning roadmaps."
      />

      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-16">

        {/* --- EARNED CERTIFICATES SECTION --- */}
        <section>
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-green)] to-emerald-600 flex items-center justify-center text-white shadow-md">
              <Award size={20} />
            </div>
            <h2 className="text-2xl font-bold">Earned Credentials</h2>
          </motion.div>

          {certificates.length === 0 ? (
            <motion.div variants={fadeUp}>
              <EmptyState icon={Award} title="No certificates yet" description="Complete all lessons in a roadmap to unlock your first verifiable certificate." />
            </motion.div>
          ) : (
            <motion.div variants={staggerContainer} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {certificates.map((cert) => (
                <motion.div key={cert.id} variants={fadeUp}>
                  <div className="group h-full rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/30 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full mix-blend-screen filter blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg">
                        <CheckCircle size={26} />
                      </div>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Verified
                      </span>
                    </div>

                    <div className="flex-grow mt-6 relative z-10">
                      <h3 className="text-xl font-extrabold leading-tight text-[var(--text-primary)] group-hover:text-emerald-600 transition-colors">
                        {cert.roadmap?.target_role}
                      </h3>
                      <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
                        Issued {new Date(cert.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2 relative z-10">
                      <button onClick={() => setSelectedCert(cert)} className="btn-secondary !bg-[var(--surface)] hover:!border-emerald-500/50 transition-colors flex items-center justify-center gap-2">
                        <Eye size={16} />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => handleDownload(cert.id, 'pdf')}
                        disabled={downloadState.id === cert.id}
                        className="btn-primary flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {downloadState.id === cert.id && downloadState.format === 'pdf' ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Download size={16} />
                        )}
                        <span>{downloadState.id === cert.id && downloadState.format === 'pdf' ? 'Exporting...' : 'PDF'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* --- AVAILABLE TO GENERATE SECTION --- */}
        <section>
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-blue)] to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <h2 className="text-2xl font-bold">Ready to Generate</h2>
          </motion.div>

          {availableRoadmaps.length === 0 ? (
            <motion.div variants={fadeUp}>
              <EmptyState icon={Sparkles} title="No roadmaps ready" description="Complete an active roadmap to 100% to generate its certificate." />
            </motion.div>
          ) : (
            <motion.div variants={staggerContainer} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {availableRoadmaps.map((roadmap) => (
                <motion.div key={roadmap.id} variants={fadeUp}>
                  <div className="group h-full rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 flex flex-col">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 group-hover:scale-110 transition-transform">
                      <Sparkles size={22} />
                    </div>
                    <div className="flex-grow">
                      <h3 className="mt-5 text-xl font-extrabold">{roadmap.target_role}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">Your progress is complete. Claim your official verifiable credential.</p>
                    </div>
                    <button
                      onClick={() => handleGenerate(roadmap.id)}
                      disabled={generatingId === roadmap.id}
                      className="btn-primary mt-6 w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-transform"
                    >
                      {generatingId === roadmap.id ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      <span>{generatingId === roadmap.id ? 'Generating...' : 'Issue Certificate'}</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

      </motion.div>

      {/* --- ADVANCED CERTIFICATE PREVIEW MODAL --- */}
      <AnimatePresence>
        {selectedCert && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-8 backdrop-blur-sm overflow-y-auto"
            onClick={() => setSelectedCert(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl my-auto flex flex-col gap-4"
            >
              {/* Modal Header Controls */}
              <div className="flex items-center justify-between bg-[var(--surface)] p-4 rounded-2xl shadow-xl border border-[var(--border-soft)]">
                <div>
                  <h2 id="modal-title" className="text-xl font-bold text-[var(--text-primary)]">Credential Preview</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Document ID: {selectedCert.certificate_code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDownload(selectedCert.id, 'pdf')} disabled={downloadState.id} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                    {downloadState.id === selectedCert.id && downloadState.format === 'pdf' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    <span className="hidden sm:inline">Export PDF</span>
                  </button>
                  <button onClick={() => setSelectedCert(null)} className="p-2 rounded-full hover:bg-[var(--surface-strong)] transition-colors text-[var(--text-secondary)]">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* The Premium Certificate Body */}
              <div className="relative w-full aspect-auto sm:aspect-[1.414/1] bg-white rounded-sm shadow-2xl p-4 sm:p-8 overflow-hidden select-none">
                {/* Background Textures & Patterns */}
                <div className="absolute inset-0 border-[12px] sm:border-[24px] border-[#0F172A]"></div>
                <div className="absolute inset-[14px] sm:inset-[28px] border-[2px] border-[#CBD5E1]"></div>
                <div className="absolute inset-[18px] sm:inset-[34px] border-[1px] border-[#E2E8F0]"></div>

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <Award size={400} className="text-slate-900" />
                </div>

                <div className="relative z-10 h-full flex flex-col items-center justify-between text-slate-900 pt-8 sm:pt-12 pb-8 px-4 sm:px-12 text-center">

                  {/* Header */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 flex items-center justify-center rounded-lg mb-6 shadow-md">
                      <span className="text-white text-2xl sm:text-3xl font-serif font-bold tracking-widest">NS</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-slate-500 mb-2">NextStep AI Academy</p>
                    <h3 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black text-slate-900 tracking-tight">
                      CERTIFICATE <span className="font-light italic text-slate-600 text-2xl sm:text-4xl">of</span> EXCELLENCE
                    </h3>
                  </div>

                  {/* Body Text */}
                  <div className="flex flex-col items-center my-8 sm:my-12 w-full max-w-2xl">
                    <p className="text-sm sm:text-base italic text-slate-600 mb-6 font-serif">This document is proudly presented to</p>
                    <h4 className="text-3xl sm:text-5xl font-bold text-slate-900 border-b-2 border-slate-200 pb-2 mb-6 w-full text-center tracking-wide">
                      {user?.name}
                    </h4>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-serif">
                      For having demonstrated exceptional skill, dedication, and successful completion of the rigorous professional learning roadmap resulting in the designation of:
                    </p>
                    <p className="mt-4 text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-widest">
                      {selectedCert.roadmap?.target_role}
                    </p>
                  </div>

                  {/* Footer & Signatures */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-8 items-end mt-auto">

                    {/* Date Signature */}
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left w-full">
                      <div className="w-32 border-b border-slate-400 pb-2 mb-2">
                        <p className="text-lg font-bold text-slate-800">
                          {new Date(selectedCert.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Date Issued</p>
                    </div>

                    {/* Gold Seal */}
                    <div className="flex justify-center relative -translate-y-4">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-700 p-1 shadow-2xl flex items-center justify-center relative">
                        {/* Serrated edge effect placeholder using dotted border */}
                        <div className="absolute inset-0 rounded-full border-4 border-dashed border-amber-600 opacity-50 animate-[spin_60s_linear_infinite]" />
                        <div className="w-[88%] h-[88%] rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-amber-200 flex flex-col items-center justify-center text-amber-900 shadow-inner z-10">
                          <Award size={32} className="opacity-80 mb-1" />
                          <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-center leading-tight">Official<br />Seal</span>
                        </div>
                      </div>
                    </div>

                    {/* Authority Signature */}
                    <div className="flex flex-col items-center sm:items-end text-center sm:text-right w-full">
                      <div className="w-32 border-b border-slate-400 pb-2 mb-2 flex justify-center sm:justify-end">
                        <p className="font-serif text-2xl italic text-slate-800 -mb-2">NextStep</p>
                      </div>
                      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Issuing Authority</p>
                    </div>

                  </div>

                  {/* Verification Bar */}
                  <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-12 flex items-center gap-3">
                    <QRCodeSVG value={`${window.location.origin}/certificates/verify/${selectedCert.id}`} size={40} className="opacity-80" />
                    <div className="text-left text-[8px] sm:text-[10px] text-slate-400 font-mono">
                      <p>VERIFY ONLINE AT</p>
                      <p className="text-slate-600">{window.location.host}/verify/{selectedCert.id.slice(-8)}</p>
                    </div>
                  </div>

                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  )
}

export default CertificatesPage