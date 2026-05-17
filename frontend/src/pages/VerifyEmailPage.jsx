import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams, useParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { authAPI } from '../services/api'
import { AuthShell } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const VerifyEmailPage = () => {
  useDocumentMeta({
    title: 'Verify Email | NextStep',
    description: 'Verify your email address.',
    robots: 'noindex, follow',
  })

  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')
  const verificationStarted = useRef(false)

  useEffect(() => {
    // Avoid double-call in dev mode with StrictMode
    if (verificationStarted.current) return
    verificationStarted.current = true

    const verify = async () => {
      // The custom notification sends parameters in the query
      const url = searchParams.get('url')
      
      if (!url) {
        setStatus('error')
        setMessage('Missing verification link parameters.')
        return
      }

      try {
        // Extract ID and Hash from the signed URL
        // Standard Laravel route: .../api/auth/verify-email/{id}/{hash}?signature=...
        const parsedUrl = new URL(url)
        const pathParts = parsedUrl.pathname.split('/')
        const hash = pathParts.pop()
        const id = pathParts.pop()
        
        const params = Object.fromEntries(parsedUrl.searchParams.entries())

        const { data } = await authAPI.verifyEmail(id, hash, params)
        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')
      } catch (error) {
        setStatus('error')
        setMessage(error.response?.data?.message || 'Email verification failed.')
      }
    }

    verify()
  }, [searchParams])

  return (
    <AuthShell
      title={status === 'verifying' ? 'Verifying email...' : status === 'success' ? 'Email verified!' : 'Verification failed'}
      subtitle={status === 'verifying' ? 'Please wait while we confirm your email address.' : message}
      footer={
        <div className="text-center space-y-4">
          <Link to="/dashboard" className="btn-primary w-full justify-center py-3">
            Go to dashboard
          </Link>
          <p className="text-sm text-[var(--text-secondary)]">
            Problem with verification?{' '}
            <Link to="/contact" className="font-medium text-[var(--brand-blue)] hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center py-8">
        {status === 'verifying' && (
          <Loader2 className="w-16 h-16 text-[var(--brand-blue)] animate-spin" />
        )}
        {status === 'success' && (
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        )}
        {status === 'error' && (
          <XCircle className="w-16 h-16 text-red-500" />
        )}
      </div>
    </AuthShell>
  )
}

export default VerifyEmailPage
