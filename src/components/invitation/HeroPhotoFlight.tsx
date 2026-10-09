"use client";

import { createPortal } from "react-dom";
import Image from "next/image";
import { motion } from "motion/react";
import { EASE_EDITORIAL } from "@/lib/animations";
import { getImage } from "@/data/generated/images";
import { wedding } from "@/data/wedding";

export interface FlightRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface HeroPhotoFlightProps {
  readonly from: FlightRect;
  readonly to: FlightRect;
  readonly duration: number;
  readonly onComplete: () => void;
}

/**
 * The hero photograph, lifted out of the envelope and flown into the hero
 * slot. Portaled to `document.body` so the cover's `overflow: hidden` cannot
 * clip the enlarge.
 */
export function HeroPhotoFlight({ from, to, duration, onComplete }: HeroPhotoFlightProps) {
  if (typeof document === "undefined") return null;

  const hero = getImage(wedding.heroImageSlug);
  if (!hero) return null;

  return createPortal(
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed z-[80] overflow-hidden rounded-[2px] will-change-transform"
      initial={{
        left: from.x,
        top: from.y,
        width: from.width,
        height: from.height,
        boxShadow: "0 22px 48px -20px rgba(0,0,0,0.55)",
      }}
      animate={{
        left: to.x,
        top: to.y,
        width: to.width,
        height: to.height,
        boxShadow: "0 0 0 0 rgba(0,0,0,0)",
      }}
      transition={{ duration, ease: EASE_EDITORIAL }}
      onAnimationComplete={onComplete}
    >
      <Image
        src={hero.src}
        alt=""
        width={hero.width}
        height={hero.height}
        sizes="100vw"
        priority
        placeholder="blur"
        blurDataURL={hero.blurDataURL}
        quality={82}
        className="h-full w-full object-cover object-top"
      />
    </motion.div>,
    document.body,
  );
}
