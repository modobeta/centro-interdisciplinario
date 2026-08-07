import { Navigate, Outlet } from 'react-router-dom'
import FeedbackState from '../components/ui/FeedbackState'
import { ROUTES } from '../config/routes'
import useAuth from '../features/auth/hooks/useAuth'

export default function GuestRoute() {
  const auth = useAuth()
  if (auth.isInitializing) return <FeedbackState type="loading" title="Comprobando sesión" />
  return auth.isAuthenticated ? <Navigate replace to={ROUTES.dashboard} /> : <Outlet />
}
