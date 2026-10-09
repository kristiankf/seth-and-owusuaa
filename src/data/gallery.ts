/**
 * Gallery metadata.
 *
 * The image list is derived from the generated manifest rather than hardcoded,
 * so dropping new photographs into `assets/originals/` and running
 * `npm run images` adds them to the gallery automatically at whatever
 * resolution and aspect ratio they happen to be.
 *
 * Add an entry to `altTextBySlug` for each new photograph so screen reader
 * users get a real description instead of the generic fallback.
 */
import { optimizedImages, type OptimizedImage } from "@/data/generated/images";
import { wedding } from "@/data/wedding";

/** How much visual weight a photograph is given in the editorial mosaic. */
export type GalleryEmphasis = "feature" | "standard";

export interface GalleryImage extends OptimizedImage {
  readonly alt: string;
  readonly emphasis: GalleryEmphasis;
}

const altTextBySlug: Record<string, string> = {
  "img-1590":
    "Owusuaa standing behind Seth with her arm around his shoulder, both in cream and white, smiling at the camera",
  "img-1591":
    "Seth and Owusuaa holding one another and laughing together, dressed in cream and white against a golden backdrop",
  "img-1612":
    "Seth seated on a wooden crate with Owusuaa standing beside him, both dressed in black",
  "img-1613": wedding.heroImageAlt,
  "img-1614":
    "Owusuaa standing beside Seth, who is seated on a tall stool, the two of them holding hands and smiling",
  "img-1615":
    "Seth and Owusuaa walking hand in hand in cream and white outfits against a golden backdrop",
  "img-2873":
    "Seth and Owusuaa standing together in a marble hallway, her patterned train spread on the floor",
  "img-2877":
    "Seth kissing Owusuaa's forehead as they hold hands in a hallway, her gown train behind her",
  "img-2885":
    "Seth and Owusuaa standing close in a hallway, smiling, her in a red-to-orange gown and him in burgundy",
  "img-2886":
    "Seth and Owusuaa in a hallway, her hand raised beside his face, both smiling at the camera",
  "img-2889":
    "Owusuaa in a beaded red-to-orange gown, holding a matching clutch and smiling at the camera",
};

/**
 * Interleaves the studio portraits with the newer hallway photographs so
 * the mosaic does not read as two separate albums. Slugs not listed here
 * are appended, so future `npm run images` still shows new files.
 */
const galleryOrder = [
  "img-1590",
  "img-2889",
  "img-1591",
  "img-2886",
  "img-1612",
  "img-2877",
  "img-1613",
  "img-2885",
  "img-1614",
  "img-2873",
  "img-1615",
] as const;

function altFor(image: OptimizedImage): string {
  return (
    altTextBySlug[image.slug] ??
    `${wedding.couple.combined} photographed together before their wedding`
  );
}

/**
 * Landscape photographs always read as features because they fill a row well.
 * Among portraits, every third one is promoted so the mosaic stays varied
 * however many photographs are supplied.
 */
function emphasisFor(image: OptimizedImage, index: number): GalleryEmphasis {
  if (image.orientation === "landscape") return "feature";
  return index % 3 === 0 ? "feature" : "standard";
}

function orderedImages(): OptimizedImage[] {
  const bySlug = new Map(optimizedImages.map((image) => [image.slug, image]));
  const used = new Set<string>();
  const ordered: OptimizedImage[] = [];

  for (const slug of galleryOrder) {
    const image = bySlug.get(slug);
    if (image) {
      ordered.push(image);
      used.add(slug);
    }
  }

  for (const image of optimizedImages) {
    if (!used.has(image.slug)) ordered.push(image);
  }

  return ordered;
}

export const galleryImages: readonly GalleryImage[] = orderedImages().map((image, index) => ({
  ...image,
  alt: altFor(image),
  emphasis: emphasisFor(image, index),
}));
