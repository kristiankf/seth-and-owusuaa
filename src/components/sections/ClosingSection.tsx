"use client";

import { motion } from "motion/react";
import { revealViewport, useMotionPresets } from "@/lib/animations";
import { FloralOrnament } from "@/components/ui/FloralOrnament";
import { CoupleWordmark } from "@/components/ui/CoupleWordmark";
import { wedding } from "@/data/wedding";

export function ClosingSection() {
  const { fadeUp, fadeUpSmall, stagger } = useMotionPresets();

  return (
    <footer className="on-dark relative overflow-hidden bg-burgundy">
      {/* Echoes the vignette on the invitation cover, closing the loop. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 42%, rgba(198,161,107,0.16) 0%, rgba(87,9,29,0) 62%)",
        }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        className="pad-safe-x pad-safe-b relative mx-auto flex max-w-2xl flex-col items-center gap-8 py-section text-center"
      >
        <motion.div variants={fadeUpSmall}>
          <FloralOrnament variant="crest" className="w-48 text-gold/70" />
        </motion.div>

        <motion.p variants={fadeUp} className="text-title text-ivory">
          <CoupleWordmark />
        </motion.p>

        <motion.p variants={fadeUpSmall} className="max-w-prose text-lead text-ivory/75">
          {wedding.closingMessage}
        </motion.p>

        <motion.p variants={fadeUp} className="label-eyebrow text-[0.8125rem] text-gold">
          {wedding.hashtag}
        </motion.p>

        <motion.div variants={fadeUpSmall} className="mt-2 flex flex-col items-center gap-6">
          <span aria-hidden="true" className="rule-gold h-px w-24" />

          {/*
            A plain anchor, so it works without JavaScript. Smooth scrolling
            comes from `scroll-behavior` in the stylesheet, which the
            reduced-motion media query turns off automatically.
          */}
          <a
            href="#home"
            className="label-eyebrow inline-flex min-h-11 items-center px-3 text-ivory/60 transition-colors hover:text-ivory"
          >
            Back to top
          </a>
        </motion.div>
      </motion.div>
    </footer>
  );
}
