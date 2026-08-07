import apiClient from '../../../services/apiClient'
import { unwrap } from '../../../services/responseData'

export async function getSummary(signal) {
  const response = await apiClient.get('/resumen', { signal, privateRequest: true })
  return unwrap(response)
}
