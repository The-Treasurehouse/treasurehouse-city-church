export type Sermon = {
  slug: string
  title: string
  speaker: string
  series: string
  date: string
  summary: string
}

export const sermons: Sermon[] = [
  {
    slug: "a-table-for-all",
    title: "A Table for All",
    speaker: "Pastor Grace Johnson",
    series: "Foundations",
    date: "2026-07-12",
    summary:
      "Why the family of God has room for everyone, drawn from Luke 14:15-24.",
  },
  {
    slug: "rooted-in-the-word",
    title: "Rooted in the Word",
    speaker: "Pastor Emeka Johnson",
    series: "Foundations",
    date: "2026-07-05",
    summary:
      "What it means to build a life that doesn't shift when the seasons change, drawn from Matthew 7:24-27.",
  },
  {
    slug: "a-generous-heart",
    title: "A Generous Heart",
    speaker: "Pastor Grace Johnson",
    series: "Foundations",
    date: "2026-06-28",
    summary:
      "Exploring what Scripture says about giving as an act of worship, not obligation.",
  },
  {
    slug: "walking-in-faith",
    title: "Walking in Faith, Not by Sight",
    speaker: "Pastor Emeka Johnson",
    series: "Faith for the Journey",
    date: "2026-06-21",
    summary:
      "A message on trusting God through uncertain seasons, anchored in 2 Corinthians 5:7.",
  },
  {
    slug: "the-power-of-prayer",
    title: "The Power of Prayer",
    speaker: "Minister Daniel Okafor",
    series: "Faith for the Journey",
    date: "2026-06-14",
    summary:
      "Why prayer is the church's first response, not its last resort.",
  },
]
