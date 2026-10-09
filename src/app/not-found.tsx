import type { Metadata } from "next";
import Link from "next/link";
import { CoupleWordmark } from "@/components/ui/CoupleWordmark";
import { FloralOrnament } from "@/components/ui/FloralOrnament";
import { wedding } from "@/data/wedding";

export const metadata: Metadata = {
  title: `Page not found | ${wedding.couple.combined}`,
  description: `This page is not part of ${wedding.couple.combined}'s wedding invitation.`,
};

/**
 * Root fallback for unmatched URLs and any `notFound()` call.
 *
 * It sits inside the root layout, so the invitation fonts and palette apply
 * without a separate document. The page is static so it still works if
 * JavaScript never loads.
 */
export default function NotFound() {
  return (
    <main className="on-dark relative flex screen-h flex-col overflow-hidden bg-burgundy">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 38%, rgba(198,161,107,0.16) 0%, rgba(87,9,29,0) 62%)",
        }}
      />

      <div className="pad-safe-x pad-safe-b relative mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-8 py-section text-center">
        <FloralOrnament variant="crest" className="w-40 text-gold/70" />

        <p className="label-eyebrow text-gold">This page does not exist</p>

        <h1 className="wordmark text-title text-ivory">
          This isn&apos;t part of the invitation
        </h1>

        <p className="max-w-prose text-lead text-rose">
          The celebration is still waiting for you at home.
        </p>

        <CoupleWordmark className="text-[1.375rem] text-ivory/90" />

        <span aria-hidden="true" className="rule-gold h-px w-24" />

        <Link
          href="/"
          className="label-eyebrow inline-flex min-h-12 items-center gap-3 border border-gold/70 bg-gold/10 px-8 text-ivory transition-colors hover:bg-gold/20"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
