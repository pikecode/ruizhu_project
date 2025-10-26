import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import Loading from '@/components/Loading'

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/Login'))
const DashboardPage = lazy(() => import('@/pages/Dashboard'))
const ProductsPage = lazy(() => import('@/pages/Products'))
const OrdersPage = lazy(() => import('@/pages/Orders'))
const CouponsPage = lazy(() => import('@/pages/Coupons'))
const UsersPage = lazy(() => import('@/pages/Users'))
const SettingsPage = lazy(() => import('@/pages/Settings'))
const FileManagerPage = lazy(() => import('@/pages/FileManager'))
const NotFoundPage = lazy(() => import('@/pages/NotFound'))

const withSuspense = (Component: React.LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
)

export const routes = [
  {
    path: '/login',
    element: withSuspense(LoginPage),
  },
  {
    path: '/dashboard',
    element: withSuspense(DashboardPage),
  },
  {
    path: '/products',
    element: withSuspense(ProductsPage),
  },
  {
    path: '/orders',
    element: withSuspense(OrdersPage),
  },
  {
    path: '/coupons',
    element: withSuspense(CouponsPage),
  },
  {
    path: '/users',
    element: withSuspense(UsersPage),
  },
  {
    path: '/files',
    element: withSuspense(FileManagerPage),
  },
  {
    path: '/settings',
    element: withSuspense(SettingsPage),
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '*',
    element: withSuspense(NotFoundPage),
  },
]
