"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { fadeUp, listViewport, revealViewport, useMotionPresets } from "@/lib/animations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { orderOfService } from "@/data/order-of-service";

export function OrderOfService() {
  const { reduced, spineReveal } = useMotionPresets();

  /*
   * A small index-based offset gives entries that share a screen a soft
   * cascade. It is capped at four steps so no entry is ever held back long
   * enough to feel unresponsive.
   */
  const itemVariants = useMemo(
    () =>
      orderOfService.map((_, index) =>
        fadeUp(reduced, { distance: 16, duration: 0.55, delay: (index % 4) * 0.06 }),
      ),
    [reduced],
  );

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

          {orderOfService.map((entry, index) => (
            <motion.li
              key={entry.title}
              variants={itemVariants[index]}
              initial="hidden"
              whileInView="visible"
              viewport={listViewport}
              className="relative grid grid-cols-[1.9rem_1fr] items-baseline gap-x-7 pb-9 last:pb-0 sm:grid-cols-[2.4rem_1fr]"
            >
              <span
                aria-hidden="true"
                className="font-display text-[1.0625rem] leading-none font-medium tracking-[0.06em] text-gold lining-nums tabular-nums sm:text-[1.1875rem]"
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Marker sitting on the spine. */}
              <span
                aria-hidden="true"
                className="absolute left-[2.4rem] top-[0.3rem] size-[7px] -translate-x-1/2 rotate-45 border border-gold bg-ivory sm:left-[2.9rem]"
              />

              <div className="flex flex-col gap-1">
                <h3 className="font-display text-[clamp(1.125rem,1.02rem+0.5vw,1.4375rem)] leading-snug font-normal text-charcoal">
                  {entry.title}
                </h3>
                {entry.attribution ? (
                  <p className="label-eyebrow text-[0.6875rem] text-cocoa">
                    {entry.attribution}
                  </p>
                ) : null}
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
