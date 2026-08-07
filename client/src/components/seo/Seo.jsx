import { Helmet } from 'react-helmet-async'
import { buildCanonical, buildPageTitle } from '../../utils/seo'

export default function Seo({ title, description, path, noIndex = false }) {
  const canonical = buildCanonical(path)
  const pageTitle = buildPageTitle(title)
  return <Helmet><title>{pageTitle}</title><meta name="description" content={description} /><meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />{canonical && <link rel="canonical" href={canonical} />}{canonical && <meta property="og:url" content={canonical} />}<meta property="og:type" content="website" /><meta property="og:title" content={pageTitle} /><meta property="og:description" content={description} /><meta name="twitter:card" content="summary" /></Helmet>
}
