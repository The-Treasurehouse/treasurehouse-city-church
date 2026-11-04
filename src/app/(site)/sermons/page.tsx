import type { Metadata } from "next";
import { site } from "@/lib/site";
import { sermons } from "@/lib/data/sermons";
import { formatDate } from "@/lib/date";

export const metadata: Metadata = {
  title: "Sermons",
  description: `Watch and listen to messages from ${site.name}.`,
};

export default function SermonsPage() {
  return (
    <>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-ink">
            Messages
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-foreground sm:text-5xl">
            Sermons
          </h1>
          <p className="mt-6 text-lg text-muted">
            Catch up on recent messages, or revisit a favorite series.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-8 sm:grid-cols-2">
          {sermons.map((sermon) => (
            <article
              key={sermon.slug}
              className="rounded-2xl border border-border bg-card p-8"
            >
              <div className="aspect-video rounded-xl border border-border bg-background" />
              <p className="mt-6 text-sm font-semibold text-accent-ink">
                {sermon.series}
              </p>
              <h2 className="mt-2 font-serif text-xl font-semibold text-foreground">
                {sermon.title}
              </h2>
              <p className="mt-3 text-muted">{sermon.summary}</p>
              <p className="mt-4 text-sm text-muted">
                {sermon.speaker} · {formatDate(sermon.date)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
