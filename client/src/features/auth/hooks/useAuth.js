import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as authApi from '../api/authApi'
import { broadcastLogout, clearAccessToken, getAccessToken, setAccessToken } from '../../../services/authSession'
import { notificationsCleared } from '../../../store/notifications/notificationsSlice'
import { sessionAnonymous, sessionAuthenticated } from '../store/authSlice'

export default function useAuth() {
  const auth = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const signIn = useCallback(async (credentials) => {
    const context = await authApi.login(credentials)
    setAccessToken(context.accessToken)
    dispatch(sessionAuthenticated(context))
    return context
  }, [dispatch])
  const signOut = useCallback(async ({ all = false, broadcast = true } = {}) => {
    const token = getAccessToken()
    const request = token ? (all ? authApi.logoutAll(token) : authApi.logout(token)) : Promise.resolve()
    clearAccessToken()
    dispatch(sessionAnonymous())
    dispatch(notificationsCleared())
    if (broadcast) broadcastLogout()
    try { await request } catch { /* La limpieza local es obligatoria. */ }
  }, [dispatch])
  const continueSession = useCallback(async () => {
    const context = await authApi.refreshSession()
    setAccessToken(context.accessToken)
    dispatch(sessionAuthenticated(context))
  }, [dispatch])
  return { ...auth, isAuthenticated: auth.status === 'authenticated', isInitializing: auth.status === 'initializing', signIn, signOut, continueSession }
}
