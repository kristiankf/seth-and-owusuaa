/**
 * Builds web-ready derivatives from the untouched photographs in
 * `assets/originals/`, writes a typed manifest to
 * `src/data/generated/images.ts`, and composes the social sharing card.
 *
 * Originals are never modified. Drop new photographs of any resolution or
 * aspect ratio into `assets/originals/` and run `npm run images`.
 *
 *   npm run images
 */
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const ORIGINALS_DIR = path.join(ROOT, "assets/originals");
const OUTPUT_DIR = path.join(ROOT, "public/images");
const MANIFEST_FILE = path.join(ROOT, "src/data/generated/images.ts");
const PUBLIC_PREFIX = "/images";

const SOURCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);

/** Longest edge of the stored derivative. Next/image downscales from here. */
const MAX_EDGE = 2000;
const WEBP_QUALITY = 82;
/** Width of the inline base64 placeholder used as `blurDataURL`. */
const PLACEHOLDER_WIDTH = 16;

/** `IMG_1613.JPG` -> `img-1613` */
function toSlug(fileName) {
  return path
    .basename(fileName, path.extname(fileName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toOrientation(width, height) {
  const ratio = width / height;
  if (ratio > 1.05) return "landscape";
  if (ratio < 0.95) return "portrait";
  return "square";
}

async function buildDerivative(sourcePath) {
  const source = sharp(sourcePath, { failOn: "error" }).rotate();
  const { width, height } = await source.metadata();

  if (!width || !height) {
    throw new Error(`Could not read dimensions for ${path.basename(sourcePath)}`);
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const derivative = await source
    .clone()
    .resize(targetWidth, targetHeight, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 5 })
    .toBuffer();

  const placeholder = await source
    .clone()
    .resize(PLACEHOLDER_WIDTH, null, { fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();

  return {
    derivative,
    width: targetWidth,
    height: targetHeight,
    sourceWidth: width,
    sourceHeight: height,
    blurDataURL: `data:image/webp;base64,${placeholder.toString("base64")}`,
  };
}

const OG_FILE = path.join(ROOT, "public/og.jpg");
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_PHOTO_WIDTH = 450;

/** Reads the hero slug out of the wedding config so it stays a single source of truth. */
async function readHeroSlug() {
  const config = await readFile(path.join(ROOT, "src/data/wedding.ts"), "utf8");
  return config.match(/heroImageSlug:\s*"([^"]+)"/)?.[1] ?? null;
}

/**
 * Composes the social sharing card.
 *
 * A 4:5 portrait cropped to 1.91:1 would cut the couple's faces, so the
 * photograph keeps its proportions in a tall panel on the right and the
 * wedding details sit in burgundy alongside it.
 */
async function buildSocialCard(records) {
  const heroSlug = await readHeroSlug();
  const hero = records.find((record) => record.slug === heroSlug) ?? records[0];

  const photo = await sharp(path.join(OUTPUT_DIR, path.basename(hero.src)))
    .resize(OG_PHOTO_WIDTH, OG_HEIGHT, { fit: "cover", position: "top" })
    .toBuffer();

  const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
  <defs>
    <linearGradient id="seam" x1="0" x2="1">
      <stop offset="0" stop-color="#57091D" stop-opacity="1" />
      <stop offset="1" stop-color="#57091D" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect x="${OG_WIDTH - OG_PHOTO_WIDTH}" y="0" width="150" height="${OG_HEIGHT}" fill="url(#seam)" />
  <rect x="26" y="26" width="${OG_WIDTH - 52}" height="${OG_HEIGHT - 52}" fill="none" stroke="#C6A16B" stroke-opacity="0.55" stroke-width="1.5" />
  <g font-family="Helvetica Neue, Helvetica, Arial, sans-serif">
    <text x="84" y="188" fill="#C6A16B" font-size="19" letter-spacing="5.5" font-weight="600">WEDDING INVITATION</text>
    <text x="84" y="455" fill="#F8F2EC" font-size="23" letter-spacing="0.4">God&#8217;s Dream Church International</text>
    <text x="84" y="492" fill="#C49A9D" font-size="22" letter-spacing="0.4">Tantra Hills</text>
    <text x="84" y="552" fill="#C6A16B" font-size="21" letter-spacing="2.4" font-weight="600">#GODWILLED2026</text>
  </g>
  <g font-family="Georgia, Times New Roman, serif">
    <text x="80" y="290" fill="#F8F2EC" font-size="82" font-weight="300" letter-spacing="1">Seth &amp; Owusuaa</text>
    <text x="84" y="396" fill="#F8F2EC" font-size="30" font-weight="300" letter-spacing="1.4">10 October 2026  &#183;  11:00 AM</text>
  </g>
  <rect x="84" y="330" width="120" height="1.4" fill="#C6A16B" />
</svg>`);

  const card = await sharp({
    create: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      channels: 3,
      background: "#57091D",
    },
  })
    .composite([
      { input: photo, left: OG_WIDTH - OG_PHOTO_WIDTH, top: 0 },
      { input: overlay, left: 0, top: 0 },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();

  await writeFile(OG_FILE, card);
  console.log(
    `\nSocial card from ${hero.slug} -> ${path.relative(ROOT, OG_FILE)}` +
      ` (${OG_WIDTH}x${OG_HEIGHT}, ${(card.byteLength / 1024).toFixed(0)} kB)`,
  );
}

async function main() {
  let entries;
  try {
    entries = await readdir(ORIGINALS_DIR, { withFileTypes: true });
  } catch {
    console.error(`No originals directory at ${path.relative(ROOT, ORIGINALS_DIR)}`);
    process.exitCode = 1;
    return;
  }

  const sources = entries
    .filter((entry) => entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

  if (sources.length === 0) {
    console.error(`No source images found in ${path.relative(ROOT, ORIGINALS_DIR)}`);
    process.exitCode = 1;
    return;
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(path.dirname(MANIFEST_FILE), { recursive: true });

  const records = [];
  const seenSlugs = new Map();

  for (const fileName of sources) {
    const slug = toSlug(fileName);
    if (seenSlugs.has(slug)) {
      throw new Error(`Duplicate slug "${slug}" from ${fileName} and ${seenSlugs.get(slug)}`);
    }
    seenSlugs.set(slug, fileName);

    const sourcePath = path.join(ORIGINALS_DIR, fileName);
    const outputPath = path.join(OUTPUT_DIR, `${slug}.webp`);
    const result = await buildDerivative(sourcePath);

    const nextHash = createHash("sha1").update(result.derivative).digest("hex");
    const existingHash = await readFile(outputPath)
      .then((buffer) => createHash("sha1").update(buffer).digest("hex"))
      .catch(() => null);

    if (existingHash !== nextHash) {
      await writeFile(outputPath, result.derivative);
    }

    const sourceBytes = (await readFile(sourcePath)).byteLength;
    console.log(
      `${fileName} (${result.sourceWidth}x${result.sourceHeight}, ${(sourceBytes / 1024 / 1024).toFixed(2)} MB)` +
        ` -> ${slug}.webp (${result.width}x${result.height}, ${(result.derivative.byteLength / 1024).toFixed(0)} kB)` +
        `${existingHash === nextHash ? " [unchanged]" : ""}`,
    );

    records.push({
      slug,
      src: `${PUBLIC_PREFIX}/${slug}.webp`,
      width: result.width,
      height: result.height,
      orientation: toOrientation(result.width, result.height),
      blurDataURL: result.blurDataURL,
      source: fileName,
    });
  }

  const manifest = `// Generated by \`npm run images\`. Do not edit by hand.
// Source photographs live in \`assets/originals/\` and are never modified.

export type ImageOrientation = "portrait" | "landscape" | "square";

export interface OptimizedImage {
  /** Stable key derived from the original filename. */
  readonly slug: string;
  /** Path to the optimised derivative under \`public/\`. */
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly orientation: ImageOrientation;
  /** Inline placeholder so images never cause layout shift while loading. */
  readonly blurDataURL: string;
  /** Original filename, for traceability. */
  readonly source: string;
}

export const optimizedImages = ${JSON.stringify(records, null, 2)} as const satisfies readonly OptimizedImage[];

export type ImageSlug = (typeof optimizedImages)[number]["slug"];

const bySlug = new Map<string, OptimizedImage>(optimizedImages.map((image) => [image.slug, image]));

/** Returns the optimised image for \`slug\`, or \`undefined\` if it is not available. */
export function getImage(slug: string): OptimizedImage | undefined {
  return bySlug.get(slug);
}
`;

  await writeFile(MANIFEST_FILE, manifest);
  console.log(`\nWrote ${records.length} entries to ${path.relative(ROOT, MANIFEST_FILE)}`);

  await buildSocialCard(records);
}

await main();
