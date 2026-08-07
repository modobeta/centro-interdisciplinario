import { useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { Provider, useDispatch } from 'react-redux'
import { refreshSession } from '../features/auth/api/authApi'
import { sessionAnonymous, sessionAuthenticated } from '../features/auth/store/authSlice'
import { clearAccessToken, getSessionChannel, setAccessToken, subscribeSessionContext } from '../services/authSession'
import ToastHost from '../components/ui/ToastHost'
import { store } from './store'

function SessionBootstrap({ children }) {
  const dispatch = useDispatch()
  useEffect(() => {
    let active = true
    const apply = (context) => {
      if (!active) return
      if (context) { setAccessToken(context.accessToken); dispatch(sessionAuthenticated(context)) }
      else { clearAccessToken(); dispatch(sessionAnonymous()) }
    }
    const unsubscribe = subscribeSessionContext(apply)
    refreshSession().then(apply).catch(() => apply(null))
    const channel = getSessionChannel()
    const onMessage = (event) => { if (event.data?.type === 'logout') apply(null) }
    channel?.addEventListener('message', onMessage)
    return () => { active = false; unsubscribe(); channel?.removeEventListener('message', onMessage) }
  }, [dispatch])
  return children
}

export default function AppProviders({ children }) {
  return <Provider store={store}><HelmetProvider><SessionBootstrap>{children}</SessionBootstrap><ToastHost /></HelmetProvider></Provider>
}
