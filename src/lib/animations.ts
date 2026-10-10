/**
 * Shared Motion variants.
 *
 * Every animated section draws from this module so the page has one
 * consistent motion language instead of ad-hoc durations scattered through
 * the components. Only `opacity` and `transform` are animated, which keeps
 * the work on the compositor.
 *
 * Reduced-motion handling lives here too: each factory takes a `reduced`
 * flag and collapses to an instant, offset-free state. Content is never
 * hidden behind an animation, so disabling motion never hides information.
 */
import { useMemo } from "react";
import { useReducedMotion, type Transition, type Variants } from "motion/react";

/** Calm deceleration curve used for content reveals. */
export const EASE_EDITORIAL = [0.22, 0.61, 0.36, 1] as const;
/** Slightly firmer curve for the envelope, which should feel weighted. */
export const EASE_ENVELOPE = [0.32, 0.72, 0.2, 1] as const;

const INSTANT: Transition = { duration: 0 };

/**
 * Default viewport trigger. `once` stops sections replaying when a guest
 * scrolls back up, and the margin starts the reveal just before the element
 * reaches the fold.
 */
export const revealViewport = { once: true, amount: 0.3, margin: "0px 0px -10% 0px" } as const;

/** For long lists, where a 30% threshold would never be met by a tall group. */
export const listViewport = { once: true, amount: 0.15, margin: "0px 0px -8% 0px" } as const;

export interface FadeUpOptions {
  /** Starting offset in pixels. */
  distance?: number;
  duration?: number;
  delay?: number;
}

/** A. Fade up — headings, body copy, most content. */
export function fadeUp(reduced: boolean, options: FadeUpOptions = {}): Variants {
  const { distance = 20, duration = 0.65, delay = 0 } = options;

  const transition = reduced
    ? INSTANT
    : delay > 0
      ? { duration, delay, ease: EASE_EDITORIAL }
      : { duration, ease: EASE_EDITORIAL };

  return {
    hidden: { opacity: 0, y: reduced ? 0 : distance },
    visible: {
      opacity: 1,
      y: 0,
      transition,
    },
  };
}

/** Fade and slide in from the right, arriving at the element's resting place. */
export function fadeFromRight(reduced: boolean, options: FadeUpOptions = {}): Variants {
  const { distance = 40, duration = 0.7, delay = 0 } = options;

  const transition = reduced
    ? INSTANT
    : delay > 0
      ? { duration, delay, ease: EASE_EDITORIAL }
      : { duration, ease: EASE_EDITORIAL };

  return {
    hidden: { opacity: 0, x: reduced ? 0 : distance },
    visible: {
      opacity: 1,
      x: 0,
      transition,
    },
  };
}

/** B. Soft image reveal — photographs settle from a barely perceptible scale. */
export function imageReveal(reduced: boolean, options: { duration?: number; delay?: number } = {}): Variants {
  const { duration = 1.1, delay = 0 } = options;

  return {
    hidden: { opacity: 0, scale: reduced ? 1 : 1.035 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: reduced ? INSTANT : { duration, delay, ease: EASE_EDITORIAL },
    },
  };
}

/**
 * C. Staggered content — parent container for timelines and lists.
 *
 * The stagger is deliberately small and capped by Motion's own scheduling, so
 * a 27-item list never makes a guest wait to read it.
 */
export function staggerGroup(
  reduced: boolean,
  options: { stagger?: number; delayChildren?: number } = {},
): Variants {
  const { stagger = 0.05, delayChildren = 0 } = options;

  return {
    hidden: {},
    visible: {
      transition: reduced
        ? INSTANT
        : { staggerChildren: stagger, delayChildren },
    },
  };
}

/** D. Decorative line reveal — dividers and the timeline spine. */
export function lineReveal(
  reduced: boolean,
  axis: "x" | "y" = "x",
  options: { duration?: number; delay?: number } = {},
): Variants {
  const { duration = 0.9, delay = 0 } = options;
  const from = reduced ? 1 : 0;
  const transition = reduced
    ? INSTANT
    : delay > 0
      ? { duration, delay, ease: EASE_EDITORIAL }
      : { duration, ease: EASE_EDITORIAL };

  if (axis === "y") {
    return {
      hidden: { scaleY: from, opacity: reduced ? 1 : 0.4 },
      visible: { scaleY: 1, opacity: 1, transition },
    };
  }

  return {
    hidden: { scaleX: from, opacity: reduced ? 1 : 0.4 },
    visible: { scaleX: 1, opacity: 1, transition },
  };
}

/** E. Interaction feedback — restrained, no elastic overshoot. */
export function pressFeedback(reduced: boolean) {
  if (reduced) return {};
  return {
    whileHover: { scale: 1.015 },
    whileTap: { scale: 0.985 },
    transition: { duration: 0.2, ease: EASE_EDITORIAL },
  } as const;
}

/**
 * F. Invitation opening.
 *
 * One `animate` state on the parent drives the envelope so the steps stay
 * in lockstep: the seal lifts, the flap swings back, the hero photograph
 * rises out of the pocket (`peeking`). While that peek holds, the pocket
 * parts down the middle like a book. A separate flight then enlarges the
 * photograph into the hero slot (`expanding`).
 *
 * The flap is two coincident faces with hidden backfaces. `outer` is stacked
 * above the envelope pocket so the closed envelope looks right, and `inner`
 * is stacked below the card so the opened flap sits behind it. Each becomes
 * visible only while it is facing the viewer, which gives correct depth
 * ordering without animating z-index through the card.
 */
export const ENVELOPE_TIMINGS = {
  /**
   * After the peek, the pocket opens down the middle like a book for this
   * long, revealing the whole photograph before it enlarges into place.
   */
  holdMs: 600,
  /** Enlarge-into-place and the matching burgundy fade, run together. */
  expandDuration: 1.15,
} as const;

export function envelopeVariants(reduced: boolean) {
  const openFlap = reduced ? 0 : -170;
  const openFlapInner = reduced ? 180 : 10;
  const peekY = reduced ? "0%" : "-38%";

  const flapSwing = reduced
    ? INSTANT
    : { duration: 0.7, delay: 0.22, ease: EASE_ENVELOPE };

  const seal: Variants = {
    closed: { opacity: 1, scale: 1 },
    peeking: {
      opacity: 0,
      scale: reduced ? 1 : 0.72,
      transition: reduced ? INSTANT : { duration: 0.32, ease: EASE_ENVELOPE },
    },
    expanding: { opacity: 0, scale: reduced ? 1 : 0.72 },
  };

  const flapOuter: Variants = {
    closed: { rotateX: 0 },
    peeking: { rotateX: openFlap, transition: flapSwing },
    expanding: { rotateX: openFlap },
  };

  const flapInner: Variants = {
    closed: { rotateX: 180 },
    peeking: { rotateX: openFlapInner, transition: flapSwing },
    expanding: { rotateX: openFlapInner },
  };

  const card: Variants = {
    closed: { y: "0%", opacity: 1 },
    peeking: {
      y: peekY,
      opacity: 1,
      transition: reduced ? INSTANT : { duration: 0.85, delay: 0.6, ease: EASE_ENVELOPE },
    },
    /* Instantly vacated — the portaled flight takes the photograph from here. */
    expanding: { y: peekY, opacity: 0, transition: INSTANT },
  };

  /*
   * Book open during the peek hold. The leaves are not driven by the cover
   * phase; they turn on their own once the photograph has finished rising.
   * Hinged at the spine, they swing toward the viewer and step outward so
   * the center of the card is clear before the hold ends.
   */
  const leafTurn = reduced
    ? INSTANT
    : { duration: ENVELOPE_TIMINGS.holdMs / 1000, ease: EASE_ENVELOPE };

  const leafLeft: Variants = {
    closed: { rotateY: 0, x: "0%" },
    open: {
      rotateY: reduced ? 0 : -70,
      x: reduced ? "0%" : "-88%",
      transition: leafTurn,
    },
  };

  const leafRight: Variants = {
    closed: { rotateY: 0, x: "0%" },
    open: {
      rotateY: reduced ? 0 : 70,
      x: reduced ? "0%" : "88%",
      transition: leafTurn,
    },
  };

  const chrome: Variants = {
    closed: { opacity: 1 },
    peeking: { opacity: 1 },
    expanding: {
      opacity: 0,
      transition: reduced
        ? INSTANT
        : { duration: ENVELOPE_TIMINGS.expandDuration, ease: EASE_EDITORIAL },
    },
  };

  return { seal, flapOuter, flapInner, card, chrome, leafLeft, leafRight };
}

/**
 * Pre-built variants for the common cases, so components do not each repeat
 * the `useReducedMotion` plumbing.
 */
export function useMotionPresets() {
  const reduced = useReducedMotion() ?? false;

  return useMemo(
    () => ({
      reduced,
      fadeUp: fadeUp(reduced),
      fadeUpSmall: fadeUp(reduced, { distance: 14, duration: 0.55 }),
      imageReveal: imageReveal(reduced),
      stagger: staggerGroup(reduced),
      staggerTight: staggerGroup(reduced, { stagger: 0.035 }),
      dividerReveal: lineReveal(reduced, "x"),
      spineReveal: lineReveal(reduced, "y", { duration: 1.1 }),
      press: pressFeedback(reduced),
    }),
    [reduced],
  );
}
