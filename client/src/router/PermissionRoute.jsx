import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { hasAnyPermission } from '../config/permissions'
import { ROUTES } from '../config/routes'

export default function PermissionRoute({ permissions = [], roles = [] }) {
  const { permissions: effective = [], user } = useSelector((state) => state.auth)
  const allowed = hasAnyPermission(effective, permissions) && (roles.length === 0 || roles.includes(user?.rol))
  return allowed ? <Outlet /> : <Navigate replace to={ROUTES.forbidden} />
}
