import styles from './ui.module.css'

export default function FormField({ id, label, error, help, children }) {
  const describedBy = [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {typeof children === 'function' ? children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy, className: styles.input }) : children}
      {help && <span id={`${id}-help`} className={styles.help}>{help}</span>}
      {error && <span id={`${id}-error`} className={styles.error} role="alert">{error}</span>}
    </div>
  )
}

