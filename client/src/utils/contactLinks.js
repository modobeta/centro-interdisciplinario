const digitsOnly = (value = '') => value.replace(/\D/g, '')

export function buildWhatsAppLink(phone, message = '') {
  const digits = digitsOnly(phone)
  if (!digits) return null
  const text = message.trim() ? `?text=${encodeURIComponent(message.trim())}` : ''
  return `https://wa.me/${digits}${text}`
}

export function buildMailtoLink(email, subject = '') {
  if (!email?.includes('@')) return null
  return subject.trim() ? `mailto:${email}?subject=${encodeURIComponent(subject.trim())}` : `mailto:${email}`
}

export function buildTelephoneLink(phone) {
  const digits = digitsOnly(phone)
  return digits ? `tel:+${digits}` : null
}
