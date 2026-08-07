import usePermissions from '../../hooks/usePermissions'

export default function PermissionGate({ permissions, children, fallback = null }) {
  const { allowed } = usePermissions(permissions)
  return allowed ? children : fallback
}
