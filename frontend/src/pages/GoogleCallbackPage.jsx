import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { LoadingScreen, PageContainer, SectionCard } from '../components/AppShell'

const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const refreshToken = searchParams.get('refresh_token')
      const error = searchParams.get('error')

      if (error) {
        toast.error('Google authentication failed')
        navigate('/login')
        return
      }

      if (token && refreshToken) {
        localStorage.setItem('accessToken', token)
        localStorage.setItem('refreshToken', refreshToken)

        await checkAuth()
        toast.success('Successfully signed in with Google!')
        navigate('/dashboard')
      } else {
        toast.error('Invalid authentication response')
        navigate('/login')
      }
    }

    handleCallback()
  }, [searchParams, navigate, checkAuth])

  return (
    <PageContainer narrow>
      <SectionCard className="mx-auto mt-20 max-w-xl text-center">
        <LoadingScreen label="Completing Google sign-in..." />
      </SectionCard>
    </PageContainer>
  )
}

export default GoogleCallbackPage
