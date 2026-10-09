"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { GalleryImage } from "@/data/gallery";

interface GalleryLightboxProps {
  readonly images: readonly GalleryImage[];
  /** Index of the open photograph, or `null` when the lightbox is closed. */
  readonly index: number | null;
  readonly onClose: () => void;
  /**
   * Moves by `delta` photographs, wrapping around. Expressed as a step rather
   * than a target index so that rapid presses cannot act on a stale index.
   */
  readonly onStep: (delta: number) => void;
}

/** Horizontal distance a drag must cover before it counts as a swipe. */
const SWIPE_THRESHOLD = 60;

/**
 * Accessible modal photograph viewer.
 *
 * Rendered in a portal on `document.body` so it is never clipped by a
 * section's stacking or overflow context. Focus moves to the close control on
 * open and cycles within the dialog while it is open; the gallery restores
 * focus to the thumbnail that opened it.
 */
export function GalleryLightbox({ images, index, onClose, onStep }: GalleryLightboxProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const reduced = useReducedMotion() ?? false;

  const isOpen = index !== null;
  const total = images.length;
  const image = isOpen ? images[index] : undefined;

  const goTo = useCallback(
    (delta: number) => {
      if (total < 2) return;
      onStep(delta);
    },
    [total, onStep],
  );

  // Move focus into the dialog as soon as it opens.
  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
  }, [isOpen]);

  // Keep the page behind the dialog from scrolling.
  useEffect(() => {
    if (!isOpen) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Escape closes, arrows navigate, and Tab is kept inside the dialog.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(1);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(-1);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, goTo]);

  /*
   * There is no `document` while server rendering. The dialog is closed on
   * first render in the browser too, so the portal contributes no markup
   * either way and hydration stays in step.
   */
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && image ? (
        <motion.div
          key="lightbox"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Photograph ${index + 1} of ${total}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.28 }}
          className="on-dark fixed inset-0 z-100 flex flex-col bg-wine/95 backdrop-blur-sm"
        >
          <header className="pad-safe-x relative flex items-center justify-between gap-4 py-4">
            <p className="label-eyebrow text-gold tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </p>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="label-eyebrow inline-flex min-h-11 cursor-pointer items-center gap-2 px-3 text-ivory/80 transition-colors hover:text-ivory"
            >
              Close
              <span aria-hidden="true" className="text-lg leading-none">
                &times;
              </span>
            </button>
          </header>

          <motion.figure
            key={image.slug}
            className="pad-safe-x relative m-0 flex min-h-0 flex-1 cursor-zoom-out items-center justify-center"
            initial={{ opacity: 0, scale: reduced ? 1 : 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? 0 : 0.35 }}
            drag={total > 1 && !reduced ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.14}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_THRESHOLD) goTo(1);
              else if (info.offset.x > SWIPE_THRESHOLD) goTo(-1);
            }}
            /* Clicking the space around the photograph closes the viewer; the
               photograph itself is left alone so a mis-tap does not dismiss it. */
            onClick={(event) => {
              if (event.target === event.currentTarget) onClose();
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="100vw"
              quality={85}
              loading="eager"
              placeholder="blur"
              blurDataURL={image.blurDataURL}
              draggable={false}
              className="h-auto max-h-full w-auto max-w-full cursor-default object-contain select-none"
            />
          </motion.figure>

          {total > 1 ? (
            <footer className="pad-safe-x pad-safe-b relative flex items-center justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={() => goTo(-1)}
                className="label-eyebrow inline-flex min-h-11 cursor-pointer items-center gap-2 px-3 text-ivory/80 transition-colors hover:text-ivory"
              >
                <span aria-hidden="true">&larr;</span>
                Previous
              </button>

              <button
                type="button"
                onClick={() => goTo(1)}
                className="label-eyebrow inline-flex min-h-11 cursor-pointer items-center gap-2 px-3 text-ivory/80 transition-colors hover:text-ivory"
              >
                Next
                <span aria-hidden="true">&rarr;</span>
              </button>
            </footer>
          ) : (
            <div className="pad-safe-b" />
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
