import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import AppIcon from '../../components/icons/AppIcon'
import Button from '../../components/ui/Button'
import { hasAnyPermission } from '../../config/permissions'
import { PRIVATE_MENU } from '../../config/private-menu'
import useAuth from '../../features/auth/hooks/useAuth'
import useIdleSession from '../../features/auth/hooks/useIdleSession'
import SessionWarningModal from '../../features/auth/components/SessionWarningModal'
import styles from './PrivateLayout.module.css'

export default function PrivateLayout() {
  const [open, setOpen] = useState(false)
  const auth = useAuth()
  const idle = useIdleSession({ enabled: auth.isAuthenticated, onExpire: () => auth.signOut() })
  const menu = PRIVATE_MENU.filter((item) => hasAnyPermission(auth.permissions, item.permissions) && (!item.roles || item.roles.includes(auth.user?.rol)))
  return <div className={styles.shell}><a className="skip-link" href="#contenido-privado">Saltar al contenido</a><aside className={`${styles.sidebar} ${open ? styles.open : ''}`}><div className={styles.brand}>Mentes Luminosas</div><nav aria-label="Panel principal">{menu.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? styles.active : undefined}><AppIcon name={item.icon} /><span>{item.label}</span></NavLink>)}</nav></aside>{open && <button className={styles.backdrop} aria-label="Cerrar menú" onClick={() => setOpen(false)} />}<div className={styles.body}><header className={styles.topbar}><button type="button" className={styles.menu} onClick={() => setOpen(true)} aria-label="Abrir menú"><AppIcon name="menu" /></button><div><strong>{auth.user?.nombreCompleto || auth.user?.nombre || 'Usuario'}</strong><small>{auth.user?.rol || ''}</small></div><Button variant="ghost" onClick={() => auth.signOut()}><AppIcon name="logout" /> Salir</Button></header><main id="contenido-privado" className={styles.main} tabIndex={-1}><Outlet /></main></div><SessionWarningModal open={idle.warning} secondsRemaining={idle.secondsRemaining} onContinue={idle.continueSession} onLogout={() => auth.signOut()} /></div>
}
