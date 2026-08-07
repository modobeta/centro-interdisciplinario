import Button from './Button'
import styles from './ui.module.css'

export function LoadingState({ label = 'Cargando información…', cards = 3 }) {
  return <div aria-label={label} aria-busy="true" className="card-grid">{Array.from({ length: cards }, (_, index) => <div className={styles.skeleton} key={index} />)}</div>
}

export function EmptyState({ title = 'No hay información disponible', message = 'Todavía no hay registros para mostrar.' }) {
  return <div className={styles.feedback}><h3>{title}</h3><p>{message}</p></div>
}

export function ErrorState({ message = 'No pudimos cargar esta información.', onRetry }) {
  return <div className={styles.feedback} role="alert"><h3>Ocurrió un problema</h3><p>{message}</p>{onRetry && <Button variant="outline" onClick={onRetry}>Reintentar</Button>}</div>
}

export default function FeedbackState({ type = 'loading', title, message, onRetry }) {
  if (type === 'error') return <ErrorState message={message || title} onRetry={onRetry} />
  if (type === 'empty') return <EmptyState title={title} message={message} />
  return <LoadingState label={title} />
}
