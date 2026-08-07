import { Link } from 'react-router-dom'
import styles from './ui.module.css'

export default function Button({ children, variant = 'primary', loading = false, to, href, className = '', ...props }) {
  const classes = `${styles.button} ${styles[variant]} ${className}`
  if (to) return <Link className={classes} to={to} {...props}>{children}</Link>
  if (href) return <a className={classes} href={href} {...props}>{children}</a>
  return <button type="button" className={classes} disabled={loading || props.disabled} {...props}>{loading ? 'Procesando…' : children}</button>
}

