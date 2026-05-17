import api from './api'

class PracticeTaskService {
  updateTask(progressId, payload) {
    return api.post(`/progress/${progressId}/practice-task`, payload)
  }

  uploadSubmission(progressId, formData) {
    return api.post(`/progress/${progressId}/practice-submission`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }
}

const practiceTaskService = new PracticeTaskService()

export default practiceTaskService
