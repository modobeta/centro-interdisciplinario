import { env } from '../config/env'

export function buildCanonical(path = '/') {
  if (!env.isProduction && new URL(env.siteUrl).hostname === 'localhost') return null
  return new URL(path.replace(/^\/+/, ''), `${env.siteUrl}/`).toString()
}

export function buildPageTitle(title) {
  return title ? `${title} | ${env.appName}` : env.appName
}
