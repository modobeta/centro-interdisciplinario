import { env } from '../config/env'

export function buildFileUrl(path) {
  if (!path || typeof path !== 'string') return null
  try {
    const url = new URL(path, `${env.filesBaseUrl}/`)
    const allowedOrigin = new URL(env.filesBaseUrl).origin
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== allowedOrigin) return null
    return url.toString()
  } catch {
    return null
  }
}
