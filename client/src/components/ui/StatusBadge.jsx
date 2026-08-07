import styles from './ui.module.css'

const tones = { activo: 'success', confirmada: 'success', confirmado: 'success', completado: 'success', finalizado: 'success', pendiente: 'warning', borrador: 'warning', ausente: 'dangerTone', cancelado: 'dangerTone', inactivo: 'dangerTone' }

export default function StatusBadge({ value }) {
  const normalized = String(value || 'sin estado').toLowerCase()
  return <span className={`${styles.badge} ${styles[tones[normalized]] || ''}`}>{normalized}</span>
}

