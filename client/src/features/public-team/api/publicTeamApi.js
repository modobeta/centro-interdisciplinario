import apiClient from '../../../services/apiClient'

const allowed = ['id', 'nombre', 'apellido', 'titulo', 'especialidad', 'funcionPublica', 'bio', 'fotoUrl', 'ordenPublico']
const project = (item) => Object.fromEntries(allowed.map((key) => [key, item[key]]))

export async function getPublicTeam({ limit, signal } = {}) {
  const params = Number.isInteger(limit) && limit > 0 && limit <= 50 ? { limit } : undefined
  const response = await apiClient.get('/public/equipo', { params, signal, skipAuth: true, skipRefresh: true })
  if (!Array.isArray(response.data?.data)) throw new Error('PUBLIC_TEAM_CONTRACT')
  return response.data.data.map(project)
}
