/**
 * Instant placeholder for state pages while their state-specific content streams in.
 * Shaped like the real layouts so the page doesn't jump when content arrives.
 */
function Bar({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-line/70 ${className}`} />;
}

function Card({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-card border border-line bg-surface ${className}`} />;
}

export function PageSkeleton({ variant }: { variant: "calculator" | "hub" }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Bar className="h-4 w-56" />
      <div className="mt-3 max-w-[720px] space-y-3">
        <Bar className="h-8 w-full lg:h-10" />
        <Bar className="h-8 w-2/3 lg:h-10" />
        <Bar className="mt-4 h-4 w-80 max-w-full" />
      </div>

      {variant === "calculator" ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6">
          <Card className="h-[480px]" />
          <Card className="hidden h-[360px] lg:block" />
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
          <div className="space-y-4">
            <Bar className="h-7 w-40" />
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Bar key={i} className="h-9 w-36 rounded-full" />
              ))}
            </div>
            <div className="grid gap-3 pt-6 sm:grid-cols-2 sm:gap-4">
              {[0, 1, 2, 3].map((i) => (
                <Card key={i} className="h-[130px]" />
              ))}
            </div>
          </div>
          <Card className="hidden h-[240px] lg:block" />
        </div>
      )}
    </div>
  );
}
