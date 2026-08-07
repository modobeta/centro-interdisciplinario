import { icons } from './icons'

export default function AppIcon({ name, label, size = 18 }) {
  const Icon = icons[name] || icons.list
  return <Icon size={size} aria-hidden={label ? undefined : true} aria-label={label} />
}
