import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { AuthShell } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const ForgotPasswordPage = () => {
  useDocumentMeta({
    title: 'Forgot Password | NextStep',
    description: 'Reset your NextStep account password.',
    robots: 'noindex, follow',
  })

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      await authAPI.forgotPassword(email)
      toast.success('Reset link sent to your email.')
      setSubmitted(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <AuthShell
        title="Check your email"
        subtitle={`We've sent a password reset link to ${email}. Please check your inbox.`}
        footer={
          <p className="text-center text-sm text-[var(--text-secondary)]">
            Wait, I remember it!{' '}
            <Link to="/login" className="font-medium text-[var(--brand-blue)] hover:underline">
              Sign in
            </Link>
          </p>
        }
      >
        <div className="space-y-4">
          <button 
            onClick={() => setSubmitted(false)} 
            className="btn-secondary w-full justify-center py-3"
          >
            Try another email
          </button>
          <Link to="/login" className="btn-primary w-full justify-center py-3">
            Back to login
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="No worries, we'll send you reset instructions."
      footer={
        <p className="text-center text-sm text-[var(--text-secondary)]">
          Wait, I remember it!{' '}
          <Link to="/login" className="font-medium text-[var(--brand-blue)] hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input-field"
            placeholder="you@company.com"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full justify-center py-3">
          {loading ? 'Sending link…' : 'Reset password'}
        </button>
      </form>
    </AuthShell>
  )
}

export default ForgotPasswordPage
