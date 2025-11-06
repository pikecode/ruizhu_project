import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import Loading from './Loading'

interface ProtectedRouteProps {
  element: React.ReactElement
  requiredRole?: string[]
}

/**
 * 受保护的路由组件
 * 检查用户是否已登录
 * 如果未登录，重定向到登录页面
 */
export default function ProtectedRoute({ element, requiredRole }: ProtectedRouteProps) {
  const { isLoggedIn, isHydrated, user } = useAuthStore()

  // 等待认证状态完全恢复
  if (!isHydrated) {
    return <Loading />
  }

  // 如果未登录，重定向到登录页面
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  // 检查角色权限（如果指定了）
  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return <Navigate to="/products" replace />
  }

  return element
}
