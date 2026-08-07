import { useState } from 'react'
import styles from './PublicPages.module.css'

export default function InstitutionalImage({ src, alt, eager = false }) {
  const [failed, setFailed] = useState(false)
  return <div className={styles.media}>{!failed && src ? <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} onError={() => setFailed(true)} /> : <div className={styles.placeholder} role="img" aria-label={alt}>Imagen institucional en preparación</div>}</div>
}
