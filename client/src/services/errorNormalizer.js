import axios from 'axios'

const safeMessages = {
  CREDENCIALES_INVALIDAS: 'Los datos ingresados no son válidos.',
  LOGIN_LIMITE_EXCEDIDO: 'Se alcanzó el límite de intentos. Intentá nuevamente más tarde.',
  FORBIDDEN: 'No tenés permiso para realizar esta acción.',
  VALIDATION_ERROR: 'Revisá los datos ingresados.',
}

export function normalizeError(error) {
  if (axios.isCancel(error) || error?.code === 'ERR_CANCELED') return { status: null, code: 'REQUEST_CANCELED', message: '', details: [], fieldErrors: {}, retryable: false, canceled: true }
  const status = error?.response?.status ?? null
  const remote = error?.response?.data?.error || {}
  const details = Array.isArray(remote.details) ? remote.details : []
  const fieldErrors = details.reduce((result, detail) => {
    const field = detail.field || detail.path
    if (field && detail.message) result[field] = detail.message
    return result
  }, {})
  const code = remote.code || (error?.code === 'ECONNABORTED' ? 'TIMEOUT' : status ? 'HTTP_ERROR' : 'NETWORK_ERROR')
  const message = safeMessages[code] || (status === 403 ? 'No tenés permiso para realizar esta acción.' : status === 409 ? 'La operación entra en conflicto con información actual.' : status === 422 ? 'Revisá los datos ingresados.' : status >= 500 || !status ? 'No pudimos comunicarnos con el servicio.' : remote.message || 'No pudimos completar la operación.')
  return { status, code, message, details, fieldErrors, retryable: !status || status >= 500, canceled: false }
}
