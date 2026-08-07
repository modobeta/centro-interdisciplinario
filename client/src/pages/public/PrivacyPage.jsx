import Seo from '../../components/seo/Seo'
import { siteConfig } from '../../config/site.config'

export default function PrivacyPage() {
  return <div className="public-page"><Seo {...siteConfig.seo.privacy} noIndex /><section className="public-section"><article className="container prose"><h1>Privacidad</h1><p><strong>Documento inicial sujeto a revisión legal antes de producción.</strong></p><p>El sitio público no utiliza analítica, píxeles publicitarios ni formularios de contacto. Los enlaces de contacto abren servicios externos elegidos por la persona visitante.</p><p>El panel privado procesa información operativa y clínica únicamente para usuarios autenticados y autorizados. La API aplica permisos y registra las operaciones previstas sin almacenar contenido clínico en los eventos de auditoría.</p><p>Los datos personales no deben enviarse por canales públicos sin confirmar previamente el medio apropiado con el centro.</p></article></section></div>
}
