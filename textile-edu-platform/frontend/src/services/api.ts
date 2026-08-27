import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：附带当前用户角色与用户名（后端据此做权限校验）
apiClient.interceptors.request.use((config) => {
  const user = useAuthStore.getState().user
  if (user) {
    config.headers['x-user-role'] = user.role
    config.headers['x-user-username'] = user.username
  }
  return config
})

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// 企业相关API
export const enterpriseApi = {
  // 获取企业列表
  getEnterprises: (params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    status?: string
  }) => {
    return apiClient.get('/enterprises', { params })
  },

  // 获取企业详情
  getEnterpriseById: (id: string) => {
    return apiClient.get(`/enterprises/${id}`)
  },

  // 获取企业画像
  getEnterpriseProfile: (id: string) => {
    return apiClient.get(`/enterprises/${id}/profile`)
  },

  // 获取统计数据
  getStatistics: () => {
    return apiClient.get('/enterprises/stats/overview')
  },

  // 获取推荐企业
  getRecommendedEnterprises: (params?: { major?: string; limit?: number }) => {
    return apiClient.get('/enterprises/recommend/by-major', { params })
  },

  // 创建企业
  createEnterprise: (data: any) => {
    return apiClient.post('/enterprises', data)
  },

  // 更新企业
  updateEnterprise: (id: string, data: any) => {
    return apiClient.put(`/enterprises/${id}`, data)
  },

  // 删除企业
  deleteEnterprise: (id: string) => {
    return apiClient.delete(`/enterprises/${id}`)
  },
}

// 产业链图谱模块 API
export const industryChainApi = {
  getNodes: () => {
    return apiClient.get('/industry-chain/nodes')
  },

  getNodeSummary: (nodeId: string) => {
    return apiClient.get(`/industry-chain/nodes/${nodeId}/summary`)
  },

  getNodeEnterprises: (
    nodeId: string,
    params?: {
      page?: number
      limit?: number
      search?: string
      sourceType?: string
    }
  ) => {
    return apiClient.get(`/industry-chain/nodes/${nodeId}/enterprises`, { params })
  },

  getEnterpriseDetail: (mappingId: string) => {
    return apiClient.get(`/industry-chain/enterprises/${mappingId}`)
  },

  // 企业名录（仅深度画像企业）
  getDirectoryEnterprises: (params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    decision?: string
  }) => {
    return apiClient.get('/industry-chain/directory/enterprises', { params })
  },

  // 企业画像弹窗（能力分析 + 产教合作 + 需求实况 + 对口院校供给）
  getEnterpriseModal: (enterpriseId: string) => {
    return apiClient.get(`/industry-chain/directory/enterprises/${enterpriseId}/modal`)
  },

  // 技术前沿分析报告
  getTechFrontier: (params?: { majorKey?: string }) => {
    return apiClient.get('/industry-chain/tech-frontier', { params })
  },

  // 技术前沿分析-总览
  getTechOverview: () => {
    return apiClient.get('/industry-chain/tech-overview')
  },
}

// 产业岗位能力图谱 API
export const positionApi = {
  // 关键岗位能力图谱（桑基图数据 + 能力画像名列表）
  getCompetencyMap: () => {
    return apiClient.get('/positions/competency-map')
  },

  // 单个岗位能力画像
  getPositionDetail: (name: string) => {
    return apiClient.get(`/positions/competency-map/${encodeURIComponent(name)}`)
  },

  // 关键岗位能力分析（岗位类别/热度/薪资/学历 + 职业专业映射）
  getPositionAnalysis: () => {
    return apiClient.get('/positions/analysis')
  },

  // 典型岗位职业能力与课程映射图谱
  getJobCompetency: () => {
    return apiClient.get('/positions/job-competency')
  },
}

// 专业诊断报告 API
export const diagnosticApi = {
  // 报告列表
  getReports: () => {
    return apiClient.get('/diagnostics')
  },

  // 报告详情（含 Markdown 全文）
  getReportById: (id: string) => {
    return apiClient.get(`/diagnostics/${id}`)
  },

  // 按专业获取报告
  getReportByMajor: (majorName: string) => {
    return apiClient.get(`/diagnostics/major/${encodeURIComponent(majorName)}`)
  },
}

// 模块文档 API（上传 / 在线查看）
export const documentApi = {
  // 文档列表
  getDocuments: (params?: { module?: string; majorName?: string }) => {
    return apiClient.get('/documents', { params })
  },

  // 上传文档（FormData）
  uploadDocument: (formData: FormData) => {
    return apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // 删除文档
  deleteDocument: (id: string) => {
    return apiClient.delete(`/documents/${id}`)
  },

  // 文档在线预览地址（网页内联，Office 文档后端自动转 PDF）
  getDocumentPreviewUrl: (id: string) => {
    return `${API_BASE_URL}/documents/${id}/file`
  },

  // 文档下载地址（附件下载）
  getDocumentDownloadUrl: (id: string) => {
    return `${API_BASE_URL}/documents/${id}/file?download=1`
  },
}

// 产教适配可视化分析 API
export const industryEduAdaptationApi = {
  // 获取产教适配可视化分析数据
  getAdaptation: () => {
    return apiClient.get('/industry-edu-adaptation')
  },
}

export default apiClient
