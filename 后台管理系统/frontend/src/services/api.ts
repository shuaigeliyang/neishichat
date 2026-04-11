import axios from 'axios'
import type { ApiResponse, PaginatedResponse, Student, Teacher, Course, KnowledgeFile, DatabaseStats } from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// API 接口定义
export const apiService = {
  // 获取系统统计信息
  getStats: (): Promise<ApiResponse<DatabaseStats>> => {
    return api.get('/stats')
  },

  // 学生相关接口
  getStudents: (page = 1, pageSize = 10, search = ''): Promise<PaginatedResponse<Student>> => {
    return api.get('/students', { params: { page, pageSize, search } })
  },

  getStudent: (id: number): Promise<ApiResponse<Student>> => {
    return api.get(`/students/${id}`)
  },

  createStudent: (data: Partial<Student>): Promise<ApiResponse<Student>> => {
    return api.post('/students', data)
  },

  updateStudent: (id: number, data: Partial<Student>): Promise<ApiResponse<Student>> => {
    return api.put(`/students/${id}`, data)
  },

  deleteStudent: (id: number): Promise<ApiResponse<void>> => {
    return api.delete(`/students/${id}`)
  },

  // 教师相关接口
  getTeachers: (page = 1, pageSize = 10, search = ''): Promise<PaginatedResponse<Teacher>> => {
    return api.get('/teachers', { params: { page, pageSize, search } })
  },

  getTeacher: (id: number): Promise<ApiResponse<Teacher>> => {
    return api.get(`/teachers/${id}`)
  },

  createTeacher: (data: Partial<Teacher>): Promise<ApiResponse<Teacher>> => {
    return api.post('/teachers', data)
  },

  updateTeacher: (id: number, data: Partial<Teacher>): Promise<ApiResponse<Teacher>> => {
    return api.put(`/teachers/${id}`, data)
  },

  deleteTeacher: (id: number): Promise<ApiResponse<void>> => {
    return api.delete(`/teachers/${id}`)
  },

  // 课程相关接口
  getCourses: (page = 1, pageSize = 10, search = ''): Promise<PaginatedResponse<Course>> => {
    return api.get('/courses', { params: { page, pageSize, search } })
  },

  getCourse: (id: number): Promise<ApiResponse<Course>> => {
    return api.get(`/courses/${id}`)
  },

  createCourse: (data: Partial<Course>): Promise<ApiResponse<Course>> => {
    return api.post('/courses', data)
  },

  updateCourse: (id: number, data: Partial<Course>): Promise<ApiResponse<Course>> => {
    return api.put(`/courses/${id}`, data)
  },

  deleteCourse: (id: number): Promise<ApiResponse<void>> => {
    return api.delete(`/courses/${id}`)
  },

  // 知识库相关接口
  getKnowledgeFiles: (): Promise<ApiResponse<KnowledgeFile[]>> => {
    return api.get('/knowledge/files')
  },

  uploadKnowledgeFile: async (file: File, description?: string): Promise<ApiResponse<KnowledgeFile>> => {
    const formData = new FormData()
    formData.append('file', file)
    if (description) {
      formData.append('description', description)
    }
    return api.post('/knowledge/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  deleteKnowledgeFile: (id: number): Promise<ApiResponse<void>> => {
    return api.delete(`/knowledge/files/${id}`)
  },

  rebuildKnowledgeIndex: (): Promise<ApiResponse<{ message: string }>> => {
    return api.post('/knowledge/rebuild')
  },

  // 系统设置相关接口
  getSettings: (): Promise<ApiResponse<any>> => {
    return api.get('/settings')
  },

  updateSettings: (settings: any): Promise<ApiResponse<any>> => {
    return api.put('/settings', settings)
  },
}

export default api
