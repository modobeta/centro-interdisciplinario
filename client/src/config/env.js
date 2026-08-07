const DEFAULTS = {
  apiBaseUrl: 'http://localhost:3000/api/v1',
  filesBaseUrl: 'http://localhost:3000',
  siteUrl: 'http://localhost:5173',
  appName: 'C.E.I.T. Mentes Luminosas',
}

function parseHttpUrl(value, fallback, label) {
  const candidate = value?.trim() || fallback
  try {
    const url = new URL(candidate)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    return url.toString().replace(/\/$/, '')
  } catch {
    throw new Error(`${label} debe ser una URL HTTP válida.`)
  }
}

export const env = Object.freeze({
  apiBaseUrl: parseHttpUrl(import.meta.env.VITE_API_BASE_URL, DEFAULTS.apiBaseUrl, 'VITE_API_BASE_URL'),
  filesBaseUrl: parseHttpUrl(import.meta.env.VITE_FILES_BASE_URL, DEFAULTS.filesBaseUrl, 'VITE_FILES_BASE_URL'),
  siteUrl: parseHttpUrl(import.meta.env.VITE_SITE_URL, DEFAULTS.siteUrl, 'VITE_SITE_URL'),
  appName: import.meta.env.VITE_APP_NAME?.trim() || DEFAULTS.appName,
  isProduction: import.meta.env.PROD,
})
