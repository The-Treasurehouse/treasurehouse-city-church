export type ChurchEvent = {
  slug: string
  title: string
  date: string
  time: string
  location: string
  description: string
}

export const events: ChurchEvent[] = [
  {
    slug: "sunday-worship",
    title: "Sunday Worship Service",
    date: "Every Sunday",
    time: "9:00 AM & 11:30 AM",
    location: "Main Auditorium",
    description:
      "Join us for worship, the Word, and fellowship as a family of faith.",
  },
  {
    slug: "midweek-bible-study",
    title: "Midweek Bible Study",
    date: "Every Wednesday",
    time: "6:00 PM",
    location: "Fellowship Hall",
    description: "A deep dive into Scripture for growth and grounding in the Word.",
  },
  {
    slug: "annual-thanksgiving",
    title: "Annual Thanksgiving Service",
    date: "2026-08-16",
    time: "10:00 AM",
    location: "Main Auditorium",
    description:
      "A special service dedicated to celebrating God's faithfulness over the past year.",
  },
  {
    slug: "youth-conference",
    title: "Treasurehouse Youth Conference",
    date: "2026-09-04",
    time: "4:00 PM",
    location: "Youth Center",
    description:
      "Three days of worship, teaching, and community for teens and young adults.",
  },
]
