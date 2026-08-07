import SafeImage from '../../../components/ui/SafeImage'
import { buildFileUrl } from '../../../services/fileUrl'
import styles from './publicServices.module.css'

export default function ServiceCard({ service, detailed = false }) {
  return <article className={styles.card}><SafeImage src={buildFileUrl(service.imagenUrl)} fallback="/images/placeholders/servicio.svg" alt={`Imagen representativa de ${service.nombre}`} loading="lazy" width="560" height="420" /><div className={styles.body}><h3>{service.nombre}</h3><p>{service.descripcion || 'Información en actualización.'}</p>{detailed && <p><strong>Consultá disponibilidad a través de nuestros canales de contacto.</strong></p>}</div></article>
}
