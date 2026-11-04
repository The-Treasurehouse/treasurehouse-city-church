"use client";

import { useEffect, useState } from "react";
import { Swirl, display } from "@/components/ui";

type Belief = { text: string; emphasis: string };

function Statement({ belief, showSwirl, swirlClass }: { belief: Belief; showSwirl: boolean; swirlClass: string }) {
  const at = belief.text.toLowerCase().indexOf(belief.emphasis.toLowerCase());
  if (at < 0) return <>{belief.text}</>;
  const before = belief.text.slice(0, at);
  const word = belief.text.slice(at, at + belief.emphasis.length);
  const after = belief.text.slice(at + belief.emphasis.length);
  return (
    <>
      {before}
      <span className="relative inline-block">
        {word}
        <span className={`transition-opacity duration-700 ${showSwirl ? "opacity-100" : "opacity-0"}`}>
          <Swirl className={swirlClass} />
        </span>
      </span>
      {after}
    </>
  );
}

/**
 * Beliefs stack as small / BIG / small. On every tick the big one shrinks up,
 * the small one below grows into the centre, and the next one fades in underneath.
 */
const variants = {
  // black text on the orange band
  dark: { big: "text-black", small: "text-black/50", swirl: "text-white" },
  // white text on the dark hero
  light: { big: "text-white", small: "text-white/45", swirl: "text-orange" },
} as const;

export function BeliefRoller({
  beliefs,
  interval = 3600,
  variant = "dark",
  className = "h-[30rem] [--slot:10.5rem] sm:h-[36rem] sm:[--slot:14rem]",
  textClassName = "text-5xl sm:text-7xl lg:text-8xl",
  longTextClassName = "text-3xl sm:text-5xl lg:text-6xl",
}: {
  beliefs: readonly Belief[];
  interval?: number;
  variant?: keyof typeof variants;
  className?: string;
  textClassName?: string;
  /** Used for long sentences, which would not fit at the normal size. */
  longTextClassName?: string;
}) {
  const [active, setActive] = useState(0);
  const [rolled, setRolled] = useState(false);
  const n = beliefs.length;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // The first statement is what visitors read first, so it holds a little longer.
    const id = setTimeout(
      () => {
        setRolled(true);
        setActive((a) => (a + 1) % n);
      },
      // Longer sentences need more reading time.
      (rolled ? interval : interval + 1800) + (beliefs[active].text.length > 40 ? 2200 : 0),
    );
    return () => clearTimeout(id);
  }, [active, rolled, n, interval, beliefs]);

  const colors = variants[variant];

  return (
    <div className={`relative mx-auto w-full max-w-4xl overflow-hidden ${className}`}>
      {beliefs.map((belief, i) => {
        // -1 above, 0 centre, 1 below, anything else waits off stage
        let offset = (i - active + n) % n;
        if (offset > n / 2) offset -= n;
        // Before the first roll nothing sits above the opening statement.
        const visible = Math.abs(offset) <= 1 && !(offset === -1 && !rolled);
        const y = offset === 0 ? "0px" : `calc(var(--slot) * ${Math.sign(offset) * (visible ? 1 : 1.6)})`;
        const long = belief.text.length > 40;
        // Long lines are set smaller, so they shrink less to land at the same small size.
        const scale = offset === 0 ? 1 : long ? 0.46 : 0.3;

        return (
          <div
            key={belief.text}
            aria-hidden={offset !== 0}
            style={{
              transform: `translate(-50%, calc(-50% + ${y})) scale(${scale})`,
              opacity: visible ? 1 : 0,
            }}
            className={`${display} absolute left-1/2 top-1/2 w-[min(54rem,92vw)] text-center transition-[transform,opacity,color] duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${long ? longTextClassName : textClassName} ${
              offset === 0 ? colors.big : colors.small
            }`}
          >
            <Statement belief={belief} showSwirl={offset === 0} swirlClass={colors.swirl} />
          </div>
        );
      })}
    </div>
  );
}
