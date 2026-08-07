import apiClient from '../../../services/apiClient'

const allowed = ['id', 'nombre', 'descripcion', 'imagenUrl', 'ordenPublico']
const project = (item) => Object.fromEntries(allowed.map((key) => [key, item[key]]))

export async function getPublicServices({ limit, signal } = {}) {
  const params = Number.isInteger(limit) && limit > 0 && limit <= 50 ? { limit } : undefined
  const response = await apiClient.get('/public/servicios', { params, signal, skipAuth: true, skipRefresh: true })
  if (!Array.isArray(response.data?.data)) throw new Error('PUBLIC_SERVICES_CONTRACT')
  return response.data.data.map(project)
}
