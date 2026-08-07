import { useEffect, useState } from 'react'
import styles from './ui.module.css'

export default function SafeImage({ src, fallback, alt, className = '', ...props }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])
  const source = !failed && src ? src : fallback
  if (!source) return <div className={`${styles.image} ${className}`} role="img" aria-label={alt || 'Imagen no disponible'} />
  return <img className={`${styles.image} ${className}`} src={source} alt={alt} onError={() => setFailed(true)} {...props} />
}
