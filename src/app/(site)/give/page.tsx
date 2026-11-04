import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Give",
  description: `Support the work of ${site.name} through tithes and offerings.`,
};

const ways = [
  {
    title: "Online",
    body: "Give securely online using your card or bank transfer. A confirmation is sent to your email.",
  },
  {
    title: "Bank Transfer",
    body: "Account Name: Treasurehouse City Church\nBank: First Bank of Nigeria\nAccount Number: 0000000000",
  },
  {
    title: "In Person",
    body: "Give during any of our services using the offering baskets, or visit the church office during the week.",
  },
];

export default function GivePage() {
  return (
    <>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-ink">
            Give
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-foreground sm:text-5xl">
            Give as an Act of Worship
          </h1>
          <p className="mt-6 text-lg text-muted">
            &ldquo;Each of you should give what you have decided in your
            heart to give, not reluctantly or under compulsion, for God loves
            a cheerful giver.&rdquo; — 2 Corinthians 9:7
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-8 sm:grid-cols-3">
          {ways.map((w) => (
            <div key={w.title} className="rounded-2xl border border-border bg-card p-8">
              <h2 className="font-serif text-lg font-semibold text-foreground">
                {w.title}
              </h2>
              <p className="mt-3 whitespace-pre-line text-muted">{w.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href="#"
            className="rounded-full bg-navy px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-dark"
          >
            Give Online Now
          </a>
        </div>
      </section>
    </>
  );
}
