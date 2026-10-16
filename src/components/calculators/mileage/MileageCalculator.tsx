"use client";

import { useEffect, useId, useState } from "react";
import { CalculatorLayout } from "@/components/calculators/shared/CalculatorLayout";
import { CardTitle, cardClass, describedBy, Field, inputClass, PrivacyNote } from "@/components/calculators/shared/fields";
import { ProUpsell } from "@/components/calculators/shared/ProUpsell";
import {
  EstimateNotice,
  HowWeCalculated,
  PendingNotice,
  RatesSource,
  ResultActions,
  ResultBody,
  ResultCard,
  ResultHeadline,
} from "@/components/calculators/shared/ResultCard";
import { DatePicker } from "@/components/ui/DatePicker";
import { claimedMiles, mileageClaim, type Trip } from "@/lib/calculators/mileage";
import { formatDate, formatMiles, formatUSD, parseMoney, todayISO } from "@/lib/format";
import { useCopyLink } from "@/lib/hooks/useCopyLink";
import { latestRateTable, type Jurisdiction } from "@/lib/rules/jurisdiction";

type Draft = { date: string; from: string; to: string; miles: string; roundTrip: boolean; costs: string };
type DraftField = "date" | "miles" | "costs";
type Errors = Partial<Record<DraftField, string>>;

const EMPTY_DRAFT: Draft = { date: "", from: "", to: "", miles: "", roundTrip: true, costs: "" };

function validate(field: DraftField, d: Draft): string | undefined {
  if (field === "date") {
    if (!d.date) return "Enter the date of the appointment, like 09/02/2026";
    if (d.date > todayISO()) return "The trip date can't be in the future";
  }
  if (field === "miles") {
    const n = Number(d.miles);
    if (!d.miles.trim() || Number.isNaN(n) || n <= 0) return "Enter the miles for one way";
    if (n > 2000) return "That looks too far for one trip. Check the miles.";
  }
  if (field === "costs" && d.costs.trim()) {
    const n = parseMoney(d.costs);
    if (Number.isNaN(n) || n < 0) return "Enter parking and tolls in dollars, or leave it blank";
  }
  return undefined;
}

function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Compact form for links: [date, from, to, miles, roundTrip, costs]. */
type Packed = [string, string, string, number, 0 | 1, number];
const pack = (trips: Trip[]): Packed[] => trips.map((t) => [t.date, t.from, t.to, t.miles, t.roundTrip ? 1 : 0, t.costs]);
function unpack(raw: unknown): Trip[] | null {
  if (!Array.isArray(raw)) return null;
  const trips = raw
    .filter((r): r is Packed => Array.isArray(r) && r.length === 6 && typeof r[0] === "string" && typeof r[3] === "number")
    .map(([date, from, to, miles, rt, costs]) => ({
      id: newId(),
      date,
      from: String(from),
      to: String(to),
      miles,
      roundTrip: rt === 1,
      costs: Number(costs) || 0,
    }));
  return trips.length ? trips : null;
}

export function MileageCalculator({ jurisdiction: j, children }: { jurisdiction: Jurisdiction; children: React.ReactNode }) {
  const id = useId();
  const storageKey = `wcg-mileage-${j.slug}`;
  const [trips, setTrips] = useState<Trip[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Errors>({});
  const [person, setPerson] = useState({ name: "", claim: "" });
  const [loaded, setLoaded] = useState(false);
  const { copied, copy, reset } = useCopyLink();

  // Load the log: a shared link wins, otherwise what this device saved last time.
  // Both live outside React (URL, localStorage), so this has to run after hydration.
  useEffect(() => {
    let fromLink: Trip[] | null = null;
    try {
      const t = new URLSearchParams(window.location.search).get("t");
      if (t) fromLink = unpack(JSON.parse(t));
    } catch {
      // Malformed link: ignore it and fall back to the saved log.
    }
    let saved: { trips?: Trip[]; person?: { name: string; claim: string } } = {};
    try {
      saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    } catch {
      // Storage blocked or corrupt: start fresh.
    }
    /* eslint-disable react-hooks/set-state-in-effect */
    setTrips(fromLink ?? saved.trips ?? []);
    if (saved.person) setPerson(saved.person);
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [storageKey]);

  // Keep the log on this device only (FR-05: nothing is sent to us).
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ trips, person }));
    } catch {
      // Storage full or blocked: the log still works for this visit.
    }
  }, [loaded, storageKey, trips, person]);

  const setD = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const onBlur = (f: DraftField) => setErrors((e) => ({ ...e, [f]: validate(f, draft) }));

  function addTrip() {
    const next: Errors = { date: validate("date", draft), miles: validate("miles", draft), costs: validate("costs", draft) };
    setErrors(next);
    const firstBad = (Object.keys(next) as DraftField[]).find((k) => next[k]);
    if (firstBad) {
      document.getElementById(`${id}-${firstBad}`)?.focus();
      return;
    }
    const costs = draft.costs.trim() ? parseMoney(draft.costs) : 0;
    setTrips((t) => [
      ...t,
      {
        id: newId(),
        date: draft.date,
        from: draft.from.trim(),
        to: draft.to.trim(),
        miles: Number(draft.miles),
        roundTrip: draft.roundTrip,
        costs,
      },
    ]);
    // Keep the date and places: people often log repeat trips to the same clinic.
    setDraft((d) => ({ ...d, miles: d.miles, costs: "" }));
    reset();
    requestAnimationFrame(() => document.getElementById(`${id}-date`)?.focus());
  }

  function clearLog() {
    if (window.confirm("Remove every trip from this log? This can't be undone.")) setTrips([]);
  }

  const result = mileageClaim(j, trips);
  const hasTrips = trips.length > 0;
  const allPriced = hasTrips && result.unpricedTrips === 0;
  const latest = latestRateTable(j);
  const rates = [...new Set(result.lines.filter((l) => l.rate !== null).map((l) => l.rate))];

  const steps = hasTrips
    ? [
        <>
          Miles: {trips.length} {trips.length === 1 ? "trip" : "trips"}, round trips counted twice ={" "}
          <strong className="tabular-nums">{formatMiles(result.totalMiles)}</strong>
        </>,
        allPriced ? (
          <>
            Mileage:{" "}
            {rates.length === 1
              ? `${formatMiles(result.totalMiles)} × ${formatUSD(rates[0]!)} a mile = `
              : "each trip × the rate in effect on its date = "}
            <strong className="tabular-nums">{formatUSD(result.mileageAmount)}</strong>
          </>
        ) : (
          `Mileage: × ${j.name}'s rate per mile [RATE] for each trip date`
        ),
        <>
          Parking and tolls: <strong className="tabular-nums">{formatUSD(result.totalCosts)}</strong>
        </>,
        ...(allPriced
          ? [
              <>
                Total: {formatUSD(result.mileageAmount)} + {formatUSD(result.totalCosts)} ={" "}
                <strong className="tabular-nums">{formatUSD(result.totalClaim)}</strong>
              </>,
            ]
          : []),
      ]
    : null;

  const resultCard = (
    <ResultCard>
      {allPriced ? (
        <ResultHeadline
          label="Total to claim"
          value={formatUSD(result.totalClaim)}
          sub={`${formatMiles(result.totalMiles)} · ${trips.length} ${trips.length === 1 ? "trip" : "trips"}`}
        />
      ) : (
        <ResultHeadline
          label={hasTrips ? "Total miles to claim" : "Total to claim"}
          value={hasTrips ? formatMiles(result.totalMiles) : "$—"}
          sub={
            hasTrips
              ? `Plus ${formatUSD(result.totalCosts)} in parking and tolls`
              : "Add your trips to see your total"
          }
        />
      )}
      <ResultBody>
        {hasTrips && !allPriced && (
          <div className="mb-4">
            <PendingNotice title={`We are still checking ${j.name}'s mileage rate`}>
              Your log and miles are ready to use. We will add the dollar amount once {j.name}&apos;s rate per mile has
              been checked against the official source, with its effective date.
            </PendingNotice>
          </div>
        )}
        <HowWeCalculated steps={steps} emptyText="Each trip you add is listed here, with the rate for its date." />
        <RatesSource
          effective={formatDate(latest?.mileage_rate_per_mile != null ? latest.effective_from : null)}
          sourceUrl={latest?.source_url}
          label="Mileage rate effective"
        />
        {hasTrips && (
          <ResultActions
            onCopy={() => copy(new URLSearchParams({ t: JSON.stringify(pack(trips)) }))}
            copied={copied}
          />
        )}
        <EstimateNotice>
          Estimate only, not legal advice. Your claims administrator decides which trips and costs are repaid.
        </EstimateNotice>
      </ResultBody>

      {/* The printable log (FR-10): what the adjuster needs, without ads or navigation. */}
      {hasTrips && (
        <div className="print-only border-t border-line px-5 py-4 text-sm">
          <p className="font-semibold">Medical mileage log · {j.name}</p>
          <p>
            Name: {person.name || "________________"} · Claim number: {person.claim || "________________"}
          </p>
          <table className="mt-3 w-full border-collapse text-left">
            <thead>
              <tr>
                {["Date", "From", "To", "Miles", "Parking/tolls"].map((h) => (
                  <th key={h} className="border-b border-line py-1 pr-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.lines.map((l) => (
                <tr key={l.trip.id}>
                  <td className="py-1 pr-2">{formatDate(l.trip.date)}</td>
                  <td className="py-1 pr-2">{l.trip.from || "—"}</td>
                  <td className="py-1 pr-2">{l.trip.to || "—"}</td>
                  <td className="py-1 pr-2">
                    {l.miles}
                    {l.trip.roundTrip ? " (round trip)" : ""}
                  </td>
                  <td className="py-1 pr-2">{formatUSD(l.trip.costs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 font-semibold">
            Total: {formatMiles(result.totalMiles)} · {formatUSD(result.totalCosts)} parking and tolls
            {allPriced ? ` · ${formatUSD(result.totalClaim)} to claim` : ""}
          </p>
        </div>
      )}
    </ResultCard>
  );

  const inputs = (
    <div className="flex flex-col gap-4">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          addTrip();
        }}
        className={cardClass}
      >
        <CardTitle title="Add a trip" sub="One trip to a doctor, therapy, pharmacy or medical exam." />

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field id={`${id}-date`} label="Date of appointment" error={errors.date}>
            <DatePicker
              id={`${id}-date`}
              label="Date of appointment"
              value={draft.date}
              max="today"
              onChange={(iso) => {
                setD({ date: iso });
                setErrors((e) => ({ ...e, date: validate("date", { ...draft, date: iso }) }));
              }}
              invalid={!!errors.date}
              describedBy={errors.date ? `${id}-date-err` : undefined}
            />
          </Field>
          <Field id={`${id}-miles`} label="Miles, one way" error={errors.miles} help="Check it on a map app.">
            <input
              id={`${id}-miles`}
              inputMode="decimal"
              autoComplete="off"
              value={draft.miles}
              onChange={(e) => setD({ miles: e.target.value })}
              onBlur={() => onBlur("miles")}
              {...describedBy(`${id}-miles`, errors.miles, true)}
              className={inputClass(errors.miles)}
            />
          </Field>
          <Field id={`${id}-from`} label="From (optional)">
            <input
              id={`${id}-from`}
              autoComplete="off"
              placeholder="Home"
              value={draft.from}
              onChange={(e) => setD({ from: e.target.value })}
              className={inputClass()}
            />
          </Field>
          <Field id={`${id}-to`} label="To (optional)">
            <input
              id={`${id}-to`}
              autoComplete="off"
              placeholder="Clinic or doctor"
              value={draft.to}
              onChange={(e) => setD({ to: e.target.value })}
              className={inputClass()}
            />
          </Field>
          <Field id={`${id}-costs`} label="Parking and tolls ($)" error={errors.costs}>
            <input
              id={`${id}-costs`}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0"
              value={draft.costs}
              onChange={(e) => setD({ costs: e.target.value })}
              onBlur={() => onBlur("costs")}
              {...describedBy(`${id}-costs`, errors.costs)}
              className={inputClass(errors.costs)}
            />
          </Field>
          <label className="flex min-h-12 cursor-pointer items-center gap-3 self-end rounded-card border border-line px-4 py-3 hover:border-brand">
            <input
              type="checkbox"
              checked={draft.roundTrip}
              onChange={(e) => setD({ roundTrip: e.target.checked })}
              className="h-5 w-5 accent-[var(--brand)]"
            />
            <span className="leading-tight">
              <span className="block font-semibold">Round trip</span>
              <span className="block text-sm text-muted">Counts the miles twice</span>
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 h-13 w-full rounded-card bg-brand text-lg font-semibold text-on-brand hover:bg-brand-hover"
        >
          Add trip to my log
        </button>
        <PrivacyNote>Your log is saved only on this device. Nothing is sent to us.</PrivacyNote>
      </form>

      <section aria-labelledby={`${id}-log`} className={cardClass}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 id={`${id}-log`} className="font-sans text-xl font-semibold">
            Your trips {hasTrips && <span className="text-muted">({trips.length})</span>}
          </h2>
          {hasTrips && (
            <button type="button" onClick={clearLog} className="text-sm font-semibold text-muted underline hover:text-bad">
              Clear log
            </button>
          )}
        </div>

        {!hasTrips ? (
          <p className="mt-2 text-[15px] text-muted">No trips yet. Each trip you add appears here, oldest first.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {result.lines.map((l) => (
              <li key={l.trip.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {formatDate(l.trip.date)}
                    <span className="ml-2 font-normal text-muted tabular-nums">
                      {formatMiles(claimedMiles(l.trip))}
                      {l.trip.roundTrip ? " · round trip" : ""}
                    </span>
                  </p>
                  {(l.trip.from || l.trip.to || l.trip.costs > 0) && (
                    <p className="truncate text-[15px] text-muted">
                      {[
                        l.trip.from || l.trip.to ? `${l.trip.from || "—"} → ${l.trip.to || "—"}` : null,
                        l.trip.costs > 0 ? `${formatUSD(l.trip.costs)} parking/tolls` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {l.mileageAmount !== null && (
                    <span className="font-semibold tabular-nums">{formatUSD(l.mileageAmount + l.trip.costs)}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setTrips((t) => t.filter((x) => x.id !== l.trip.id))}
                    aria-label={`Remove trip on ${formatDate(l.trip.date)}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-brand-soft hover:text-bad"
                  >
                    <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current stroke-2">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {hasTrips && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field id={`${id}-name`} label="Your name (for the printed log)">
              <input
                id={`${id}-name`}
                autoComplete="name"
                value={person.name}
                onChange={(e) => setPerson((p) => ({ ...p, name: e.target.value }))}
                className={inputClass()}
              />
            </Field>
            <Field id={`${id}-claim`} label="Claim number (optional)">
              <input
                id={`${id}-claim`}
                autoComplete="off"
                value={person.claim}
                onChange={(e) => setPerson((p) => ({ ...p, claim: e.target.value }))}
                className={inputClass()}
              />
            </Field>
          </div>
        )}
      </section>
    </div>
  );

  return (
    <CalculatorLayout
      inputs={inputs}
      result={resultCard}
      showResultOnMobile={hasTrips}
      upsell={
        hasTrips ? (
          <ProUpsell source="mileage-calculator">
            A full claim report with your mileage log, payment timeline and the questions to ask your adjuster.
          </ProUpsell>
        ) : null
      }
    >
      {children}
    </CalculatorLayout>
  );
}
