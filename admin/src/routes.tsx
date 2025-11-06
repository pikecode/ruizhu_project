import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import Loading from '@/components/Loading'
import ProtectedRoute from '@/components/ProtectedRoute'

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/Login'))
const ProductsPage = lazy(() => import('@/pages/Products'))
const CollectionsPage = lazy(() => import('@/pages/Collections'))
const ArrayCollectionsPage = lazy(() => import('@/pages/ArrayCollections'))
const BannersPage = lazy(() => import('@/pages/Banners'))
const CustomBannersPage = lazy(() => import('@/pages/CustomBanners'))
const ProfileBannersPage = lazy(() => import('@/pages/ProfileBanners'))
const AboutBannersPage = lazy(() => import('@/pages/AboutBanners'))
const FeaturedBannersPage = lazy(() => import('@/pages/FeaturedBanners'))
const NewsPage = lazy(() => import('@/pages/News'))
const OrdersPage = lazy(() => import('@/pages/Orders'))
const ConsultationsPage = lazy(() => import('@/pages/Consultations'))
const MemberBenefitsPage = lazy(() => import('@/pages/MemberBenefits'))
const UsersPage = lazy(() => import('@/pages/Users'))
const ConsumerUsersPage = lazy(() => import('@/pages/ConsumerUsers'))
const NotFoundPage = lazy(() => import('@/pages/NotFound'))

const withSuspense = (Component: React.LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
)

const withProtection = (Component: React.LazyExoticComponent<() => JSX.Element>, requiredRole?: string[]) => (
  <ProtectedRoute element={withSuspense(Component)} requiredRole={requiredRole} />
)

export const routes = [
  {
    path: '/login',
    element: withSuspense(LoginPage),
  },
  {
    path: '/products',
    element: withProtection(ProductsPage),
  },
  {
    path: '/collections',
    element: withProtection(CollectionsPage),
  },
  {
    path: '/array-collections',
    element: withProtection(ArrayCollectionsPage),
  },
  {
    path: '/banners',
    element: withProtection(BannersPage),
  },
  {
    path: '/custom-banners',
    element: withProtection(CustomBannersPage),
  },
  {
    path: '/profile-banners',
    element: withProtection(ProfileBannersPage),
  },
  {
    path: '/about-banners',
    element: withProtection(AboutBannersPage),
  },
  {
    path: '/featured-banners',
    element: withProtection(FeaturedBannersPage),
  },
  {
    path: '/news',
    element: withProtection(NewsPage),
  },
  {
    path: '/orders',
    element: withProtection(OrdersPage),
  },
  {
    path: '/consultations',
    element: withProtection(ConsultationsPage),
  },
  {
    path: '/member-benefits',
    element: withProtection(MemberBenefitsPage),
  },
  {
    path: '/users',
    element: withProtection(UsersPage, ['admin']), // 只有 admin 可以访问用户列表
  },
  {
    path: '/consumer-users',
    element: withProtection(ConsumerUsersPage),
  },
  {
    path: '/',
    element: <Navigate to="/products" replace />,
  },
  {
    path: '*',
    element: withProtection(NotFoundPage),
  },
]
