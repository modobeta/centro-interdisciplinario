export const formatFullName = (person = {}) =>
  [person.nombre, person.apellido].filter(Boolean).join(' ') || 'Sin nombre'

export const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Argentina/Cordoba' }).format(date)
}

export const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeZone: 'America/Argentina/Cordoba' }).format(date)
}
