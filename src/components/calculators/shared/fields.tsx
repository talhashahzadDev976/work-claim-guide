// Form building blocks shared by every calculator: labels, inline errors (FR-06) and 48px+ touch targets.

export const inputClass = (error?: string) =>
  `h-12 w-full min-w-0 rounded-card border bg-surface px-4 text-lg text-ink placeholder:text-muted/70 ${
    error ? "border-bad" : "border-line hover:border-muted"
  }`;

export function Field({
  id,
  label,
  error,
  help,
  children,
  className = "",
}: {
  id: string;
  label: string;
  error?: string;
  help?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[15px] font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-sm font-medium text-bad">
          {error}
        </p>
      ) : help ? (
        <p id={`${id}-help`} className="mt-1.5 text-sm text-muted">
          {help}
        </p>
      ) : null}
    </div>
  );
}

/** aria props that tie an input to its error or help text. */
export function describedBy(id: string, error?: string, hasHelp = false) {
  return {
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-err` : hasHelp ? `${id}-help` : undefined,
  };
}

/** Pill-style radio group ("How are you paid?", "Future medical care?"). */
export function PillRadios<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  columns = 3,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string; short?: string }[];
  value: T;
  onChange: (v: T) => void;
  columns?: 2 | 3;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[15px] font-semibold">{legend}</legend>
      <div className={`grid gap-2 sm:flex sm:flex-wrap ${columns === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {options.map((o) => (
          <label key={o.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span className="flex h-11 items-center justify-center rounded-full border border-line bg-surface px-2 font-semibold whitespace-nowrap peer-checked:border-brand peer-checked:bg-brand peer-checked:text-on-brand peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent hover:border-brand sm:px-5">
              {o.short ? (
                <>
                  <span className="min-[400px]:hidden">{o.short}</span>
                  <span className="hidden min-[400px]:inline">{o.label}</span>
                </>
              ) : (
                o.label
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CardTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <>
      <h2 className="font-sans text-xl font-semibold">{title}</h2>
      {sub && <p className="mt-0.5 text-[15px] text-muted">{sub}</p>}
    </>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="mt-6 h-13 w-full rounded-card bg-brand text-lg font-semibold text-on-brand hover:bg-brand-hover"
    >
      {children}
    </button>
  );
}

/** FR-05 / NFR-08 reassurance under every Calculate button. */
export function PrivacyNote({ children }: { children?: React.ReactNode }) {
  return (
    <p className="mt-3 text-sm text-muted">{children ?? "Your numbers stay in your browser. Nothing is sent to us."}</p>
  );
}

export const cardClass = "no-print rounded-card border border-line bg-surface p-5 sm:p-6";
