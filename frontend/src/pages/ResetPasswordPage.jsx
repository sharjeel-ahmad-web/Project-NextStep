import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { AuthShell } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const ResetPasswordPage = () => {
  useDocumentMeta({
    title: 'Reset Password | NextStep',
    description: 'Set a new password for your account.',
    robots: 'noindex, follow',
  })

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token || !email) {
      toast.error('Invalid or expired reset link.')
      navigate('/login')
    }
  }, [token, email, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await authAPI.resetPassword({
        token,
        email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      })
      toast.success('Password reset successful. Please sign in.')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field) => (event) => {
    setFormData((currentState) => ({ ...currentState, [field]: event.target.value }))
  }

  return (
    <AuthShell
      title="Set new password"
      subtitle="Your new password must be different from previous used passwords."
      footer={
        <p className="text-center text-sm text-[var(--text-secondary)]">
          Back to{' '}
          <Link to="/login" className="font-medium text-[var(--brand-blue)] hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-password" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            New password
          </label>
          <input
            id="reset-password"
            type="password"
            value={formData.password}
            onChange={updateField('password')}
            className="input-field"
            placeholder="••••••••"
            required
            minLength={8}
          />
        </div>

        <div>
          <label htmlFor="reset-confirm" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Confirm password
          </label>
          <input
            id="reset-confirm"
            type="password"
            value={formData.confirmPassword}
            onChange={updateField('confirmPassword')}
            className="input-field"
            placeholder="••••••••"
            required
            minLength={8}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full justify-center py-3">
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
    </AuthShell>
  )
}

export default ResetPasswordPage
