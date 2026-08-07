import { useState } from 'react'
import Button from '../../../components/ui/Button'
import FeedbackState from '../../../components/ui/FeedbackState'
import MetricsGrid from '../components/MetricsGrid'
import SummaryDetail from '../components/SummaryDetail'
import useDashboard from '../hooks/useDashboard'

export default function DashboardPage() {
  const remote = useDashboard(); const [selected, setSelected] = useState(null)
  return <div className="private-page"><header className="page-header"><div><h1>Resumen</h1><p>Indicadores disponibles para tu rol.</p></div><Button variant="outline" loading={remote.refreshing} onClick={remote.refresh}>Actualizar</Button></header>{remote.status === 'loading' && <FeedbackState title="Cargando resumen" />}{remote.status === 'error' && <FeedbackState type="error" message={remote.error.message} onRetry={remote.refresh} />}{remote.status === 'success' && <><MetricsGrid cards={remote.data?.cards || []} selected={selected} onSelect={setSelected} /><SummaryDetail metric={selected} /></>}{remote.status === 'empty' && <FeedbackState type="empty" title="Sin métricas disponibles" />}</div>
}
