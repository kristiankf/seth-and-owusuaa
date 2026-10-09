"use client";

import { motion } from "motion/react";
import { revealViewport, useMotionPresets } from "@/lib/animations";

interface GoldDividerProps {
  /** `rule` is a plain hairline; `marque` adds a small centred diamond. */
  readonly variant?: "rule" | "marque";
  readonly className?: string;
}

/**
 * Fine champagne-gold divider. Scales in from the centre as it enters view,
 * which keeps the eye moving down the page without drawing attention.
 */
export function GoldDivider({ variant = "marque", className = "" }: GoldDividerProps) {
  const { dividerReveal } = useMotionPresets();

  return (
    <motion.div
      aria-hidden="true"
      variants={dividerReveal}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      className={`flex w-full max-w-xs items-center gap-3 origin-center ${className}`}
    >
      <span className="rule-gold h-px flex-1" />
      {variant === "marque" ? (
        <span className="size-1.5 rotate-45 bg-gold/80" />
      ) : null}
      <span className="rule-gold h-px flex-1" />
    </motion.div>
  );
}
