import apiClient from '../../../services/apiClient';import { unwrap,unwrapList } from '../../../services/responseData'
export const listAppointments=async(params,signal)=>unwrapList(await apiClient.get('/turnos',{params,signal,privateRequest:true}))
export const getAppointment=async(id,signal)=>unwrap(await apiClient.get(`/turnos/${id}`,{signal,privateRequest:true}))
export const getAvailability=async(params,signal)=>unwrap(await apiClient.get('/turnos/disponibilidad',{params,signal,privateRequest:true}))
export const createAppointment=async(payload)=>unwrap(await apiClient.post('/turnos',payload,{privateRequest:true}))
export const transitionAppointment=async(id,action,payload)=>unwrap(await apiClient.patch(`/turnos/${id}/${action}`,payload||null,{privateRequest:true}))
export const cancelAppointment=(id,motivo)=>transitionAppointment(id,'cancelar',{motivo})
