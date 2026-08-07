export const truncateText = (value = '', length = 140) => {
  const normalized = value.trim()
  return normalized.length <= length ? normalized : `${normalized.slice(0, length).trimEnd()}…`
}
