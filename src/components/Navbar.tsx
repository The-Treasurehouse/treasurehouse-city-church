"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { display } from "@/components/ui";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const solid = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`inset-x-0 top-0 z-50 transition-colors duration-300 ${
          isHome ? "fixed" : "sticky"
        } ${solid && !open ? "bg-black" : "bg-transparent"}`}
      >
        <div className="flex items-center justify-between px-6 py-6 sm:px-10 sm:py-7">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center">
            <Image
              src="/logo-white.png"
              alt={site.name}
              width={2050}
              height={218}
              priority
              className="h-5 w-auto sm:h-6"
            />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="bg-accent px-5 py-3 text-sm font-semibold uppercase tracking-wide text-black transition-colors hover:bg-white"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <div
        id="site-menu"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-0 z-40 overflow-y-auto bg-black text-white transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex min-h-full flex-col justify-center gap-12 px-6 pb-12 pt-32 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Main">
            <ul className="space-y-1 sm:space-y-2">
              {site.nav.map((item, i) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href} className="overflow-hidden">
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      style={{ transitionDelay: open ? `${300 + i * 70}ms` : "0ms" }}
                      className={`${display} block text-[clamp(3rem,10vh,8rem)] transition-all duration-700 hover:text-white ${
                        active ? "text-white" : "text-white/35"
                      } ${open ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <aside
            style={{ transitionDelay: open ? "500ms" : "0ms" }}
            className={`w-full transition-all duration-700 lg:w-[440px] lg:shrink-0 ${
              open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="flex aspect-[4/3] flex-col justify-end bg-gradient-to-br from-navy to-accent-ink p-6 lg:aspect-[16/15]">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/80">Join us this Sunday</p>
              <p className="mt-2 text-2xl font-bold">{site.serviceTimes[0].time}</p>
              <p className="mt-1 text-sm text-white/80">{site.address}</p>
            </div>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-5 block bg-accent py-4 text-center text-sm font-semibold uppercase tracking-wide text-black transition-colors hover:bg-accent-dark"
            >
              Join us
            </Link>
            <ul className="mt-8 flex justify-between font-mono text-xs uppercase tracking-wider text-white/70">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="hover:text-white">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
