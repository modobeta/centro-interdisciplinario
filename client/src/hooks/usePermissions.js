import { useSelector } from 'react-redux'
import { hasAnyPermission } from '../config/permissions'

export default function usePermissions(required = []) {
  const permissions = useSelector((state) => state.auth.permissions)
  return { permissions, allowed: hasAnyPermission(permissions, required), has: (permission) => permissions.includes(permission), hasAny: (items) => hasAnyPermission(permissions, items) }
}
