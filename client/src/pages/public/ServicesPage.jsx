import Seo from '../../components/seo/Seo'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/FeedbackState'
import { siteConfig } from '../../config/site.config'
import ServiceDetailCard from '../../features/public-services/components/ServiceDetailCard'
import usePublicServices from '../../features/public-services/hooks/usePublicServices'

export default function ServicesPage() {
  const { status, data, error, retry } = usePublicServices()
  return <div className="public-page"><Seo {...siteConfig.seo.services} /><section className="public-section"><div className="container"><div className="section-heading"><h1>Servicios</h1><p>Conocé las propuestas activas del centro. La indicación concreta se define a partir de una primera orientación.</p></div>{(status === 'idle' || status === 'loading') && <LoadingState label="Cargando servicios" cards={6} />}{status === 'error' && <ErrorState message={error?.message} onRetry={retry} />}{status === 'empty' && <EmptyState title="Servicios en actualización" />}{status === 'success' && <div className="card-grid">{data.map((service) => <ServiceDetailCard key={service.id} service={service} />)}</div>}</div></section></div>
}

