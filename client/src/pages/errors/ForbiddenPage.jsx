import Button from '../../components/ui/Button'
import Seo from '../../components/seo/Seo'
import { ROUTES } from '../../config/routes'

export default function ForbiddenPage() {
  return <section className="container public-section"><Seo title="Acceso restringido" noindex /><h1>Acceso restringido</h1><p>No tenés permisos para ver esta sección.</p><Button to={ROUTES.dashboard}>Volver al resumen</Button></section>
}
