import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore, UserRole, Permissions } from '../../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  // 允许访问的角色列表（不传则所有已登录用户可访问）
  roles?: UserRole[]
  // 需要的权限（不传则只要求已登录）
  permission?: keyof Permissions
}

// 路由守卫组件：控制页面访问权限
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
  permission,
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const location = useLocation()

  // 未登录 → 跳转登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 角色校验
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  // 权限校验
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
