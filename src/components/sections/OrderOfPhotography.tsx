"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { fadeUp, useMotionPresets } from "@/lib/animations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { orderOfPhotography } from "@/data/order-of-photography";

/*
 * Same position rule as the order of service. A row below the entrance stays
 * hidden. Crossing it plays the fade-up. A row already above the settle line
 * is shown at once, so a fast scroll cannot leave an upper row fading after
 * a lower one has finished. On a wide screen the list is two columns, and
 * each row is judged by where it actually sits.
 */
const ENTER_AT = 0.96;
const SETTLE_AT = 0.72;

type RevealMode = "hidden" | "play" | "shown";

function revealState(mode: RevealMode) {
  if (mode === "play") return "visible";
  if (mode === "shown") return "settled";
  return "hidden";
}

export function OrderOfPhotography() {
  const { reduced } = useMotionPresets();
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [modes, setModes] = useState<RevealMode[]>(() => orderOfPhotography.map(() => "hidden"));
  const modesRef = useRef(modes);

  const itemVariants = useMemo(() => {
    const play = fadeUp(reduced, { distance: 14, duration: 0.5 });
    return { ...play, settled: { opacity: 1, y: 0, transition: { duration: 0 } } };
  }, [reduced]);

  useLayoutEffect(() => {
    if (reduced) return;

    let frame = 0;
    let active = true;

    const update = () => {
      frame = 0;
      if (!active) return;

      const current = modesRef.current;
      if (current.every((mode) => mode === "shown")) return;

      const height = window.innerHeight;
      const enter = height * ENTER_AT;
      const settled = height * SETTLE_AT;
      let changed = false;

      const next = current.map((mode, index) => {
        if (mode === "shown") return mode;
        const el = itemRefs.current[index];
        if (!el) return mode;

        const top = el.getBoundingClientRect().top;
        let resolved: RevealMode = mode;
        if (top <= settled) resolved = "shown";
        else if (mode !== "play" && top <= enter) resolved = "play";

        if (resolved !== mode) changed = true;
        return resolved;
      });

      if (!changed) return;
      modesRef.current = next;
      setModes(next);

      if (next.every((mode) => mode === "shown")) {
        window.removeEventListener("scroll", requestUpdate);
        window.removeEventListener("resize", requestUpdate);
      }
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    requestUpdate();

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [reduced]);

  return (
    <section
      id="order-of-photography"
      className="on-dark relative overflow-hidden bg-burgundy"
    >
      {/* Subtle depth so the burgundy does not read as a flat block. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 60% at 50% 0%, rgba(198,161,107,0.12) 0%, rgba(87,9,29,0) 60%)",
        }}
      />

      <div className="pad-safe-x relative mx-auto flex max-w-5xl flex-col items-center gap-12 py-section sm:gap-16">
        <SectionHeading
          label="After the Ceremony"
          title="Order of Photography"
          lead="Kindly stay close by if you are called for a photograph. We would love to capture this special day with you."
          tone="dark"
        />

        {/*
         * Columns flow top-to-bottom before wrapping, so the numbering still
         * reads in order down each column on wide screens.
         */}
        <ol className="w-full lg:columns-2 lg:gap-x-16">
          {orderOfPhotography.map((group, index) => {
            const state = reduced ? "settled" : revealState(modes[index] ?? "hidden");

            return (
              <motion.li
                key={group}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                initial={reduced ? "settled" : "hidden"}
                animate={state}
                variants={itemVariants}
                className="flex items-baseline gap-5 break-inside-avoid border-b border-gold/20 py-3.5 last:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className="w-6 shrink-0 font-display text-[0.9375rem] leading-none font-medium tracking-[0.05em] text-gold lining-nums tabular-nums"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-body text-ivory/90">{group}</span>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
