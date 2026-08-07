import apiClient from '../../../services/apiClient';import { unwrap,unwrapList } from '../../../services/responseData'
export const CATALOGS={consultorios:'/consultorios',asuntos:'/asuntos',tiposInforme:'/tipos-informe'}
export const listCatalog=async(type,params,signal)=>unwrapList(await apiClient.get(CATALOGS[type],{params,signal,privateRequest:true}))
export const createCatalogItem=async(type,payload)=>unwrap(await apiClient.post(CATALOGS[type],payload,{privateRequest:true}))
export const updateCatalogItem=async(type,id,payload)=>unwrap(await apiClient.put(`${CATALOGS[type]}/${id}`,payload,{privateRequest:true}))
export const setCatalogState=async(type,id,activo)=>unwrap(await apiClient.patch(`${CATALOGS[type]}/${id}/estado`,{activo},{privateRequest:true}))
