let accessToken = null
const contextListeners = new Set()

export const getAccessToken = () => accessToken
export const setAccessToken = (token) => { accessToken = token || null }
export const clearAccessToken = () => { accessToken = null }
export const subscribeSessionContext = (listener) => { contextListeners.add(listener); return () => contextListeners.delete(listener) }
export const publishSessionContext = (context) => contextListeners.forEach((listener) => listener(context))

let channel
export function getSessionChannel() {
  if (typeof BroadcastChannel === 'undefined') return null
  channel ||= new BroadcastChannel('ceit-session')
  return channel
}

export function broadcastLogout() {
  getSessionChannel()?.postMessage({ type: 'logout' })
}
