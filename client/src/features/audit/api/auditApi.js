import apiClient from '../../../services/apiClient';import { unwrapList } from '../../../services/responseData'
export const listAudit=async(params,signal)=>unwrapList(await apiClient.get('/auditoria',{params,signal,privateRequest:true}))
