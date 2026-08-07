import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import AppIcon from '../../components/icons/AppIcon'
import Button from '../../components/ui/Button'
import { PUBLIC_NAVIGATION, ROUTES } from '../../config/routes'
import { siteConfig } from '../../config/site.config'
import styles from './PublicLayout.module.css'

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  return <div className={styles.shell}><a className="skip-link" href="#contenido">Saltar al contenido</a><header className={`${styles.header} no-print`}><div className={`container ${styles.headerInner}`}><Link className={styles.brand} to={ROUTES.home}><img src={siteConfig.images.logo} alt="" /><span>{siteConfig.shortName}</span></Link><button className={styles.menuButton} type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} aria-controls="public-navigation" onClick={() => setOpen((value) => !value)}><AppIcon name={open ? 'close' : 'menu'} size={24} /></button><nav id="public-navigation" aria-label="Navegación principal" className={`${styles.nav} ${open ? styles.navOpen : ''}`}>{PUBLIC_NAVIGATION.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? styles.active : undefined}>{item.label}</NavLink>)}<Button to={ROUTES.login} variant="outline">Acceso</Button></nav></div></header><main id="contenido" className={styles.main} tabIndex={-1}><Outlet /></main><footer className={`${styles.footer} no-print`}><div className={`container ${styles.footerInner}`}><section><h2>{siteConfig.shortName}</h2><p>{siteConfig.tagline}</p><p>{siteConfig.location}</p></section><nav aria-label="Enlaces del sitio"><h3>Secciones</h3>{PUBLIC_NAVIGATION.slice(1).map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}<Link to={ROUTES.privacy}>Privacidad</Link></nav><section><h3>Contacto</h3><p>{siteConfig.phone || 'Canales de contacto en actualización.'}</p></section></div><div className={`container ${styles.legal}`}>© {new Date().getFullYear()} {siteConfig.name}</div></footer></div>
}
