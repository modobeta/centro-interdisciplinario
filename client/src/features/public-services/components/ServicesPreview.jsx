import { EmptyState, ErrorState, LoadingState } from '../../../components/ui/FeedbackState'
import usePublicServices from '../hooks/usePublicServices'
import ServiceCard from './ServiceCard'

export default function ServicesPreview({ limit = 4 }) {
  const { status, data, error, retry } = usePublicServices({ limit })
  if (status === 'loading' || status === 'idle') return <LoadingState label="Cargando servicios" cards={limit} />
  if (status === 'error') return <ErrorState message={error?.message} onRetry={retry} />
  if (status === 'empty') return <EmptyState title="Servicios en actualización" message="Estamos preparando la información de nuestros servicios." />
  return <div className="card-grid">{data.map((service) => <ServiceCard service={service} key={service.id} />)}</div>
}
