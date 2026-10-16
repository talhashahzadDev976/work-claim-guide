import { Suspense } from "react";
import { AdSlot, StickyMobileAd } from "@/components/ads/AdSlot";
import { Container } from "@/components/layout/Container";
import { PageSkeleton } from "@/components/layout/PageSkeleton";

/**
 * Frame shared by every calculator page. It renders instantly on navigation; when the content
 * reads route params, `streamed` wraps it in Suspense behind a skeleton.
 */
export function CalculatorPageShell({
  children,
  streamed = false,
  lang,
}: {
  children: React.ReactNode;
  streamed?: boolean;
  /** "en-GB" on UK pages (NFR-14). */
  lang?: string;
}) {
  return (
    <main id="main" lang={lang} className="has-sticky-ad">
      <Container className="pt-4 pb-12 sm:pt-6 lg:pb-16">
        {/* Desktop only: AD-4 forbids an ad above the calculator on phones. */}
        <AdSlot size="leaderboard" className="mb-6 hidden lg:flex" />
        {streamed ? <Suspense fallback={<PageSkeleton variant="calculator" />}>{children}</Suspense> : children}
      </Container>
      <StickyMobileAd />
    </main>
  );
}
