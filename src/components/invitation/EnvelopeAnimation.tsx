"use client";

import type { Ref } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { envelopeVariants } from "@/lib/animations";
import { FloralOrnament } from "@/components/ui/FloralOrnament";
import type { InvitationPhase } from "@/components/invitation/invitation-context";
import { getImage } from "@/data/generated/images";
import { wedding } from "@/data/wedding";

interface EnvelopeAnimationProps {
  readonly reduced: boolean;
  readonly phase: InvitationPhase;
  readonly cardRef?: Ref<HTMLDivElement>;
  readonly onPeekComplete?: () => void;
}

/**
 * The envelope itself: a burgundy pocket, a two-sided flap, a wax seal and
 * the hero photograph that rises out of it.
 *
 * The photograph is kept out of the flap's 3D stacking context so the open
 * flap cannot tint it. The pocket sits above the tucked portion; only the
 * part that has risen past the V is seen.
 *
 * While closed the shell clips overflow so the portrait cannot leak out of
 * the bottom. Once the flap is opening, overflow is released so the photo
 * can rise above the envelope.
 */
export function EnvelopeAnimation({
  reduced,
  phase,
  cardRef,
  onPeekComplete,
}: EnvelopeAnimationProps) {
  const variants = envelopeVariants(reduced);
  const hero = getImage(wedding.heroImageSlug);
  const allowPeekOverflow = phase === "peeking" || phase === "expanding";

  return (
    <div
      className={`relative mx-auto aspect-5/6 w-full max-w-[22rem] sm:max-w-[23rem] ${
        allowPeekOverflow ? "overflow-visible" : "overflow-hidden"
      }`}
    >
      <div className="envelope-lining absolute inset-0 z-0 rounded-[3px]" />

      {/* Inner flap only — its own 3D context, stacked behind the photograph. */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{ perspective: "1400px" }}
      >
        <motion.div
          variants={variants.flapInner}
          className="envelope-flap absolute inset-x-0 top-0 h-[46%] origin-top"
          style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
        />
      </div>

      {/*
       * Photograph in 2D, so rotateX on the flaps cannot wash it out.
       * Fully inside the shell while closed; overflow-hidden clips any slip.
       */}
      <motion.div
        ref={cardRef}
        variants={variants.card}
        onAnimationComplete={(definition) => {
          if (definition === "peeking") onPeekComplete?.();
        }}
        className="absolute inset-x-[8%] top-[12%] z-20 bottom-[18%] overflow-hidden rounded-[2px] bg-ivory shadow-[0_18px_40px_-24px_rgba(0,0,0,0.65)]"
      >
        {hero ? (
          <Image
            src={hero.src}
            alt=""
            fill
            sizes="23rem"
            priority
            quality={82}
            className="object-cover object-top"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center">
            <p className="font-display text-[1.55rem] leading-none font-light tracking-[0.12em] text-burgundy">
              {wedding.couple.initials}
            </p>
          </div>
        )}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 border border-gold/45"
        />
      </motion.div>

      {/* Front of the pocket, covering the still-tucked part of the photograph. */}
      <div
        className="envelope-pocket absolute inset-0 z-30 rounded-[3px]"
        style={{ clipPath: "polygon(0 100%, 0 2%, 50% 16%, 100% 2%, 100% 100%)" }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 size-full text-gold/45"
        >
          <path
            d="M0 2 50 16 100 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="absolute inset-x-0 bottom-[8%] flex flex-col items-center gap-2.5">
          <FloralOrnament variant="crest" className="w-24 text-gold/40" />
          <span aria-hidden="true" className="rule-gold h-px w-[42%] opacity-55" />
        </div>
      </div>

      {/* Outer flap — its own 3D context, stacked above the photograph while closed. */}
      <div
        className="pointer-events-none absolute inset-0 z-[35]"
        style={{ perspective: "1400px" }}
      >
        <motion.div
          variants={variants.flapOuter}
          className="envelope-flap absolute inset-x-0 top-0 h-[46%] origin-top"
          style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 size-full text-gold/55"
          >
            <path
              d="M0 0 50 100 100 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </motion.div>
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[38] rounded-[3px] border border-gold/30"
      />

      <motion.div
        variants={variants.seal}
        aria-hidden="true"
        className="absolute left-1/2 top-[46%] z-40 flex size-[4.25rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full sm:size-20"
        style={{
          background:
            "radial-gradient(circle at 34% 26%, #a8324a 0%, #7d1a31 38%, #4e0a1c 100%)",
          boxShadow:
            "0 8px 20px -8px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(198,161,107,0.65), inset 0 0 14px -4px rgba(0,0,0,0.6)",
        }}
      >
        <span className="font-display text-[1.0625rem] leading-none font-normal tracking-[0.06em] text-gold">
          S&O
        </span>
      </motion.div>
    </div>
  );
}
