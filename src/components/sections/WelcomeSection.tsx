"use client";

import { motion } from "motion/react";
import { revealViewport, useMotionPresets } from "@/lib/animations";
import { FloralOrnament } from "@/components/ui/FloralOrnament";

export function WelcomeSection() {
  const { fadeUp, fadeUpSmall, stagger } = useMotionPresets();

  return (
    <section id="welcome" className="bg-ivory">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        className="pad-safe-x mx-auto flex max-w-2xl flex-col items-center gap-8 py-section text-center"
      >
        <motion.div variants={fadeUpSmall}>
          <FloralOrnament variant="crest" className="w-36 text-gold" />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="wordmark text-title text-balance text-burgundy"
        >
          Two hearts. One beautiful beginning.
        </motion.h2>

        <motion.p variants={fadeUpSmall} className="max-w-prose text-lead text-cocoa">
          We would be honoured to have you celebrate this special day with us.
        </motion.p>
      </motion.div>
    </section>
  );
}
