import Button from '../../components/ui/Button'
import Seo from '../../components/seo/Seo'
import { ROUTES } from '../../config/routes'

export default function NotFoundPage() {
  return <section className="container public-section"><Seo title="Página no encontrada" noindex /><h1>Página no encontrada</h1><p>La dirección ingresada no corresponde a una página disponible.</p><Button to={ROUTES.home}>Ir al inicio</Button></section>
}
