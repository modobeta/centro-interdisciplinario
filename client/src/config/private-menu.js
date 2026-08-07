import { PERMISSIONS } from './permissions'
import { ROUTES } from './routes'

export const PRIVATE_MENU = [
  { to: ROUTES.dashboard, label: 'Resumen', icon: 'dashboard', permissions: [PERMISSIONS.SUMMARY_READ] },
  { to: ROUTES.patients, label: 'Pacientes', icon: 'patients', permissions: [PERMISSIONS.PATIENTS_READ_ALL, PERMISSIONS.PATIENTS_READ_LINKED] },
  { to: ROUTES.appointments, label: 'Agenda', icon: 'calendar', permissions: [PERMISSIONS.APPOINTMENTS_READ_ALL, PERMISSIONS.APPOINTMENTS_MANAGE_OWN] },
  { to: ROUTES.reports, label: 'Informes', icon: 'reports', permissions: [PERMISSIONS.REPORTS_READ_ALL, PERMISSIONS.REPORTS_READ_LINKED] },
  { to: ROUTES.messages, label: 'Mensajes', icon: 'messages', permissions: [PERMISSIONS.CONVERSATIONS_MANAGE_OWN] },
  { to: ROUTES.users, label: 'Usuarios', icon: 'users', permissions: [PERMISSIONS.USERS_READ_DIRECTORY], roles: ['administrador', 'coordinacion', 'secretaria'] },
  { to: ROUTES.servicesAdmin, label: 'Servicios', icon: 'services', permissions: [PERMISSIONS.SERVICES_MANAGE, PERMISSIONS.USERS_MANAGE_SERVICES] },
  { to: ROUTES.catalogs, label: 'Catálogos', icon: 'catalogs', permissions: [PERMISSIONS.CATALOGS_MANAGE] },
  { to: ROUTES.audit, label: 'Auditoría', icon: 'audit', permissions: [PERMISSIONS.AUDIT_READ] },
]
