import { useCallback, useEffect, useRef, useState } from 'react'

const IDLE_MS = 30 * 60 * 1000
const GRACE_MS = 5 * 60 * 1000

export default function useIdleSession({ enabled, onExpire }) {
  const [warning, setWarning] = useState(false)
  const idleTimer = useRef()
  const graceTimer = useRef()
  const reset = useCallback(() => {
    window.clearTimeout(idleTimer.current); window.clearTimeout(graceTimer.current); setWarning(false)
    if (!enabled) return
    idleTimer.current = window.setTimeout(() => { setWarning(true); graceTimer.current = window.setTimeout(onExpire, GRACE_MS) }, IDLE_MS)
  }, [enabled, onExpire])
  useEffect(() => {
    if (!enabled) return undefined
    const events = ['pointerdown', 'keydown', 'touchstart']
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }))
    reset()
    return () => { events.forEach((event) => window.removeEventListener(event, reset)); window.clearTimeout(idleTimer.current); window.clearTimeout(graceTimer.current) }
  }, [enabled, reset])
  return { warning, reset, continueSession: reset }
}
