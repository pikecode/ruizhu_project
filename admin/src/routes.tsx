import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import Loading from '@/components/Loading'

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
const UsersPage = lazy(() => import('@/pages/Users'))
const ConsumerUsersPage = lazy(() => import('@/pages/ConsumerUsers'))
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
    path: '/profile-banners',
    element: withSuspense(ProfileBannersPage),
  },
  {
    path: '/about-banners',
    element: withSuspense(AboutBannersPage),
  },
  {
    path: '/featured-banners',
    element: withSuspense(FeaturedBannersPage),
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
    path: '/consumer-users',
    element: withSuspense(ConsumerUsersPage),
  },
  {
    path: '/',
    element: <Navigate to="/products" replace />,
  },
  {
    path: '*',
    element: withSuspense(NotFoundPage),
  },
]
