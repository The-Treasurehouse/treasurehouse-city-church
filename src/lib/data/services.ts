import {
  BookOpen,
  Users,
  Smile,
  CalendarDays,
  MessageCircle,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react"

export type ChurchService = {
  title: string
  body: string
  icon: LucideIcon
}

export const services: ChurchService[] = [
  {
    title: "Weekly Services",
    body: "Worship, the Word, and fellowship every Sunday morning.",
    icon: BookOpen,
  },
  {
    title: "Youth",
    body: "A space for teens to grow in faith and friendship.",
    icon: Users,
  },
  {
    title: "Kids",
    body: "Age-appropriate teaching that makes faith come alive.",
    icon: Smile,
  },
  {
    title: "Special Events",
    body: "Conferences, retreats, and gatherings throughout the year.",
    icon: CalendarDays,
  },
  {
    title: "Counseling",
    body: "One-on-one support for life's hardest seasons.",
    icon: MessageCircle,
  },
  {
    title: "Benevolence",
    body: "Practical care for families and individuals in need.",
    icon: HeartHandshake,
  },
]
