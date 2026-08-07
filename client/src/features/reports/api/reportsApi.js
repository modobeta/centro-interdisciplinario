import apiClient from '../../../services/apiClient';import { unwrap,unwrapList } from '../../../services/responseData'
export const listReports=async(params,signal)=>unwrapList(await apiClient.get('/informes',{params,signal,privateRequest:true}))
export const getReport=async(id,signal)=>unwrap(await apiClient.get(`/informes/${id}`,{signal,privateRequest:true}))
export const createReport=async(payload)=>unwrap(await apiClient.post('/informes',payload,{privateRequest:true}))
export const updateReport=async(id,payload)=>unwrap(await apiClient.put(`/informes/${id}`,payload,{privateRequest:true}))
export const finalizeReport=async(id,expectedVersion)=>unwrap(await apiClient.patch(`/informes/${id}/finalizar`,{expectedVersion},{privateRequest:true}))
