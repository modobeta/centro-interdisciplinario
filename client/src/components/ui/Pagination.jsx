import Button from './Button'
import styles from './ui.module.css'

export default function Pagination({ page = 1, totalPages = 1, onChange }) {
  if (totalPages <= 1) return null
  return <nav aria-label="Paginación" className={styles.pagination}><Button variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>Anterior</Button><span>Página {page} de {totalPages}</span><Button variant="outline" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Siguiente</Button></nav>
}

