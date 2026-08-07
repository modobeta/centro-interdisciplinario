import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    window.requestAnimationFrame(() => document.querySelector('main')?.focus())
  }, [pathname])
  return null
}
