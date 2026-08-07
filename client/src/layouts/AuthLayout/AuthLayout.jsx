import { Link, Outlet } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import styles from './AuthLayout.module.css'

export default function AuthLayout() {
  return <main className={styles.shell}><div className={styles.card}><Link className={styles.back} to={ROUTES.home}>← Volver al sitio</Link><Outlet /></div></main>
}
