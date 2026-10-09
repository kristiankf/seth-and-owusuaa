"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ENVELOPE_TIMINGS, envelopeVariants, pressFeedback } from "@/lib/animations";
import { EnvelopeAnimation } from "@/components/invitation/EnvelopeAnimation";
import {
  HeroPhotoFlight,
  type FlightRect,
} from "@/components/invitation/HeroPhotoFlight";
import {
  InvitationContext,
  type InvitationPhase,
} from "@/components/invitation/invitation-context";
import { FloralOrnament } from "@/components/ui/FloralOrnament";
import { CoupleWordmark } from "@/components/ui/CoupleWordmark";

interface InvitationCoverProps {
  /** The full page, rendered beneath the cover and inert while it is shown. */
  readonly children: React.ReactNode;
}

interface Flight {
  readonly from: FlightRect;
  readonly to: FlightRect;
}

function readRect(element: Element | null): FlightRect | null {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  if (rect.width < 8 || rect.height < 8) return null;
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}

/**
 * Owns the invitation-opening state and the transition into the main page.
 *
 * While closed, the cover is a normal block at the top of the document rather
 * than a fixed overlay. That means the page degrades gracefully: with
 * JavaScript unavailable the guest simply scrolls past the invitation into the
 * full programme. Once opening begins the cover is promoted to a fixed overlay
 * so the hero underneath sits in its real layout, ready to receive the
 * photograph.
 *
 * Refresh always returns here: scroll restoration is disabled and the page is
 * pinned to the top while the cover is up, so a reload cannot leave a guest
 * stranded mid-page with scrolling locked.
 */
export function InvitationCover({ children }: InvitationCoverProps) {
  const [phase, setPhase] = useState<InvitationPhase>("closed");
  const [flight, setFlight] = useState<Flight | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const phaseRef = useRef<InvitationPhase>(phase);
  const holdTimer = useRef<number | null>(null);
  const pendingDestination = useRef(false);
  const instructionsId = useId();

  const reduced = useReducedMotion() ?? false;
  const variants = envelopeVariants(reduced);

  const isCovered = phase !== "open";
  const isOverlay = phase === "peeking" || phase === "expanding";

  const clearHold = useCallback(() => {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  const finishOpen = useCallback(() => {
    phaseRef.current = "open";
    document.documentElement.classList.remove("invitation-awaiting");
    setFlight(null);
    setPhase("open");
  }, []);

  /*
   * Refresh / back-forward cache: never restore a mid-page scroll while the
   * cover is locking the document. A restored offset plus `overflow: hidden`
   * is what made reload feel stuck.
   */
  useEffect(() => {
    const { history } = window;
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";

    const pinToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    pinToTop();
    window.addEventListener("pageshow", pinToTop);
    window.addEventListener("load", pinToTop);

    return () => {
      history.scrollRestoration = previousRestoration;
      window.removeEventListener("pageshow", pinToTop);
      window.removeEventListener("load", pinToTop);
    };
  }, []);

  useEffect(() => {
    if (!isCovered) return;

    const html = document.documentElement;
    const { body } = document;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const pinToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };
    pinToTop();
    window.addEventListener("scroll", pinToTop, { passive: true });

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      window.removeEventListener("scroll", pinToTop);
    };
  }, [isCovered]);

  useEffect(() => {
    document.documentElement.classList.toggle("invitation-awaiting", isCovered);
  }, [isCovered]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || !isCovered) return;

    content.inert = true;
    return () => {
      content.inert = false;
    };
  }, [isCovered]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    return () => {
      clearHold();
    };
  }, [clearHold]);

  /*
   * Where to send the guest once the cover has gone. This runs in an effect
   * declared after the `inert` effect above, so the page content is already
   * focusable again by the time focus is moved into it.
   */
  useEffect(() => {
    if (phase !== "open") return;

    if (!pendingDestination.current) return;
    pendingDestination.current = false;
    document.getElementById("couple-names")?.focus({ preventScroll: true });
  }, [phase]);

  const startExpand = useCallback(() => {
    if (phaseRef.current !== "peeking") return;

    const from = readRect(cardRef.current);
    const to = readRect(document.getElementById("hero-portrait"));

    if (!from || !to) {
      finishOpen();
      return;
    }

    phaseRef.current = "expanding";
    setFlight({ from, to });
    setPhase("expanding");
  }, [finishOpen]);

  const handlePeekComplete = useCallback(() => {
    if (phaseRef.current !== "peeking") return;
    if (holdTimer.current !== null) return;

    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      startExpand();
    }, ENVELOPE_TIMINGS.holdMs);
  }, [startExpand]);

  const open = useCallback(() => {
    if (phase !== "closed") return;

    pendingDestination.current = true;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    if (reduced) {
      finishOpen();
      return;
    }

    phaseRef.current = "peeking";
    setPhase("peeking");
  }, [phase, reduced, finishOpen]);

  return (
    <InvitationContext.Provider value={{ phase }}>
      {isCovered ? (
        <motion.div
          initial={false}
          animate={phase}
          className={`${
            isOverlay ? "fixed inset-0" : "relative"
          } screen-h z-50 flex flex-col overflow-hidden`}
        >
          {/*
           * Burgundy and envelope chrome fade on the same clock as the
           * photograph's enlarge, so the page is revealed with the flight
           * rather than cutting away after it.
           */}
          <motion.div
            variants={variants.chrome}
            className="relative flex min-h-0 flex-1 flex-col bg-burgundy"
          >
            {/* Warm vignette so the envelope sits in a pool of light. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 70% at 50% 38%, rgba(198,161,107,0.16) 0%, rgba(87,9,29,0) 62%)",
              }}
            />

            <div className="pad-safe-x pad-safe-b relative flex flex-1 flex-col items-center justify-between gap-6 py-[clamp(1.75rem,5vh,3.5rem)]">
              <header className="flex flex-col items-center text-center">
                <FloralOrnament variant="crest" className="w-32 text-gold/70" />
              </header>

              <motion.button
                type="button"
                onClick={open}
                aria-label="Open the wedding invitation"
                aria-describedby={instructionsId}
                aria-disabled={phase !== "closed"}
                className={`w-full max-w-[23rem] rounded-[4px] focus-visible:outline-offset-[6px] ${
                  phase === "closed" ? "cursor-pointer" : "pointer-events-none"
                }`}
                {...(phase === "closed" ? pressFeedback(reduced) : {})}
              >
                <EnvelopeAnimation
                  reduced={reduced}
                  phase={phase}
                  cardRef={cardRef}
                  onPeekComplete={handlePeekComplete}
                />
              </motion.button>

              <footer className="flex flex-col items-center gap-5 text-center">
                <p id={instructionsId} className="label-eyebrow text-ivory/70">
                  Tap to open
                </p>

                <CoupleWordmark className="text-[1.375rem] text-ivory/90" />
              </footer>
            </div>
          </motion.div>
        </motion.div>
      ) : null}

      {flight && phase === "expanding" ? (
        <HeroPhotoFlight
          from={flight.from}
          to={flight.to}
          duration={ENVELOPE_TIMINGS.expandDuration}
          onComplete={finishOpen}
        />
      ) : null}

      {/*
        The page is always rendered so its content is present in the initial
        HTML, but while the cover is on screen it is taken out of the tab
        order and hidden from assistive technology.
      */}
      <div ref={contentRef}>{children}</div>
    </InvitationContext.Provider>
  );
}
