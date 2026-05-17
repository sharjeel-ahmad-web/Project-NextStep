import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Award, CheckCircle, XCircle } from 'lucide-react'
import { certificateAPI } from '../services/api'
import { LoadingScreen } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const CertificateVerifyPage = () => {
  const { id } = useParams()
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useDocumentMeta({
    title: 'Certificate Verification | NextStep AI',
    description: 'Verify issued NextStep AI certificates online.',
  })

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        const { data } = await certificateAPI.verify(id)
        setCertificate(data.certificate)
      } catch (fetchError) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    verifyCertificate()
  }, [id])

  if (loading) {
    return <LoadingScreen label="Verifying certificate..." />
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card max-w-3xl w-full text-center">
        {error ? (
          <>
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-500/15 text-red-500">
              <XCircle size={44} />
            </div>
            <h1 className="text-3xl font-extrabold">Certificate not found</h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--text-secondary)]">
              This certificate ID is invalid, unavailable, or has been revoked.
            </p>
          </>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-green)]/15 text-[var(--brand-green)]">
                <CheckCircle size={24} />
              </div>
              <h1 className="text-3xl font-extrabold">Certificate verified</h1>
            </div>

            <div className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--brand-charcoal)] p-6 text-white sm:p-8">
              <div className="rounded-[1.5rem] border border-white/15 p-6 sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.26em] text-[var(--brand-sky)]">NextStep AI</p>
                <h2 className="mt-4 text-4xl font-extrabold text-[var(--brand-cream)]">Certificate of Completion</h2>
                <p className="mt-3 text-sm text-white/70">Official verification record</p>

                <div className="my-10">
                  <p className="text-sm uppercase tracking-[0.22em] text-white/60">Awarded to</p>
                  <h3 className="mt-3 text-4xl font-extrabold">{certificate.user_name}</h3>
                  <p className="mt-4 text-lg text-[var(--brand-sky)]">{certificate.target_role || certificate.roadmap_name}</p>
                  <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/75">
                    This confirms the successful completion of the required learning milestones and assessments.
                  </p>
                </div>

                <div className="grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
                  <div className="text-left">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/55">Issued date</p>
                    <p className="mt-2 text-sm font-bold">
                      {new Date(certificate.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-orange)] text-white">
                      <Award size={34} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/55">Verification ID</p>
                    <p className="mt-2 text-sm font-bold text-[var(--brand-sky)]">{certificate.code || certificate.id}</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              This certificate has been verified by the platform and is linked to a valid learner record.
            </p>
          </>
        )}

        {!error && certificate ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href={certificateAPI.download(certificate.id, 'pdf')} className="btn-primary" target="_blank" rel="noopener noreferrer">
              Download PDF
            </a>
            <a href={certificateAPI.download(certificate.id, 'docx')} className="btn-secondary" target="_blank" rel="noopener noreferrer">
              Download DOCX
            </a>
          </div>
        ) : null}

        <div className="mt-6">
          <Link to="/" className="btn-secondary inline-flex">
            Go to Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default CertificateVerifyPage
