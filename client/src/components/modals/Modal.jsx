import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import AppIcon from '../icons/AppIcon'
import styles from './Modal.module.css'

export default function Modal({ open, title, children, footer, onClose, busy = false, wide = false }) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const returnFocusRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    returnFocusRef.current = document.activeElement
    document.body.style.overflow = 'hidden'
    const dialog = dialogRef.current
    const focusable = dialog?.querySelector('input, select, textarea, button, a[href]')
    ;(focusable || dialog)?.focus()
    const handleKey = (event) => {
      if (event.key === 'Escape' && !busy) onClose()
      if (event.key !== 'Tab' || !dialog) return
      const elements = [...dialog.querySelectorAll('input, select, textarea, button, a[href]')].filter((element) => !element.disabled)
      if (!elements.length) return
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
      returnFocusRef.current?.focus?.()
    }
  }, [busy, onClose, open])

  if (!open) return null
  return createPortal(<div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}><section ref={dialogRef} className={`${styles.dialog} ${wide ? styles.wide : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}><header className={styles.header}><h2 id={titleId}>{title}</h2><button type="button" className={styles.close} aria-label="Cerrar" disabled={busy} onClick={onClose}><AppIcon name="close" /></button></header><div className={styles.body}>{children}</div>{footer && <footer className={styles.footer}>{footer}</footer>}</section></div>, document.body)
}
