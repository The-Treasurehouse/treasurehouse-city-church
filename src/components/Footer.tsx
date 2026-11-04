import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  const half = Math.ceil(site.nav.length / 2);
  const columns = [site.nav.slice(0, half), site.nav.slice(half)];

  return (
    <footer className="bg-black text-white">
      <div className="flex flex-col gap-12 px-6 pb-10 pt-24 sm:px-10 md:flex-row md:items-start md:justify-between">
        <Link href="/" className="block">
          <Image src="/logo-white.png" alt={site.name} width={2050} height={218} className="h-7 w-auto sm:h-9" />
        </Link>
        <div className="flex gap-12 font-mono text-sm font-medium uppercase tracking-wider">
          {columns.map((col, i) => (
            <ul key={i} className="space-y-2.5">
              {col.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <ul className="flex flex-wrap justify-between gap-4 px-6 pb-10 font-mono text-xs uppercase tracking-wider text-white/70 sm:px-10">
        {site.socials.map((s) => (
          <li key={s.label}>
            <a href={s.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
              {s.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 border-t border-white/15 px-6 py-5 font-mono text-xs uppercase tracking-wider text-white/70 sm:flex-row sm:justify-between sm:px-10">
        <span>
          &copy; {new Date().getFullYear()} {site.name}
        </span>
        <span>{site.address}</span>
      </div>
    </footer>
  );
}
