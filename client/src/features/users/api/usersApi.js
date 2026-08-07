import apiClient from '../../../services/apiClient'; import { unwrap, unwrapList } from '../../../services/responseData'
export const listUsers=async(params,signal)=>unwrapList(await apiClient.get('/usuarios',{params,signal,privateRequest:true}))
export const getUser=async(id,signal)=>unwrap(await apiClient.get(`/usuarios/${id}`,{signal,privateRequest:true}))
export const createUser=async(payload)=>unwrap(await apiClient.post('/usuarios',payload,{privateRequest:true}))
export const updateUser=async(id,payload)=>unwrap(await apiClient.put(`/usuarios/${id}`,payload,{privateRequest:true}))
export const setUserState=async(id,activo)=>unwrap(await apiClient.patch(`/usuarios/${id}/estado`,{activo},{privateRequest:true}))
export const resetUserAccess=async(id)=>unwrap(await apiClient.patch(`/usuarios/${id}/restablecer-acceso`,null,{privateRequest:true}))
export const uploadUserPhoto=async(id,file)=>{const body=new FormData();body.append('foto',file);return unwrap(await apiClient.put(`/usuarios/${id}/foto`,body,{privateRequest:true}))}
export const deleteUserPhoto=async(id)=>unwrap(await apiClient.delete(`/usuarios/${id}/foto`,{privateRequest:true}))
