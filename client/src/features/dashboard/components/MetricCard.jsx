import { Link } from 'react-router-dom'
const LINKS = { patients: '/app/pacientes', appointmentsToday: '/app/agenda', pendingAppointments: '/app/agenda', reportDrafts: '/app/informes', reports: '/app/informes', unreadConversations: '/app/mensajes', users: '/app/usuarios', services: '/app/servicios', recentAuditEvents: '/app/auditoria' }

export default function MetricCard({ metric, selected, onSelect }) {
  return <article className={`panel ${selected ? 'is-selected' : ''}`}><button type="button" className="metric-button" onClick={() => onSelect(metric)}><span>{metric.label}</span><strong>{metric.count}</strong></button>{LINKS[metric.key] && <Link to={LINKS[metric.key]}>Ver detalle</Link>}</article>
}
