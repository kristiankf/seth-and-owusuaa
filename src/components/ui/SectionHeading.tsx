"use client";

import { motion } from "motion/react";
import { revealViewport, useMotionPresets } from "@/lib/animations";
import { FloralOrnament } from "@/components/ui/FloralOrnament";

interface SectionHeadingProps {
  /** Small uppercase eyebrow, e.g. "THE CEREMONY". */
  readonly label: string;
  /** Display title, e.g. "Order of Service". */
  readonly title: string;
  /** Optional supporting sentence below the title. */
  readonly lead?: string;
  /** `dark` is for burgundy sections, `light` for ivory ones. */
  readonly tone?: "light" | "dark";
  readonly align?: "center" | "start";
  /** Heading level, so each section sits correctly in the document outline. */
  readonly as?: "h2" | "h3";
  readonly id?: string;
}

export function SectionHeading({
  label,
  title,
  lead,
  tone = "light",
  align = "center",
  as: Tag = "h2",
  id,
}: SectionHeadingProps) {
  const { fadeUp, fadeUpSmall, stagger } = useMotionPresets();

  const isDark = tone === "dark";
  const alignment =
    align === "center" ? "items-center text-center mx-auto" : "items-start text-left";

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      className={`flex max-w-2xl flex-col gap-5 ${alignment}`}
    >
      <motion.p
        variants={fadeUpSmall}
        className={`label-eyebrow ${isDark ? "text-gold" : "text-cocoa"}`}
      >
        {label}
      </motion.p>

      <motion.div variants={fadeUp} className="flex flex-col gap-4">
        <Tag
          id={id}
          className={`wordmark text-title ${isDark ? "text-ivory" : "text-charcoal"}`}
        >
          {title}
        </Tag>

        <motion.div
          variants={fadeUpSmall}
          viewport={revealViewport}
          className={align === "center" ? "mx-auto" : ""}
        >
          <FloralOrnament
            variant="crest"
            className={`w-40 ${isDark ? "text-gold/70" : "text-gold"}`}
          />
        </motion.div>
      </motion.div>

      {lead ? (
        <motion.p
          variants={fadeUpSmall}
          className={`max-w-prose text-lead ${isDark ? "text-ivory/75" : "text-cocoa"}`}
        >
          {lead}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
