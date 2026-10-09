"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/**
 * Hairline scroll indicator.
 *
 * Driven entirely by motion values, so scrolling never triggers a React
 * render. Fixed and 2px tall, so it cannot shift layout or crowd a phone
 * screen. Purely decorative — the same information is conveyed by the
 * scrollbar itself, so it is hidden from assistive technology.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion() ?? false;
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 32,
    restDelta: 0.001,
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-30 h-0.5 bg-charcoal/5"
    >
      <motion.div
        className="h-full origin-left bg-gold"
        style={{ scaleX: reduced ? scrollYProgress : smoothed }}
      />
    </div>
  );
}
