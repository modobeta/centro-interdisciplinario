import axios from 'axios'
import { env } from '../config/env'
import { clearAccessToken, getAccessToken, publishSessionContext, setAccessToken } from './authSession'
import { normalizeError } from './errorNormalizer'

const apiClient = axios.create({ baseURL: env.apiBaseUrl, timeout: 15000 })
let refreshPromise = null

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token && !config.skipAuth) config.headers.Authorization = `Bearer ${token}`
  if (config.privateRequest || config.withCredentials) config.withCredentials = true
  return config
})

apiClient.interceptors.response.use((response) => response, async (error) => {
  const original = error.config || {}
  const eligible = error.response?.status === 401 && !original.skipRefresh && !original._retry && !original.signal?.aborted
  if (!eligible) return Promise.reject(normalizeError(error))
  original._retry = true
  refreshPromise ||= apiClient.post('/auth/refresh', null, { skipAuth: true, skipRefresh: true, withCredentials: true })
    .then(({ data }) => {
      setAccessToken(data.data.accessToken)
      publishSessionContext(data.data)
      return data.data.accessToken
    })
    .catch((refreshError) => {
      clearAccessToken()
      publishSessionContext(null)
      throw refreshError
    })
    .finally(() => { refreshPromise = null })
  try {
    const token = await refreshPromise
    if (original.signal?.aborted) return Promise.reject(normalizeError({ code: 'ERR_CANCELED' }))
    original.headers = { ...original.headers, Authorization: `Bearer ${token}` }
    return apiClient(original)
  } catch (refreshError) {
    return Promise.reject(refreshError?.code ? refreshError : normalizeError(refreshError))
  }
})

export default apiClient
