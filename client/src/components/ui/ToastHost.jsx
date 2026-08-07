import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { notificationRemoved } from '../../store/notifications/notificationsSlice'

export default function ToastHost() {
  const items = useSelector((state) => state.notifications)
  const dispatch = useDispatch()
  useEffect(() => {
    const timers = items.map((item) => window.setTimeout(() => dispatch(notificationRemoved(item.id)), 5000))
    return () => timers.forEach(window.clearTimeout)
  }, [dispatch, items])
  return <div aria-live="polite" className="toast-host no-print">{items.map((item) => <div className={`toast toast--${item.tone}`} key={item.id}>{item.message}<button type="button" aria-label="Cerrar aviso" onClick={() => dispatch(notificationRemoved(item.id))}>×</button></div>)}</div>
}
