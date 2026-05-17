import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken
        })

        localStorage.setItem('accessToken', data.access_token)
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`

        return api(originalRequest)
      } catch (refreshError) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// ============ AUTH APIs ============
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: () => window.location.href = `${API_BASE_URL}/auth/google`,
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (id, hash, params) => api.get(`/auth/verify-email/${id}/${hash}`, { params }),
  resendVerification: () => api.post('/auth/email/verification-notification'),
}


// ============ SKILL GAP APIs ============
export const skillGapAPI = {
  analyze: (formData) => api.post('/skill-gap/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// ============ ROADMAP APIs ============
export const roadmapAPI = {
  getAll: () => api.get('/roadmaps'),
  generate: (data) => api.post('/roadmaps/generate', data),
  getOne: (id) => api.get(`/roadmaps/${id}`),
  delete: (id) => api.delete(`/roadmaps/${id}`),
  getVideos: (id, skillName, language) => api.get(`/roadmaps/${id}/videos`, { params: { skill: skillName, language } }),
}

// ============ PROGRESS APIs ============
export const progressAPI = {
  start: (data) => api.post('/progress/start', data),
  complete: (id, data) => api.post(`/progress/${id}/complete`, data),
  trackVideo: (id, videoId) => api.post(`/progress/${id}/track-video`, { video_id: videoId }),
  getRoadmapProgress: (roadmapId) => api.get(`/progress/roadmap/${roadmapId}`),
  getWeeklyInsights: () => api.get('/progress/weekly-insights'),
}

// ============ CERTIFICATE APIs ============
export const certificateAPI = {
  getAll: () => api.get('/certificates'),
  generate: (roadmapId) => api.post(`/certificates/generate/${roadmapId}`),
  verify: (id) => api.get(`/certificates/verify/${id}`),
  download: (id, format = 'pdf') =>
    api.get(`/certificates/${id}/download`, {
      params: { format },
      responseType: 'blob',
    }),
}

// ============ PROFILE APIs ============
export const profileAPI = {
  update: (data) => api.put('/profile', data),
  uploadAvatar: (formData) => api.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAvatar: () => api.delete('/profile/avatar'),
  saveLocation: (coords) => api.post('/profile/location', coords),
}

// ============ GAMIFICATION APIs ============
export const gamificationAPI = {
  getLeaderboard: (params) => api.get('/gamification/leaderboard', { params }),
  getBadges: () => api.get('/gamification/badges'),
  getStats: () => api.get('/gamification/stats'),
}

// ============ ADMIN APIs ============
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getStats: () => api.get('/admin/stats'),
  getPracticeReviews: () => api.get('/admin/practice-reviews'),
  reviewPracticeTask: (progressId, data) => api.post(`/admin/practice-reviews/${progressId}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  deleteCertificate: (id) => api.delete(`/admin/certificates/${id}`),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  addLesson: (courseId, data) => api.post(`/admin/courses/${courseId}/lessons`, data),
  updateLesson: (id, data) => api.put(`/admin/lessons/${id}`, data),
  deleteLesson: (id) => api.delete(`/admin/lessons/${id}`),
}

// ============ QUIZ APIs ============
export const quizAPI = {
  get: (params) => api.get('/quiz', { params }), // video_id, video_title, skill_name
  submit: (data) => api.post('/quiz/submit', data), // quiz_id, answers, progress_id, node_id
}

export const resumeAPI = {
  getAll: () => api.get('/resumes'),
  getOne: (id) => api.get(`/resumes/${id}`),
  generate: (data) => api.post('/resumes/generate', data),
  improveExisting: (formData) => api.post('/resumes/improve-existing', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/resumes/${id}`, data),
  download: (id, format = 'pdf') => api.get(`/resumes/${id}/download`, {
    params: { format },
    responseType: 'blob',
  }),
  uploadPhoto: (id, formData) => api.post(`/resumes/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

export default api
