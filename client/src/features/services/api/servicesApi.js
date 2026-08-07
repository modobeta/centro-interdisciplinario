import apiClient from '../../../services/apiClient';import { unwrap,unwrapList } from '../../../services/responseData'
export const listServices=async(params,signal)=>unwrapList(await apiClient.get('/servicios',{params,signal,privateRequest:true}))
export const createService=async(payload)=>unwrap(await apiClient.post('/servicios',payload,{privateRequest:true}))
export const updateService=async(id,payload)=>unwrap(await apiClient.put(`/servicios/${id}`,payload,{privateRequest:true}))
export const uploadServiceImage=async(id,file)=>{const body=new FormData();body.append('imagen',file);return unwrap(await apiClient.put(`/servicios/${id}/imagen`,body,{privateRequest:true}))}
export const deleteServiceImage=async(id)=>unwrap(await apiClient.delete(`/servicios/${id}/imagen`,{privateRequest:true}))
