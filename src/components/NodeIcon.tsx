import {
  AlertTriangle,
  Book,
  Brain,
  Calendar,
  Check,
  Flame,
  Heart,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  Pin,
  Rocket,
  Star,
  Target,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  lightbulb: Lightbulb,
  star: Star,
  flame: Flame,
  check: Check,
  'help-circle': HelpCircle,
  'alert-triangle': AlertTriangle,
  pin: Pin,
  target: Target,
  book: Book,
  brain: Brain,
  'message-circle': MessageCircle,
  wrench: Wrench,
  rocket: Rocket,
  heart: Heart,
  calendar: Calendar,
}

export function NodeIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = ICONS[name]
  if (!Icon) return null
  return <Icon size={size} />
}
