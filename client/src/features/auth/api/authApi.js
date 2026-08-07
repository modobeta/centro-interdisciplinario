import apiClient from '../../../services/apiClient'

const unwrap = ({ data }) => data.data

export const login = async (credentials) => unwrap(await apiClient.post('/auth/login', credentials, { skipAuth: true, skipRefresh: true, withCredentials: true }))
export const refreshSession = async () => unwrap(await apiClient.post('/auth/refresh', null, { skipAuth: true, skipRefresh: true, withCredentials: true }))
export const logout = async (token) => apiClient.post('/auth/logout', null, { privateRequest: true, skipRefresh: true, headers: { Authorization: `Bearer ${token}` } })
export const logoutAll = async (token) => apiClient.post('/auth/logout-todas', null, { privateRequest: true, skipRefresh: true, headers: { Authorization: `Bearer ${token}` } })
