import type { Metadata } from "next";
import { site } from "@/lib/site";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name} or plan your visit.`,
};

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-ink">
            Get in Touch
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-foreground sm:text-5xl">
            We&apos;d Love to Meet You
          </h1>
          <p className="mt-6 text-lg text-muted">
            Whether you have a question or want to plan your first visit,
            we&apos;re here.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Visit Us
            </h2>
            <dl className="mt-6 space-y-4 text-muted">
              <div>
                <dt className="text-sm font-semibold text-foreground">Address</dt>
                <dd>{site.address}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-foreground">Phone</dt>
                <dd>{site.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-foreground">Email</dt>
                <dd>{site.email}</dd>
              </div>
            </dl>

            <h3 className="mt-8 text-sm font-semibold text-foreground">
              Service Times
            </h3>
            <ul className="mt-3 space-y-2 text-muted">
              {site.serviceTimes.map((s) => (
                <li key={s.label}>
                  <span className="text-foreground">{s.label}:</span> {s.time}
                </li>
              ))}
            </ul>

            <div className="mt-8 aspect-video rounded-2xl border border-border bg-card" />
          </div>

          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Send a Message
            </h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
