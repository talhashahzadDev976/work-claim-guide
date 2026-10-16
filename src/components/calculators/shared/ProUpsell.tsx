import { WaitlistButton } from "@/components/ui/WaitlistButton";

/** Pro upsell card: one line of benefit and one button, under results only. Phase 1 = waitlist test. */
export function ProUpsell({ source, children }: { source: string; children?: React.ReactNode }) {
  return (
    <section className="no-print rounded-card bg-brand-soft p-5 sm:p-6">
      <h2 className="font-sans text-lg font-semibold">Get your full claim report</h2>
      <p className="mt-1 text-[15px]">
        {children ?? "Benefit breakdown, payment timeline and the questions to ask your adjuster, as a PDF."}
      </p>
      <WaitlistButton source={source} />
    </section>
  );
}
