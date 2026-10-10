"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  EASE_EDITORIAL,
  fadeFromRight,
  fadeUp,
  revealViewport,
  useMotionPresets,
} from "@/lib/animations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { orderOfService } from "@/data/order-of-service";

/*
 * Reveal follows position, not a per-row timer.
 * A row below the entrance stays hidden. Crossing it plays the number rise
 * and the slide from the right. A row already above the settle line is shown
 * at once, so a fast scroll cannot leave an upper row fading after a lower
 * one has finished.
 */
const ENTER_AT = 0.96;
const SETTLE_AT = 0.72;

type RevealMode = "hidden" | "play" | "shown";

const rowPresence = {
  hidden: {},
  visible: {},
  settled: {},
};

function revealState(mode: RevealMode) {
  if (mode === "play") return "visible";
  if (mode === "shown") return "settled";
  return "hidden";
}

export function OrderOfService() {
  const { reduced, spineReveal } = useMotionPresets();
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [modes, setModes] = useState<RevealMode[]>(() => orderOfService.map(() => "hidden"));
  const modesRef = useRef(modes);

  const numberVariants = useMemo(() => {
    const play = fadeUp(reduced, { distance: 16, duration: 0.55 });
    return { ...play, settled: { opacity: 1, y: 0, transition: { duration: 0 } } };
  }, [reduced]);

  const textVariants = useMemo(() => {
    const play = fadeFromRight(reduced, { distance: 48, duration: 0.7 });
    return { ...play, settled: { opacity: 1, x: 0, transition: { duration: 0 } } };
  }, [reduced]);

  const markerVariants = useMemo(
    () => ({
      hidden: { opacity: reduced ? 1 : 0 },
      visible: {
        opacity: 1,
        transition: reduced ? { duration: 0 } : { duration: 0.55, ease: EASE_EDITORIAL },
      },
      settled: { opacity: 1, transition: { duration: 0 } },
    }),
    [reduced],
  );

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
    <section id="order-of-service" className="bg-ivory">
      <div className="pad-safe-x mx-auto flex max-w-3xl flex-col items-center gap-12 py-section sm:gap-16">
        <SectionHeading label="The Ceremony" title="Order of Service" />

        <ol className="relative w-full max-w-xl">
          {/* The timeline spine, drawn downwards as the list comes into view. */}
          <motion.span
            aria-hidden="true"
            variants={spineReveal}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
            className="absolute top-3 bottom-3 left-[2.4rem] w-px origin-top bg-gold/35 sm:left-[2.9rem]"
          />

          {orderOfService.map((entry, index) => {
            const state = reduced ? "settled" : revealState(modes[index] ?? "hidden");

            return (
              <motion.li
                key={entry.title}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                initial={reduced ? "settled" : "hidden"}
                animate={state}
                variants={rowPresence}
                className="relative grid grid-cols-[1.9rem_1fr] items-baseline gap-x-7 pb-9 last:pb-0 sm:grid-cols-[2.4rem_1fr]"
              >
                <motion.span
                  aria-hidden="true"
                  variants={numberVariants}
                  className="font-display text-[1.0625rem] leading-none font-medium tracking-[0.06em] text-gold lining-nums tabular-nums sm:text-[1.1875rem]"
                >
                  {String(index + 1).padStart(2, "0")}
                </motion.span>

                {/* Marker sitting on the spine. Rotation lives on the inner span so the fade cannot replace it. */}
                <motion.span
                  aria-hidden="true"
                  variants={markerVariants}
                  className="absolute left-[2.4rem] top-[0.3rem] sm:left-[2.9rem]"
                >
                  <span className="block size-[7px] -translate-x-1/2 rotate-45 border border-gold bg-ivory" />
                </motion.span>

                <div className="min-w-0 overflow-hidden">
                  <motion.div variants={textVariants} className="flex flex-col gap-1">
                    <h3 className="font-display text-[clamp(1.125rem,1.02rem+0.5vw,1.4375rem)] leading-snug font-normal text-charcoal">
                      {entry.title}
                    </h3>
                    {entry.attribution ? (
                      <p className="label-eyebrow text-[0.6875rem] text-cocoa">
                        {entry.attribution}
                      </p>
                    ) : null}
                  </motion.div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
