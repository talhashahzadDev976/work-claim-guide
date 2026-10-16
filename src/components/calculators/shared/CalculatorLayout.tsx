import { AdSlot } from "@/components/ads/AdSlot";

/**
 * Calculator page body (§9.3). Desktop: inputs left (60%), result rail right (40%, sticky),
 * page content under the inputs. Phones: inputs, then result, upsell and ad, then content.
 */
export function CalculatorLayout({
  inputs,
  result,
  showResultOnMobile,
  upsell,
  children,
}: {
  inputs: React.ReactNode;
  /** The result card. Always visible on desktop; on phones only once there is something to show. */
  result: React.ReactNode;
  showResultOnMobile: boolean;
  /** Pro upsell, shown under the result only (design system: "appears under results only"). */
  upsell?: React.ReactNode;
  /** Server-rendered content for the main column, below the calculator. */
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6">
      <div className="lg:col-start-1 lg:row-start-1">{inputs}</div>

      <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <div className="rail-sticky flex flex-col gap-4">
          <div className={showResultOnMobile ? "" : "hidden lg:block"}>{result}</div>
          {upsell}
          {/* Slot A: below the result panel (AD-1 keeps ads away from inputs and result). */}
          <AdSlot size="rectangle" />
        </div>
      </div>

      <div className="no-print lg:col-start-1 lg:row-start-2">{children}</div>
    </div>
  );
}
