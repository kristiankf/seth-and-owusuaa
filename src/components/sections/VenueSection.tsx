"use client";

import { motion } from "motion/react";
import { revealViewport, useMotionPresets } from "@/lib/animations";
import { FloralOrnament } from "@/components/ui/FloralOrnament";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { wedding } from "@/data/wedding";

export function VenueSection() {
  const { fadeUp, fadeUpSmall, stagger, press } = useMotionPresets();
  const { venue, ceremony, rsvp } = wedding;

  return (
    <section id="venue" className="on-dark relative overflow-hidden bg-wine">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(100% 60% at 50% 50%, rgba(196,154,157,0.12) 0%, rgba(59,7,21,0) 70%)",
        }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        className="pad-safe-x relative mx-auto flex max-w-3xl flex-col items-center gap-10 py-section text-center"
      >
        <motion.p variants={fadeUpSmall} className="label-eyebrow text-gold">
          The Celebration
        </motion.p>

        <motion.h2 variants={fadeUp} className="wordmark text-title text-ivory">
          Where We Gather
        </motion.h2>

        <motion.div variants={fadeUpSmall}>
          <FloralOrnament variant="crest" className="w-48 text-gold/70" />
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-col items-center gap-3">
          <p className="wordmark text-[clamp(1.5rem,1.15rem+1.6vw,2.375rem)] text-ivory">
            {venue.name}
          </p>
          <p className="text-lead text-rose">{venue.location}</p>
        </motion.div>

        <GoldDivider className="max-w-[16rem]" />

        <motion.dl
          variants={fadeUp}
          className="flex w-full max-w-md flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center sm:gap-16"
        >
          <div className="flex flex-col items-center gap-2">
            <dt className="label-eyebrow text-gold">Date</dt>
            <dd className="font-display text-[clamp(1.125rem,1.02rem+0.5vw,1.375rem)] font-light text-ivory">
              <time dateTime={ceremony.isoDate}>{ceremony.dateWithWeekday}</time>
            </dd>
          </div>

          <div className="flex flex-col items-center gap-2">
            <dt className="label-eyebrow text-gold">Time</dt>
            <dd className="font-display text-[clamp(1.125rem,1.02rem+0.5vw,1.375rem)] font-light text-ivory">
              {ceremony.timeDisplay}
            </dd>
          </div>
        </motion.dl>

        {rsvp.length > 0 ? (
          <motion.div variants={fadeUp} className="flex w-full flex-col items-center gap-6">
            <p className="label-eyebrow text-gold">RSVP</p>
            <ul className="flex w-full max-w-md flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center sm:gap-16">
              {rsvp.map((contact) => (
                <li key={contact.phoneHref} className="flex flex-col items-center gap-2">
                  <p className="font-display text-[clamp(1.125rem,1.02rem+0.5vw,1.375rem)] font-light text-ivory">
                    {contact.name}
                  </p>
                  <a
                    href={contact.phoneHref}
                    className="text-lead text-rose underline-offset-4 transition-colors hover:text-ivory hover:underline"
                  >
                    {contact.phoneDisplay}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}

        {/*
         * The directions link appears only once a verified destination is
         * configured in `src/data/wedding.ts`. Until then the section stands
         * on the venue details alone rather than sending guests to a guess.
         */}
        {venue.mapsUrl ? (
          <motion.a
            variants={fadeUpSmall}
            href={venue.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="label-eyebrow inline-flex min-h-12 items-center gap-3 border border-gold/70 bg-gold/10 px-8 text-ivory transition-colors hover:bg-gold/20"
            {...press}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-4 text-gold"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.2" />
            </svg>
            Get Directions
          </motion.a>
        ) : null}
      </motion.div>
    </section>
  );
}
