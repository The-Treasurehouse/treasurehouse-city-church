import Link from "next/link";
import { Play } from "lucide-react";
import { site } from "@/lib/site";
import { media } from "@/lib/media";
import { sermons } from "@/lib/data/sermons";
import { events } from "@/lib/data/events";
import { formatDate } from "@/lib/date";
import { BeliefRoller } from "@/components/BeliefRoller";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { ArrowLink, Eyebrow, Photo, Swirl, display } from "@/components/ui";

const communityGroups = ["Cell groups", "Youth", "Kids", "Service teams"];

export default function Home() {
  const latest = sermons[0];
  const upcoming = events.slice(0, 4);
  const [pastorA, pastorB] = ["Emeka", "Grace"];

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[640px] h-svh items-end justify-center overflow-hidden bg-black">
        {media.heroVideo ? (
          <video
            src={media.heroVideo}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            {media.heroImages.length > 0 ? (
              <HeroSlideshow images={media.heroImages} />
            ) : (
              <Photo src={null} alt="" tone={1} className="absolute inset-0" />
            )}
          </>
        )}
        {!media.heroVideo && media.heroImages.length === 0 && (
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,233,226,0.2),transparent_55%),radial-gradient(circle_at_85%_5%,rgba(245,233,226,0.1),transparent_45%)]"
          />
        )}
        <div aria-hidden className="absolute inset-0 bg-black/92" />
        <div className="absolute inset-x-6 top-[44%] -translate-y-1/2">
          <BeliefRoller
            beliefs={site.beliefs}
            variant="light"
            className="h-[22rem] [--slot:7.5rem] sm:h-[28rem] sm:[--slot:11rem]"
            textClassName="text-4xl sm:text-6xl lg:text-7xl"
            longTextClassName="text-2xl sm:text-4xl lg:text-5xl"
          />
        </div>
        <div className="relative flex w-full max-w-md flex-col items-stretch gap-3 px-6 pb-16 sm:pb-20">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/about"
              className="bg-accent px-6 py-4 text-center text-sm font-semibold uppercase tracking-wide text-black transition-colors hover:bg-white"
            >
              About us
            </Link>
            <Link
              href="/give"
              className="border border-accent px-6 py-4 text-center text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent hover:text-black"
            >
              Give
            </Link>
          </div>
          <Link
            href="/contact"
            className="bg-accent px-6 py-4 text-center text-sm font-semibold uppercase tracking-wide text-black transition-colors hover:bg-white"
          >
            I&apos;m new here
          </Link>
        </div>
      </section>

      {/* Our belief */}
      <section className="bg-accent text-black">
        <div className="flex min-h-[640px] flex-col items-center justify-center gap-10 px-6 py-24 sm:px-10">
          <Eyebrow>Our belief</Eyebrow>
          <div className="grid w-full flex-1 items-center gap-10 lg:grid-cols-[16rem_1fr_16rem]">
            <p className="max-w-[18rem] text-lg leading-snug lg:justify-self-start">
              A church where every person finds a place to belong, grow, and discover who God made them to be.
            </p>
            <h2 className={`${display} mx-auto max-w-3xl text-center text-5xl sm:text-6xl lg:text-7xl`}>
              Faith, family and{" "}
              <span className="relative inline-block">
                joy
                <Swirl className="text-black" />
              </span>{" "}
              in our city
            </h2>
            <p className="max-w-[18rem] text-lg leading-snug lg:justify-self-end lg:text-right">
              Worship, the Word, and fellowship, as one family.
            </p>
          </div>
        </div>
      </section>

      {/* Photo strip */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {media.strip.map((src, i) => (
          <Photo
            key={i}
            src={src}
            alt={`${site.shortName} community`}
            tone={i}
            className={`aspect-[3/4] lg:aspect-auto lg:h-[26rem] ${i === 4 ? "hidden sm:block" : ""} ${i === 3 ? "hidden lg:block" : ""}`}
          />
        ))}
      </section>

      {/* Sermon */}
      <section className="bg-black px-6 py-24 text-white sm:px-10 sm:py-32">
        <Eyebrow className="text-accent">Sermon</Eyebrow>
        <h2 className={`${display} mt-8 text-5xl sm:text-7xl lg:text-8xl`}>
          Watch latest
          <span className="relative mt-2 block w-fit sm:ml-[10%]">
            message
            <Swirl className="text-accent" />
          </span>
        </h2>

        <div className="mt-16 grid gap-10 lg:grid-cols-[18rem_1fr]">
          <div className="flex flex-col justify-between gap-10">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-white/60">
                {latest.series} / {formatDate(latest.date)}
              </p>
              <p className="mt-3 text-base leading-snug text-white/90">{latest.summary}</p>
            </div>
            <div className="flex flex-col items-start gap-5 text-white">
              <ArrowLink href="/sermons">All messages</ArrowLink>
              <ArrowLink href={site.socials[1].href} external>
                YouTube
              </ArrowLink>
            </div>
          </div>

          <Link href="/sermons" className="group relative block aspect-video overflow-hidden">
            <Photo src={media.sermonThumb} alt={latest.title} tone={2} className="absolute inset-0" />
            <div className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-black/70 to-transparent p-6 sm:p-8">
              <p className="text-2xl font-bold sm:text-4xl">{latest.title}</p>
              <p className="mt-1 text-sm text-white/80">{latest.speaker}</p>
            </div>
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-black transition-transform group-hover:scale-110">
              <Play className="h-6 w-6 fill-current" />
            </span>
          </Link>
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-white text-black">
        <div className="px-6 pb-16 pt-24 sm:px-10 sm:pt-32">
          <h2 className={`${display} text-5xl sm:text-7xl lg:text-8xl`}>
            Meet our
            <span className="block sm:ml-[18%]">pastors</span>
          </h2>
        </div>
        <Eyebrow className="px-6 pb-4 text-accent-ink sm:px-10">Leadership</Eyebrow>
        <div className="grid lg:grid-cols-[1.15fr_1fr]">
          <Photo src={media.pastors} alt="Our pastors" tone={4} className="aspect-[4/5] lg:aspect-auto lg:min-h-[640px]" />
          <div className="flex flex-col justify-center gap-6 px-6 py-14 sm:px-10 lg:py-0">
            <h3 className="text-5xl leading-[0.95] tracking-[-0.04em] sm:text-6xl">
              <span className="font-light uppercase">Pastors</span>
              <span className={`${display} block`}>
                {pastorA} &amp; {pastorB} Johnson
              </span>
            </h3>
            <p className="max-w-md text-base leading-snug">
              Pastor {pastorA} and Pastor {pastorB} Johnson are the lead pastors of {site.name}. Together they carry a
              clear mandate: to build a home for the family of God.
            </p>
            <p className="max-w-md text-base leading-snug">
              They lead with a love for the Word, a heart for people, and a commitment to seeing every member grow in
              faith.
            </p>
            <div className="pt-4">
              <ArrowLink href="/about">Read more</ArrowLink>
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="bg-accent px-6 py-24 text-black sm:px-10 sm:py-32">
        <Eyebrow>Events</Eyebrow>
        <h2 className={`${display} mt-8 text-center text-5xl sm:text-7xl lg:text-8xl`}>
          Upcoming
          <span className="relative mt-2 block w-fit sm:ml-[48%]">
            events
            <Swirl className="text-black" />
          </span>
        </h2>
        <ul className="mt-20 border-t border-black/25">
          {upcoming.map((e) => (
            <li
              key={e.slug}
              className="flex flex-col gap-4 border-b border-black/25 py-7 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-5">
                <h3 className="text-4xl font-medium uppercase leading-none tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                  {e.title}
                </h3>
                <p className="text-sm uppercase leading-tight">
                  {/^\d{4}-/.test(e.date) ? formatDate(e.date) : e.date}
                  <br />
                  {e.time}
                </p>
              </div>
              <ArrowLink href="/events" className="self-start md:self-auto">
                Details
              </ArrowLink>
            </li>
          ))}
        </ul>
      </section>

      {/* Community */}
      <section className="relative overflow-hidden bg-black text-white">
        <Photo src={media.community} alt="" tone={3} className="absolute inset-0" />
        <div aria-hidden className="absolute inset-0 bg-black/60" />
        <div className="relative grid gap-14 px-6 py-24 sm:px-10 sm:py-32 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Eyebrow className="text-accent">Community</Eyebrow>
            <h2 className={`${display} mt-8 text-5xl sm:text-6xl lg:text-7xl`}>
              Community is a key
              <span className="block sm:ml-[10%]">part of life at {site.shortName}</span>
            </h2>
          </div>
          <div className="flex flex-col justify-center gap-8">
            <ul className="space-y-4">
              {communityGroups.map((g) => (
                <li key={g} className="text-3xl font-light uppercase tracking-[-0.03em] sm:text-4xl">
                  {g}
                </li>
              ))}
            </ul>
            <div>
              <ArrowLink href="/about">Learn more</ArrowLink>
            </div>
          </div>
        </div>
      </section>

      {/* Discipleship */}
      <section className="grid bg-white text-black lg:grid-cols-2">
        <div className="flex flex-col justify-center gap-8 px-6 py-20 sm:px-10 lg:py-0">
          <Eyebrow className="text-accent-ink">Growth</Eyebrow>
          <h2 className={`${display} text-5xl sm:text-7xl lg:text-8xl`}>
            <span className="relative inline-block">
              Discipleship
              <Swirl className="text-accent-ink" />
            </span>
          </h2>
          <p className="max-w-sm text-base leading-snug">
            At {site.shortName}, we believe faith was never meant to stay surface-level. It is meant to shape how you
            think, how you live, and how you show up in the world. Discipleship here is not a class you take. It is a
            journey you step into.
          </p>
          <div>
            <ArrowLink href="/about">Read more</ArrowLink>
          </div>
        </div>
        <Photo src={media.discipleship} alt="Reading the Bible" tone={0} className="aspect-[4/3] lg:aspect-auto lg:min-h-[560px]" />
      </section>
    </>
  );
}
