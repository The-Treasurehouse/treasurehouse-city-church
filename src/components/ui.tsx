import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

const tones = [
  "from-[#1b2a47] to-[#0a0f1c]",
  "from-[#3b2a1f] to-[#120b07]",
  "from-[#2a1f3b] to-[#0d0914]",
  "from-[#1f3b36] to-[#08130f]",
  "from-[#4a2f1b] to-[#150c05]",
];

/** A photo slot. Shows the image when a path is set, otherwise a dark placeholder tile. */
export function Photo({
  src,
  alt,
  tone = 0,
  className = "",
  priority,
}: {
  src: string | null;
  alt: string;
  tone?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} overflow-hidden bg-gradient-to-br ${tones[tone % tones.length]} ${className}`}
    >
      {src && <Image src={src} alt={alt} fill sizes="100vw" priority={priority} className="object-cover" />}
    </div>
  );
}

/** Hand-drawn double ring that sits under a word, like a halo. */
export function Swirl({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 40"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute -bottom-[0.18em] left-[-4%] h-[0.5em] w-[108%] -rotate-3 fill-none stroke-current ${className}`}
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <ellipse cx="100" cy="20" rx="96" ry="14" />
      <ellipse cx="104" cy="22" rx="88" ry="10" transform="rotate(2 100 20)" />
    </svg>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-xs font-medium uppercase tracking-[0.18em] ${className}`}>{children}</p>
  );
}

export function ArrowLink({
  href,
  children,
  className = "",
  external,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}) {
  const classes = `inline-flex items-center gap-1.5 border-b border-current pb-1 text-sm font-medium uppercase tracking-wide transition-opacity hover:opacity-70 ${className}`;
  const content = (
    <>
      {children}
      <ArrowUpRight className="h-4 w-4" />
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

export const display =
  "font-heading font-extrabold uppercase leading-[0.92] tracking-[-0.04em]";
