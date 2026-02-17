import { axiosInstance } from "@/lib/utils/axios"

export const studentApi = {
  async getProfile() {
    const response = await axiosInstance.get('/student/profile')
    return response.data.data || response.data
  },

  async updateProfile(data: any) {
    const response = await axiosInstance.put('/student/profile', data)
    return response.data.data || response.data
  },

  async getApplications() {
    const response = await axiosInstance.get('/student/applications')
    return response.data.data || response.data
  },

  async applyForRole(roleId: string, useExistingResume: boolean, resumeFile?: File) {
    if (useExistingResume) {
      const response = await axiosInstance.post('/student/apply', {
        roleId,
        useExistingResume: true
      })
      return response.data
    } else {
      const formData = new FormData()
      formData.append('roleId', roleId)
      formData.append('useExistingResume', 'false')
      if (resumeFile) formData.append('resume', resumeFile)

      const response = await axiosInstance.post('/student/apply', formData)

      return response.data
    }
  },

  async uploadResume(file: File) {
    const formData = new FormData()
    formData.append('resume', file)
    const response = await axiosInstance.post('/student/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }
}

