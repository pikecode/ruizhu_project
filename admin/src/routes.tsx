import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import Loading from '@/components/Loading'

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/Login'))
const DashboardPage = lazy(() => import('@/pages/Dashboard'))
const ProductsPage = lazy(() => import('@/pages/Products'))
const CollectionsPage = lazy(() => import('@/pages/Collections'))
const ArrayCollectionsPage = lazy(() => import('@/pages/ArrayCollections'))
const BannersPage = lazy(() => import('@/pages/Banners'))
const CustomBannersPage = lazy(() => import('@/pages/CustomBanners'))
const NewsPage = lazy(() => import('@/pages/News'))
const OrdersPage = lazy(() => import('@/pages/Orders'))
const UsersPage = lazy(() => import('@/pages/Users'))
const SettingsPage = lazy(() => import('@/pages/Settings'))
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
    path: '/collections',
    element: withSuspense(CollectionsPage),
  },
  {
    path: '/array-collections',
    element: withSuspense(ArrayCollectionsPage),
  },
  {
    path: '/banners',
    element: withSuspense(BannersPage),
  },
  {
    path: '/custom-banners',
    element: withSuspense(CustomBannersPage),
  },
  {
    path: '/news',
    element: withSuspense(NewsPage),
  },
  {
    path: '/orders',
    element: withSuspense(OrdersPage),
  },
  {
    path: '/users',
    element: withSuspense(UsersPage),
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
