import { Navigate, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from '../store/authStore'

const AdminRoute = () => {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />

  return <Outlet />
}

export default AdminRoute
