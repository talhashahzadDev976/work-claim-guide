import type { Ref } from "react";

/** Result panel shell. `aria-live` announces new results to screen readers (NFR-11). */
export function ResultCard({ children, ref }: { children: React.ReactNode; ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} aria-live="polite" className="scroll-mt-4 overflow-hidden rounded-card border border-line bg-surface">
      {children}
    </div>
  );
}

/** The big number, on the amber band. */
export function ResultHeadline({ label, value, sub }: { label: string; value: string; sub?: React.ReactNode }) {
  return (
    <div className="border-b-[3px] border-accent bg-accent-soft px-5 pt-5 pb-4 sm:px-6">
      <p className="text-[13px] font-semibold tracking-[0.06em] text-accent-ink uppercase">{label}</p>
      <p
        className={`mt-1 font-serif leading-none font-semibold tabular-nums ${
          // Ranges ("$12,000.00 – $34,000.00") need a smaller size to fit a 360px phone.
          value.length > 14
            ? "text-[26px] leading-tight sm:text-[30px] lg:text-[32px]"
            : "text-[36px] sm:text-[40px] lg:text-[48px]"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-2 text-ink/80">{sub}</p>}
    </div>
  );
}

export function ResultBody({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-4 sm:px-6">{children}</div>;
}

/** "How we calculated this" accordion (FR-07, CR-2). */
export function HowWeCalculated({ steps, emptyText }: { steps: React.ReactNode[] | null; emptyText: string }) {
  return (
    <details open>
      <summary className="flex items-center gap-2 py-1 font-semibold">
        <span aria-hidden className="marker text-[10px]">
          ▶
        </span>
        How we calculated this
      </summary>
      {steps && steps.length > 0 ? (
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px]">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-[15px] text-muted">{emptyText}</p>
      )}
    </details>
  );
}

/** Effective date and official source link (FR-08). */
export function RatesSource({
  effective,
  sourceUrl,
  label = "Rates effective",
}: {
  effective: string;
  sourceUrl: string | null | undefined;
  label?: string;
}) {
  return (
    <p className="mt-4 text-sm text-muted">
      {label} {effective} ·{" "}
      {sourceUrl ? (
        <a href={sourceUrl} className="text-brand underline underline-offset-2" target="_blank" rel="noopener noreferrer">
          Official source
        </a>
      ) : (
        <span>[OFFICIAL SOURCE]</span>
      )}
    </p>
  );
}

/** Copy link (FR-09) and Print / Save as PDF (FR-10). */
export function ResultActions({ onCopy, copied }: { onCopy: () => void; copied: boolean }) {
  const button = "h-12 rounded-card border border-brand px-3 font-semibold text-brand hover:bg-brand-soft";
  return (
    <div className="no-print mt-4 grid grid-cols-2 gap-3">
      <button type="button" onClick={onCopy} className={button}>
        {copied ? "Link copied" : "Copy link"}
      </button>
      <button type="button" onClick={() => window.print()} className={button}>
        <span className="lg:hidden">Save PDF</span>
        <span className="hidden lg:inline">Print / PDF</span>
      </button>
    </div>
  );
}

/** NFR-10: muted, never a red alarm. */
export function EstimateNotice({ children }: { children?: React.ReactNode }) {
  return (
    <p className="mt-4 text-sm text-muted">
      {children ?? "Estimate only, not legal advice. Your actual benefit is set by your claims administrator."}
    </p>
  );
}

/** Shown in place of a number while official figures are still being checked. */
export function PendingNotice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-[15px] text-muted">{children}</p>
    </>
  );
}
