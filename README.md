# Seth & Owusuaa — Wedding Invitation

A single-page digital invitation for Seth and Owusuaa’s wedding on **10 October 2026** at God’s Dream Church International, Tantra Hills.

The site is a static Next.js App Router application. There is no backend, no database, no authentication, and no API routes. Guests receive a link; they do not log in.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Motion for React (`motion`)
- `next/image` and `next/font/google` (Cormorant Garamond, Manrope, Great Vibes)

Great Vibes is used only for the ampersand in the couple’s names. All essential information is real HTML text, not baked into photographs.

## Requirements

- Node.js 20 or later
- npm (comes with Node)

No environment variables are required for local development or a normal Vercel deploy.

## Install

```bash
npm install
```

## Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The invitation cover is the first screen; tap the envelope (or press Enter / Space while it is focused) to open it. “Skip to the wedding programme” jumps straight to the order of service.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

`npm run build` is the production compile. After a successful build you can preview it with:

```bash
npm start
```

## Deploy to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket — or import the folder with the Vercel CLI (`npx vercel`).
2. Create a new Vercel project and point it at the repository. Vercel detects Next.js automatically.
3. Leave Environment Variables empty. The site reads `VERCEL_PROJECT_PRODUCTION_URL` (set by Vercel) only to build absolute Open Graph URLs; it does not need a secret or a custom variable.
4. Deploy. The production URL is the invitation guests should receive.

Do not add analytics, third-party trackers, or a backend. If a custom domain is attached later, Vercel continues to supply the production host.

## Project layout

```
assets/originals/          Untouched photographs. Never edited. Not deployed.
public/images/             WebP derivatives served to guests.
public/og.jpg              1200×630 social card, generated from the hero photo.
public/icon.svg            S/O monogram favicon.
scripts/optimize-images.mjs
src/app/                   App Router entry (layout + page).
src/components/            Invitation cover, sections, gallery, ornaments.
src/data/                  Wedding copy and lists (the single source of truth).
src/data/generated/        Typed image manifest — written by the image script.
src/lib/animations.ts      Shared motion variants.
```

Section order on the page: invitation cover → couple hero → welcome → order of service → order of photography → venue → gallery → closing.

## Photographs

Originals live in `assets/originals/` and are never overwritten. The build serves only the derivatives in `public/images/`.

Supported source types: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.tif`, `.tiff`. Any resolution and any aspect ratio is fine. The script:

- orients the file from its EXIF data
- resizes the longest edge to at most 2000px (never upscales)
- writes a WebP derivative
- records width, height, orientation, and a tiny blur placeholder
- rebuilds `public/og.jpg` from the current hero photograph

```bash
npm run images
```

Unchanged originals are skipped via a content hash, so re-running the script after adding one file is cheap.

### Replace an existing photograph

1. Drop the new file into `assets/originals/` using the same filename (for example `IMG_1613.JPG` to replace the hero).
2. Run `npm run images`.
3. If the filename (and therefore the slug) changed, update `heroImageSlug` in `src/data/wedding.ts`.

### Add gallery photographs

1. Drop the new files into `assets/originals/`.
2. Run `npm run images`. New slugs appear in the generated manifest and the gallery picks them up automatically.
3. Add a real description in `altTextBySlug` inside `src/data/gallery.ts`. Without one, guests using a screen reader hear a generic fallback.

Landscape photographs become feature tiles. Among portraits, every third image is promoted so the mosaic stays varied at any count. Next.js then serves AVIF/WebP at the breakpoints in `next.config.ts`, so a 6000px original and a 1200px original both reach the guest at the right size for their screen.

Do not commit empty image files. Do not point the gallery at photographs that are not in `assets/originals/`.

## Update wedding details

All guest-facing facts live in four files. Edit the data, not the components.

| What to change | File |
| --- | --- |
| Names, date, time, venue, RSVP, hashtag, hero photograph | `src/data/wedding.ts` |
| Order of service (17 items) | `src/data/order-of-service.ts` |
| Order of photography (27 groups) | `src/data/order-of-photography.ts` |
| Gallery alt text | `src/data/gallery.ts` |

The wording and sequence of the two orders are taken from the printed programme. Do not reorder or abbreviate them without the couple.

## Google Maps directions

The venue is **God’s Dream Church International, Tantra Hills**. The verified share link lives on `wedding.venue.mapsUrl` in `src/data/wedding.ts`. The venue section’s “Get Directions” button opens it in a new tab with `rel="noopener noreferrer"`.

To change the pin, replace that URL with another official Maps share link (`https://maps.app.goo.gl/…` or `https://www.google.com/maps/place/…`). Setting it back to `null` hides the button.

## Missing information

Documented so it is not silently invented:

- **Exact street address** — the programme names the church and Tantra Hills only.
- **Dress code, reception details** — not supplied; not shown.

RSVP contacts (**Fokuo** `055 343 2283`, **Asiedu** `050 186 8211`) live on `wedding.rsvp` and appear on the venue section as tap-to-call links.

## Accessibility and motion

- The cover is a real `<button>`, operable with keyboard and assistive technology.
- “Skip to the wedding programme” bypasses the opening animation.
- `prefers-reduced-motion: reduce` opens the cover immediately and collapses scroll reveals to instant fades.
- Without JavaScript the cover sits in normal document flow and the programme is readable below it.
- The gallery lightbox supports Escape, arrow keys, swipe, focus trapping, and returns focus to the tile that opened it.

## Colour

Burgundy `#57091D`, deep wine `#3B0715`, warm ivory `#F8F2EC`, champagne gold `#C6A16B`, antique rose `#C49A9D`, cocoa `#79513F`, charcoal `#211A1A`. Tokens live in `src/app/globals.css`.
