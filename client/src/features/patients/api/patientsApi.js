import apiClient from '../../../services/apiClient'
import { unwrap, unwrapList } from '../../../services/responseData'
export async function listPatients(params, signal) { return unwrapList(await apiClient.get('/pacientes', { params, signal, privateRequest: true })) }
export async function getPatient(id, signal) { return unwrap(await apiClient.get(`/pacientes/${id}`, { signal, privateRequest: true })) }
export async function createPatient(payload) { return unwrap(await apiClient.post('/pacientes', payload, { privateRequest: true })) }
export async function updatePatient(id, payload) { return unwrap(await apiClient.put(`/pacientes/${id}`, payload, { privateRequest: true })) }
export async function setPatientState(id, activo) { return unwrap(await apiClient.patch(`/pacientes/${id}/estado`, { activo }, { privateRequest: true })) }
export async function listPatientLinks(id, signal) { return unwrapList(await apiClient.get(`/pacientes/${id}/vinculos`, { signal, privateRequest: true })) }
export async function linkProvider(id, usuarioId) { return unwrap(await apiClient.post(`/pacientes/${id}/vinculos`, { usuarioId }, { privateRequest: true })) }
export async function unlinkProvider(id, usuarioId) { return unwrap(await apiClient.patch(`/pacientes/${id}/vinculos/${usuarioId}/desvincular`, null, { privateRequest: true })) }
