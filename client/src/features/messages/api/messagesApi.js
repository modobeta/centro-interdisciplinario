import apiClient from '../../../services/apiClient';import { unwrap,unwrapList } from '../../../services/responseData'
export const unreadSummary=async(signal)=>unwrap(await apiClient.get('/conversaciones/no-leidas/resumen',{signal,privateRequest:true}))
export const listConversations=async(params,signal)=>unwrapList(await apiClient.get('/conversaciones',{params,signal,privateRequest:true}))
export const createConversation=async(payload)=>unwrap(await apiClient.post('/conversaciones',payload,{privateRequest:true}))
export const getConversation=async(id,signal)=>unwrap(await apiClient.get(`/conversaciones/${id}`,{signal,privateRequest:true}))
export const listMessages=async(id,params,signal)=>unwrapList(await apiClient.get(`/conversaciones/${id}/mensajes`,{params,signal,privateRequest:true}))
export const sendMessage=async(id,contenido)=>unwrap(await apiClient.post(`/conversaciones/${id}/mensajes`,{contenido},{privateRequest:true}))
export const markRead=async(id)=>unwrap(await apiClient.patch(`/conversaciones/${id}/leida`,null,{privateRequest:true}))
export const archiveConversation=async(id,archived=true)=>unwrap(await apiClient.patch(`/conversaciones/${id}/${archived?'archivar':'desarchivar'}`,null,{privateRequest:true}))
