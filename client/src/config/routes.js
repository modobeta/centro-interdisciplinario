export const ROUTES = Object.freeze({
  home: '/',
  about: '/nosotros',
  services: '/servicios',
  team: '/equipo',
  contact: '/contacto',
  privacy: '/privacidad',
  login: '/login',
  app: '/app',
  dashboard: '/app/resumen',
  patients: '/app/pacientes',
  appointments: '/app/agenda',
  reports: '/app/informes',
  messages: '/app/mensajes',
  users: '/app/usuarios',
  servicesAdmin: '/app/servicios',
  catalogs: '/app/catalogos',
  audit: '/app/auditoria',
  forbidden: '/app/403',
})

export const PUBLIC_NAVIGATION = [
  { to: ROUTES.home, label: 'Inicio', end: true },
  { to: ROUTES.about, label: 'Nosotros' },
  { to: ROUTES.services, label: 'Servicios' },
  { to: ROUTES.team, label: 'Equipo' },
  { to: ROUTES.contact, label: 'Contacto' },
]
