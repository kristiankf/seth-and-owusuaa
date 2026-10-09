import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Manrope } from "next/font/google";
import { wedding } from "@/data/wedding";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-cormorant",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-manrope",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-great-vibes",
});

const title = `${wedding.couple.combined} | Wedding Invitation`;
const description = `Join ${wedding.couple.groom} and ${wedding.couple.bride} as they celebrate their wedding on ${wedding.ceremony.dateDisplay}.`;

/**
 * The URL guests actually receive. Do not use
 * `VERCEL_PROJECT_PRODUCTION_URL`: Vercel can set that to an internal
 * hostname (this project was emitting `ug-fleet-79s3.vercel.app`) that
 * 404s, so WhatsApp fetches a dead `og:image`.
 */
const PRODUCTION_SITE_URL = "https://sethandowusuaa.vercel.app";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "production"
    ? PRODUCTION_SITE_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

/** Generated from the hero photograph by `npm run images`. */
const socialCard = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: `${wedding.couple.combined} — ${wedding.ceremony.dateDisplay}`,
  type: "image/jpeg",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: title,
  keywords: [wedding.couple.combined, "wedding", wedding.hashtag, wedding.venue.name],
  openGraph: {
    title,
    description,
    type: "website",
    url: "/",
    siteName: title,
    locale: "en_GB",
    images: [socialCard],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialCard],
  },
  robots: {
    // A private-feeling invitation: discoverable by link, not by search.
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#57091D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*
     * The font variables must live on `html`, not `body`: Tailwind declares
     * the theme tokens on `:root`, and a token such as
     * `--font-display: var(--font-cormorant), …` is only resolvable if
     * `--font-cormorant` is declared on that same element.
     */
    <html
      lang="en-GB"
      className={`${cormorant.variable} ${manrope.variable} ${greatVibes.variable}`}
    >
      <body className="antialiased">
        {/*
          Without JavaScript the scroll-triggered reveals never run, so their
          initial hidden state is neutralised here. The invitation cover sits
          outside `main`/`footer` and keeps its own layering.
        */}
        <noscript>
          <style>{`main [style*="opacity:0"], footer [style*="opacity:0"] { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>

        {children}
      </body>
    </html>
  );
}
