"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { fadeUp, listViewport, useMotionPresets } from "@/lib/animations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { orderOfPhotography } from "@/data/order-of-photography";

export function OrderOfPhotography() {
  const { reduced } = useMotionPresets();

  const itemVariants = useMemo(
    () =>
      orderOfPhotography.map((_, index) =>
        fadeUp(reduced, { distance: 14, duration: 0.5, delay: (index % 4) * 0.05 }),
      ),
    [reduced],
  );

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
          {orderOfPhotography.map((group, index) => (
            <motion.li
              key={group}
              variants={itemVariants[index]}
              initial="hidden"
              whileInView="visible"
              viewport={listViewport}
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
          ))}
        </ol>
      </div>
    </section>
  );
}
