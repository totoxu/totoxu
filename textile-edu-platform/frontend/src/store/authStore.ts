import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 用户角色类型
export type UserRole = 'admin' | 'teacher' | 'student' | 'guest'

// 用户信息
export interface User {
  id: string
  username: string
  name: string
  role: UserRole
  department?: string
  avatar?: string
}

// 权限定义 - 模块访问权限
export interface Permissions {
  // 宏观经济数据
  macroEconomic: boolean
  // 产业链图谱
  industryChain: boolean
  // 岗位能力图谱
  positionAbility: boolean
  // 专业诊断报告
  diagnosticReport: boolean
  // 系统管理
  systemManage: boolean
  // 数据导入导出
  dataImport: boolean
}

// 各角色的默认权限
const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  admin: {
    macroEconomic: true,
    industryChain: true,
    positionAbility: true,
    diagnosticReport: true,
    systemManage: true,
    dataImport: true,
  },
  teacher: {
    macroEconomic: true,
    industryChain: true,
    positionAbility: true,
    diagnosticReport: true,
    systemManage: false,
    dataImport: false,
  },
  student: {
    macroEconomic: true,
    industryChain: true,
    positionAbility: true,
    diagnosticReport: true,
    systemManage: false,
    dataImport: false,
  },
  guest: {
    macroEconomic: false,
    industryChain: false,
    positionAbility: false,
    diagnosticReport: false,
    systemManage: false,
    dataImport: false,
  },
}

// 认证状态
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  permissions: Permissions
  login: (user: User, token?: string) => void
  logout: () => void
  hasPermission: (permission: keyof Permissions) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      permissions: ROLE_PERMISSIONS.guest,

      login: (user, token = 'mock-token') => {
        set({
          user,
          token,
          isAuthenticated: true,
          permissions: ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.guest,
        })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          permissions: ROLE_PERMISSIONS.guest,
        })
      },

      hasPermission: (permission) => {
        return get().permissions[permission]
      },
    }),
    {
      name: 'textile-edu-auth',
    }
  )
)
