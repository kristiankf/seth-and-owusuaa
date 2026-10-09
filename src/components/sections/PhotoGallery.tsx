"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { imageReveal, listViewport, useMotionPresets } from "@/lib/animations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GalleryLightbox } from "@/components/gallery/GalleryLightbox";
import { galleryImages, type GalleryImage } from "@/data/gallery";

interface GalleryEntry {
  readonly image: GalleryImage;
  /** Position in the full gallery, used to open the lightbox at this photo. */
  readonly index: number;
}

type GalleryRow =
  | { readonly kind: "feature"; readonly entry: GalleryEntry; readonly align: "start" | "end" }
  | { readonly kind: "pair"; readonly entries: readonly GalleryEntry[] };

/**
 * Arranges the photographs into an editorial rhythm of one large image
 * followed by a pair of smaller ones.
 *
 * The grouping is derived from each photograph's emphasis rather than
 * hardcoded, so the layout stays balanced whether there are three
 * photographs or thirty.
 */
function buildRows(images: readonly GalleryImage[]): GalleryRow[] {
  const rows: GalleryRow[] = [];
  let pending: GalleryEntry[] = [];
  let featureCount = 0;

  function flushPair() {
    if (pending.length === 0) return;
    rows.push({ kind: "pair", entries: pending });
    pending = [];
  }

  images.forEach((image, index) => {
    if (image.emphasis === "feature") {
      flushPair();
      rows.push({
        kind: "feature",
        entry: { image, index },
        align: featureCount % 2 === 0 ? "start" : "end",
      });
      featureCount += 1;
      return;
    }

    pending.push({ image, index });
    if (pending.length === 2) flushPair();
  });

  flushPair();
  return rows;
}

interface GalleryTileProps {
  readonly entry: GalleryEntry;
  readonly sizes: string;
  /** `natural` keeps the photograph's own proportions; `cover` squares up a row. */
  readonly fit: "natural" | "cover";
  readonly onOpen: (index: number) => void;
  readonly registerTrigger: (index: number, element: HTMLButtonElement | null) => void;
  readonly reduced: boolean;
  readonly className?: string;
}

function GalleryTile({
  entry,
  sizes,
  fit,
  onOpen,
  registerTrigger,
  reduced,
  className = "",
}: GalleryTileProps) {
  const [hasFailed, setHasFailed] = useState(false);
  const { image, index } = entry;

  return (
    <motion.button
      type="button"
      ref={(element) => registerTrigger(index, element)}
      onClick={() => onOpen(index)}
      aria-haspopup="dialog"
      variants={imageReveal(reduced, { duration: 0.9 })}
      initial="hidden"
      whileInView="visible"
      viewport={listViewport}
      className={`group relative block w-full cursor-zoom-in overflow-hidden bg-cocoa/8 ${
        fit === "cover" ? "aspect-4/5" : ""
      } ${className}`}
    >
      {hasFailed ? (
        /* A photograph that cannot be loaded degrades to a quiet placeholder
           rather than a broken image icon. */
        <span className="flex aspect-4/5 items-center justify-center px-5 text-center">
          <span className="label-eyebrow text-cocoa">Photograph unavailable</span>
        </span>
      ) : fit === "cover" ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          quality={78}
          placeholder="blur"
          blurDataURL={image.blurDataURL}
          onError={() => setHasFailed(true)}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          quality={80}
          placeholder="blur"
          blurDataURL={image.blurDataURL}
          onError={() => setHasFailed(true)}
          className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      )}

      {/* Gold hairline that resolves on hover and focus. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 border border-transparent transition-colors duration-300 group-hover:border-gold/60 group-focus-visible:border-gold"
      />
    </motion.button>
  );
}

export function PhotoGallery() {
  const { reduced } = useMotionPresets();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggers = useRef(new Map<number, HTMLButtonElement>());
  const lastOpened = useRef<number | null>(null);

  const rows = useMemo(() => buildRows(galleryImages), []);

  const registerTrigger = useCallback((index: number, element: HTMLButtonElement | null) => {
    if (element) triggers.current.set(index, element);
    else triggers.current.delete(index);
  }, []);

  const handleOpen = useCallback((index: number) => setOpenIndex(index), []);

  /* Stepping from the previous value keeps rapid key presses or swipes from
     acting on a stale index. */
  const handleStep = useCallback((delta: number) => {
    setOpenIndex((current) =>
      current === null
        ? current
        : (current + delta + galleryImages.length) % galleryImages.length,
    );
  }, []);

  // Remembers the photograph on screen so focus can return to its thumbnail.
  useEffect(() => {
    if (openIndex !== null) lastOpened.current = openIndex;
  }, [openIndex]);

  /** Returns focus to the thumbnail the guest was last looking at. */
  const handleClose = useCallback(() => {
    const target = lastOpened.current;
    setOpenIndex(null);
    if (target === null) return;
    requestAnimationFrame(() => triggers.current.get(target)?.focus());
  }, []);

  return (
    <section id="gallery" className="bg-ivory">
      <div className="pad-safe-x mx-auto flex max-w-6xl flex-col items-center gap-12 py-section sm:gap-16">
        <SectionHeading label="The Memories" title="A Glimpse of Our Journey" />

        {galleryImages.length === 0 ? (
          <p className="max-w-prose text-center text-body text-cocoa">
            Photographs will appear here once they are added to{" "}
            <code className="font-mono text-[0.9em]">assets/originals/</code> and{" "}
            <code className="font-mono text-[0.9em]">npm run images</code> has been run.
          </p>
        ) : (
          <div className="flex w-full flex-col gap-4 sm:gap-6 lg:gap-16">
            {rows.map((row) =>
              row.kind === "feature" ? (
                <div
                  key={row.entry.image.slug}
                  className={`lg:w-[58%] ${row.align === "end" ? "lg:ml-auto" : ""}`}
                >
                  <GalleryTile
                    entry={row.entry}
                    fit="natural"
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    onOpen={handleOpen}
                    registerTrigger={registerTrigger}
                    reduced={reduced}
                  />
                </div>
              ) : (
                <div
                  key={row.entries.map((entry) => entry.image.slug).join("-")}
                  /* Paired photographs stack on the narrowest phones rather
                     than shrinking into thumbnails. */
                  className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 sm:gap-6 lg:gap-10"
                >
                  {row.entries.map((entry, positionInRow) => (
                    <GalleryTile
                      key={entry.image.slug}
                      entry={entry}
                      fit="cover"
                      sizes="(min-width: 1024px) 45vw, 48vw"
                      onOpen={handleOpen}
                      registerTrigger={registerTrigger}
                      reduced={reduced}
                      /* The second photograph drops down on wide screens so the
                         pair reads as a composition rather than a grid row. */
                      className={positionInRow === 1 ? "lg:mt-16" : ""}
                    />
                  ))}
                </div>
              ),
            )}
          </div>
        )}
      </div>

      <GalleryLightbox
        images={galleryImages}
        index={openIndex}
        onClose={handleClose}
        onStep={handleStep}
      />
    </section>
  );
}
