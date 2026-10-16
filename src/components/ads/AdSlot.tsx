type Size = "leaderboard" | "rectangle";

const SIZES: Record<Size, { label: string; className: string }> = {
  // Fixed heights reserve the space so ads never shift the layout (FR-15).
  leaderboard: { label: "728×90", className: "h-[90px] w-full" },
  rectangle: { label: "300×250", className: "h-[250px] w-full" },
};

export function AdSlot({ size, className = "" }: { size: Size; className?: string }) {
  const s = SIZES[size];
  return (
    <aside
      aria-label="Advertisement"
      className={`ad-slot no-print flex items-center justify-center rounded-card border border-dashed border-line bg-ad text-xs tracking-[0.08em] text-muted uppercase ${s.className} ${className}`}
    >
      Advertisement · {s.label}
    </aside>
  );
}

/** 320×100 footer ad on phones and tablets; the page adds bottom padding so it never covers content. */
export function StickyMobileAd() {
  return (
    <aside
      aria-label="Advertisement"
      className="ad-slot no-print fixed inset-x-0 bottom-0 z-20 flex h-[100px] items-center justify-center border-t border-line bg-ad text-xs tracking-[0.08em] text-muted uppercase lg:hidden"
    >
      Sticky ad · 320×100
    </aside>
  );
}
