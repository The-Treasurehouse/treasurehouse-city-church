import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${site.name}'s mission, beliefs, and leadership.`,
};

const beliefs = [
  {
    title: "The Scriptures",
    body: "We believe the Bible is the inspired, authoritative Word of God and the foundation for faith and life.",
  },
  {
    title: "The Trinity",
    body: "We believe in one God, eternally existing in three persons: Father, Son, and Holy Spirit.",
  },
  {
    title: "Salvation",
    body: "We believe salvation is a gift of God's grace, received through faith in Jesus Christ alone.",
  },
  {
    title: "The Church",
    body: "We believe the Church is the body of Christ, called to worship, disciple, and serve the world.",
  },
];

const leaders = [
  { name: "Pastor Emeka Johnson", role: "Senior Pastor" },
  { name: "Pastor Grace Johnson", role: "Co-Pastor" },
  { name: "Minister Daniel Okafor", role: "Associate Minister" },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-ink">
            About Us
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-foreground sm:text-5xl">
            Our Story
          </h1>
          <p className="mt-6 text-lg text-muted">
            {site.name} was planted with a simple conviction: that every
            person deserves a place to belong, grow, and discover who God
            made them to be. What began as a handful of families gathered in
            a living room has grown into a church family committed to
            worship, discipleship, and service.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Our Mission
            </h2>
            <p className="mt-4 text-muted">
              To lead people into a growing relationship with Jesus Christ,
              build a Christ-centered family of believers, and serve our city
              with the love of God.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Our Vision
            </h2>
            <p className="mt-4 text-muted">
              A church without walls, raising disciples who carry the
              presence of God into every sphere of society, one life at a
              time.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-center font-serif text-3xl font-semibold text-foreground">
            What We Believe
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {beliefs.map((b) => (
              <div key={b.title}>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {b.title}
                </h3>
                <p className="mt-2 text-muted">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center font-serif text-3xl font-semibold text-foreground">
          Our Leadership
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {leaders.map((l) => (
            <div key={l.name} className="text-center">
              <div className="mx-auto aspect-square w-32 rounded-full border border-border bg-card" />
              <p className="mt-4 font-serif text-lg font-semibold text-foreground">
                {l.name}
              </p>
              <p className="text-sm text-muted">{l.role}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
