import SafeImage from '../../../components/ui/SafeImage'
import { buildFileUrl } from '../../../services/fileUrl'
import { formatFullName } from '../../../utils/formatters'
import { truncateText } from '../../../utils/text'
import styles from './publicTeam.module.css'

export default function TeamMemberCard({ member, preview = false }) {
  const fullName = formatFullName(member)
  return <article className={styles.card}><SafeImage src={buildFileUrl(member.fotoUrl)} fallback="/images/placeholders/profesional.svg" alt={`Fotografía de ${fullName}`} loading="lazy" width="480" height="480" /><div className={styles.body}><h3>{member.titulo ? `${member.titulo} ${fullName}` : fullName}</h3><p className={styles.role}>{member.funcionPublica || member.especialidad || 'Integrante del equipo'}</p>{member.bio && <p className={styles.bio}>{preview ? truncateText(member.bio) : member.bio}</p>}</div></article>
}
