import Seo from '../../components/seo/Seo'
import Button from '../../components/ui/Button'
import { siteConfig } from '../../config/site.config'
import { buildMailtoLink, buildTelephoneLink, buildWhatsAppLink } from '../../utils/contactLinks'
import styles from './PublicPages.module.css'

export default function ContactPage() {
  const channels = [
    siteConfig.whatsapp && { title: 'WhatsApp', text: siteConfig.whatsapp, href: buildWhatsAppLink(siteConfig.whatsapp, 'Hola, quisiera solicitar orientación.') },
    siteConfig.email && { title: 'Correo', text: siteConfig.email, href: buildMailtoLink(siteConfig.email, 'Consulta desde el sitio web') },
    siteConfig.phone && { title: 'Teléfono', text: siteConfig.phone, href: buildTelephoneLink(siteConfig.phone) },
  ].filter(Boolean)
  return <div className="public-page"><Seo {...siteConfig.seo.contact} /><section className="public-section"><div className="container"><div className="section-heading"><h1>Contacto</h1><p>Elegí el canal disponible que te resulte más cómodo.</p></div>{channels.length ? <div className={styles.contactGrid}>{channels.map((channel) => <article className={styles.contactCard} key={channel.title}><h2>{channel.title}</h2><p>{channel.text}</p><Button href={channel.href} target={channel.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">Abrir canal</Button></article>)}</div> : <div className={styles.contactCard}><h2>Información en actualización</h2><p>Los canales institucionales se publicarán cuando estén confirmados.</p></div>}{siteConfig.address && <section className="public-section"><h2>Ubicación</h2><p>{siteConfig.address}</p>{siteConfig.mapEmbedUrl && <iframe title="Mapa de ubicación del centro" src={siteConfig.mapEmbedUrl} width="100%" height="420" loading="lazy" />}</section>}</div></section></div>
}

