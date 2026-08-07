import { Navigate, Outlet, useLocation } from 'react-router-dom'
import FeedbackState from '../components/ui/FeedbackState'
import { ROUTES } from '../config/routes'
import useAuth from '../features/auth/hooks/useAuth'

export default function ProtectedRoute() {
  const auth = useAuth()
  const location = useLocation()
  if (auth.isInitializing) return <FeedbackState type="loading" title="Restaurando sesión" />
  return auth.isAuthenticated ? <Outlet /> : <Navigate replace to={ROUTES.login} state={{ from: location }} />
}
