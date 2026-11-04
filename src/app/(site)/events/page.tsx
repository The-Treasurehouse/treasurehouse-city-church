import type { Metadata } from "next";
import { site } from "@/lib/site";
import { events } from "@/lib/data/events";

export const metadata: Metadata = {
  title: "Events",
  description: `Upcoming events and gatherings at ${site.name}.`,
};

export default function EventsPage() {
  return (
    <>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-ink">
            What&apos;s Happening
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-foreground sm:text-5xl">
            Events
          </h1>
          <p className="mt-6 text-lg text-muted">
            There&apos;s always something happening at {site.shortName}.
            Here&apos;s what&apos;s coming up.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24">
        <div className="space-y-6">
          {events.map((event) => (
            <article
              key={event.slug}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-8 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  {event.title}
                </h2>
                <p className="mt-2 text-muted">{event.description}</p>
                <p className="mt-3 text-sm text-muted">{event.location}</p>
              </div>
              <div className="shrink-0 rounded-xl bg-background px-5 py-3 text-center sm:text-right">
                <p className="text-sm font-semibold text-accent-ink">
                  {event.date}
                </p>
                <p className="text-sm text-muted">{event.time}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
