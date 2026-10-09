"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { fadeUp, staggerGroup, lineReveal, useMotionPresets } from "@/lib/animations";
import { FloralOrnament } from "@/components/ui/FloralOrnament";
import { CoupleWordmark } from "@/components/ui/CoupleWordmark";
import { useInvitation } from "@/components/invitation/invitation-context";
import { getImage } from "@/data/generated/images";
import { wedding } from "@/data/wedding";

export function CoupleHero() {
  const { reduced } = useMotionPresets();
  const { phase } = useInvitation();
  const hero = getImage(wedding.heroImageSlug);
  const revealed = phase === "open";

  const group = staggerGroup(reduced, { stagger: 0.16, delayChildren: reduced ? 0 : 0.1 });
  const item = fadeUp(reduced, { distance: 16, duration: 0.55 });
  const rule = lineReveal(reduced, "x", { duration: 0.55 });

  const { ceremony, venue, hashtag, familyLine } = wedding;

  return (
    <section id="home" className="relative overflow-hidden bg-ivory">
      {/* `grid-cols-1` resolves to `minmax(0, 1fr)`, which stops a long word
          from stretching the column past the viewport. */}
      {/* Padding is tighter here than the shared section rhythm so the tall
          portrait and the couple's names share the first desktop screenful. */}
      <div className="mx-auto grid w-full max-w-[90rem] grid-cols-1 lg:grid-cols-12 lg:items-center lg:gap-14 lg:px-10 lg:py-20 xl:gap-20 xl:py-24">
        <figure
          id="hero-portrait"
          /* Capped on tablets so a 4:5 portrait does not become absurdly tall
             before the two-column desktop composition takes over. */
          className="relative m-0 w-full md:mx-auto md:max-w-[26rem] lg:col-span-7 lg:max-w-none"
        >
          {hero ? (
            <Image
              src={hero.src}
              alt={wedding.heroImageAlt}
              width={hero.width}
              height={hero.height}
              sizes="(min-width: 1024px) 58vw, 100vw"
              placeholder="blur"
              blurDataURL={hero.blurDataURL}
              quality={82}
              priority
              className="h-auto w-full object-cover lg:rounded-[2px]"
            />
          ) : (
            <div className="flex aspect-4/5 w-full items-center justify-center bg-cocoa/10 px-6 text-center">
              <p className="text-body text-cocoa">
                Hero photograph not found. Add it to{" "}
                <code className="font-mono text-[0.9em]">assets/originals/</code> and run{" "}
                <code className="font-mono text-[0.9em]">npm run images</code>.
              </p>
            </div>
          )}

          {/* Fine gold rule framing the photograph on wider screens. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden border border-gold/30 lg:block"
          />
        </figure>

        <motion.div
          variants={group}
          initial="hidden"
          animate={revealed ? "visible" : "hidden"}
          className="relative z-10 flex flex-col items-center gap-6 bg-ivory px-6 pt-10 pb-14 text-center sm:pt-12 md:mx-auto md:max-w-[30rem] lg:col-span-5 lg:max-w-none lg:items-start lg:bg-transparent lg:px-0 lg:py-0 lg:text-left"
        >
          <motion.p variants={item} className="label-eyebrow text-cocoa">
            {familyLine}
          </motion.p>

          <motion.h1
            variants={item}
            id="couple-names"
            tabIndex={-1}
            className="text-display text-burgundy focus-visible:outline-offset-8"
          >
            <CoupleWordmark />
          </motion.h1>

          <motion.div variants={item} className="lg:self-start">
            <FloralOrnament variant="crest" className="w-44 text-gold" />
          </motion.div>

          <motion.p
            variants={item}
            className="font-display text-[clamp(1.375rem,1.1rem+1.1vw,1.875rem)] font-light tracking-[0.04em] text-charcoal"
          >
            <time dateTime={ceremony.isoDate}>{ceremony.dateDisplay}</time>
          </motion.p>

          <motion.p variants={item} className="label-eyebrow text-cocoa">
            {ceremony.timeDisplay}
          </motion.p>

          <motion.span
            variants={rule}
            aria-hidden="true"
            className="rule-gold h-px w-28 origin-center lg:origin-left"
          />

          <motion.p variants={item} className="text-lead text-charcoal">
            {venue.name}
          </motion.p>

          <motion.p variants={item} className="text-body text-cocoa">
            {venue.location}
          </motion.p>

          <motion.p
            variants={item}
            className="label-eyebrow text-[0.8125rem] text-burgundy/85"
          >
            {hashtag}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
