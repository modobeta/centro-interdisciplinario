import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import FeedbackState from '../components/ui/FeedbackState'
import { PERMISSIONS } from '../config/permissions'
import { ROUTES } from '../config/routes'
import AuthLayout from '../layouts/AuthLayout/AuthLayout'
import PrivateLayout from '../layouts/PrivateLayout/PrivateLayout'
import PublicLayout from '../layouts/PublicLayout/PublicLayout'
import AboutPage from '../pages/public/AboutPage'
import ContactPage from '../pages/public/ContactPage'
import HomePage from '../pages/public/HomePage'
import PrivacyPage from '../pages/public/PrivacyPage'
import ServicesPage from '../pages/public/ServicesPage'
import TeamPage from '../pages/public/TeamPage'
import ForbiddenPage from '../pages/errors/ForbiddenPage'
import NotFoundPage from '../pages/errors/NotFoundPage'
import GuestRoute from './GuestRoute'
import PermissionRoute from './PermissionRoute'
import ProtectedRoute from './ProtectedRoute'
import ScrollToTop from './ScrollToTop'

const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'))
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'))
const PatientsPage = lazy(() => import('../features/patients/pages/PatientsPage'))
const PatientDetailPage = lazy(() => import('../features/patients/pages/PatientDetailPage'))
const AgendaPage = lazy(() => import('../features/appointments/pages/AgendaPage'))
const ReportsPage = lazy(() => import('../features/reports/pages/ReportsPage'))
const ReportDetailPage = lazy(() => import('../features/reports/pages/ReportDetailPage'))
const MessagesPage = lazy(() => import('../features/messages/pages/MessagesPage'))
const UsersPage = lazy(() => import('../features/users/pages/UsersPage'))
const ServicesManagementPage = lazy(() => import('../features/services/pages/ServicesManagementPage'))
const CatalogsPage = lazy(() => import('../features/catalogs/pages/CatalogsPage'))
const AuditPage = lazy(() => import('../features/audit/pages/AuditPage'))

const Wait = () => <FeedbackState type="loading" title="Cargando sección" />
const Gate = ({ permissions, roles, children }) => <Route element={<PermissionRoute permissions={permissions} roles={roles} />}>{children}</Route>

export default function AppRouter() {
  return <BrowserRouter><ScrollToTop /><Suspense fallback={<Wait />}><Routes><Route element={<PublicLayout />}><Route path={ROUTES.home} element={<HomePage />} /><Route path={ROUTES.about} element={<AboutPage />} /><Route path={ROUTES.services} element={<ServicesPage />} /><Route path={ROUTES.team} element={<TeamPage />} /><Route path={ROUTES.contact} element={<ContactPage />} /><Route path={ROUTES.privacy} element={<PrivacyPage />} /></Route><Route element={<GuestRoute />}><Route element={<AuthLayout />}><Route path={ROUTES.login} element={<LoginPage />} /></Route></Route><Route element={<ProtectedRoute />}><Route element={<PrivateLayout />}><Route path={ROUTES.app} element={<Navigate replace to={ROUTES.dashboard} />} />{Gate({ permissions: [PERMISSIONS.SUMMARY_READ], children: <Route path={ROUTES.dashboard} element={<DashboardPage />} /> })}{Gate({ permissions: [PERMISSIONS.PATIENTS_READ_ALL, PERMISSIONS.PATIENTS_READ_LINKED], children: <><Route path={ROUTES.patients} element={<PatientsPage />} /><Route path={`${ROUTES.patients}/:patientId`} element={<PatientDetailPage />} /></> })}{Gate({ permissions: [PERMISSIONS.APPOINTMENTS_READ_ALL, PERMISSIONS.APPOINTMENTS_MANAGE_OWN], children: <Route path={ROUTES.appointments} element={<AgendaPage />} /> })}{Gate({ permissions: [PERMISSIONS.REPORTS_READ_ALL, PERMISSIONS.REPORTS_READ_LINKED], children: <><Route path={ROUTES.reports} element={<ReportsPage />} /><Route path={`${ROUTES.reports}/:reportId`} element={<ReportDetailPage />} /></> })}{Gate({ permissions: [PERMISSIONS.CONVERSATIONS_MANAGE_OWN], children: <Route path={ROUTES.messages} element={<MessagesPage />} /> })}{Gate({ permissions: [PERMISSIONS.USERS_READ_DIRECTORY], roles: ['administrador', 'coordinacion', 'secretaria'], children: <Route path={ROUTES.users} element={<UsersPage />} /> })}{Gate({ permissions: [PERMISSIONS.SERVICES_MANAGE, PERMISSIONS.USERS_MANAGE_SERVICES], children: <Route path={ROUTES.servicesAdmin} element={<ServicesManagementPage />} /> })}{Gate({ permissions: [PERMISSIONS.CATALOGS_MANAGE], children: <Route path={ROUTES.catalogs} element={<CatalogsPage />} /> })}{Gate({ permissions: [PERMISSIONS.AUDIT_READ], children: <Route path={ROUTES.audit} element={<AuditPage />} /> })}<Route path={ROUTES.forbidden} element={<ForbiddenPage />} /></Route></Route><Route path="*" element={<PublicLayout />}><Route path="*" element={<NotFoundPage />} /></Route></Routes></Suspense></BrowserRouter>
}
