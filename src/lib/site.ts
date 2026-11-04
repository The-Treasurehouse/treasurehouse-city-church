export const site = {
  name: "Treasurehouse City Church",
  shortName: "Treasurehouse",
  tagline: "A house of worship, a home for the family of God.",
  address: "12 Freedom Way, Lekki, Lagos, Nigeria",
  phone: "+234 800 000 0000",
  email: "hello@treasurehousecitychurch.org",
  // Short lines roll through the hero in order, then the longer statements of what we do.
  beliefs: [
    { text: "The Treasurehouse City Church", emphasis: "Treasurehouse" },
    { text: "A vibrant, Spirit-led community", emphasis: "Spirit-led" },
    { text: "With a passion for helping people", emphasis: "passion" },
    { text: "Discover and release the treasure", emphasis: "treasure" },
    { text: "Of God's glory within them", emphasis: "glory" },
    {
      text: "Cultivating authentic worship that brings people into the presence of God.",
      emphasis: "worship",
    },
    {
      text: "Growing deeper in our relationship with Christ through prayer and the study of His Word.",
      emphasis: "prayer",
    },
    { text: "Serving our community with compassion, kindness, and love.", emphasis: "compassion" },
    {
      text: "Empowering individuals to discover their spiritual gifts and use them to glorify God.",
      emphasis: "spiritual gifts",
    },
    {
      text: "Building strong relationships that reflect the unity and love of Christ.",
      emphasis: "unity",
    },
  ],
  serviceTimes: [
    { label: "Sunday Worship Service", time: "9:00 AM & 11:30 AM" },
    { label: "Midweek Bible Study", time: "Wednesdays, 6:00 PM" },
    { label: "Prayer Meeting", time: "Fridays, 6:00 PM" },
  ],
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "Facebook", href: "https://facebook.com" },
  ],
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Sermons", href: "/sermons" },
    { label: "Events", href: "/events" },
    { label: "Give", href: "/give" },
    { label: "Contact", href: "/contact" },
  ],
} as const
