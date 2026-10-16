"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalculatorLayout } from "@/components/calculators/shared/CalculatorLayout";
import {
  CardTitle,
  cardClass,
  describedBy,
  Field,
  inputClass,
  PrivacyNote,
  SubmitButton,
} from "@/components/calculators/shared/fields";
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
import { SearchSelect } from "@/components/ui/SearchSelect";
import { ukCompensation, type UkCompensationData, type UkCompensationResult } from "@/lib/calculators/uk-compensation";
import { formatDate, formatGBP, parseMoney } from "@/lib/format";
import { isStackedLayout, useCopyLink } from "@/lib/hooks/useCopyLink";

// UK page: UK English and pounds (NFR-14).

type Values = { injury: string; severity: string; lostEarnings: string; costs: string; careHours: string };
type FieldName = "lostEarnings" | "costs" | "careHours";
type Errors = Partial<Record<FieldName, string>>;

function validate(field: FieldName, v: Values): string | undefined {
  const raw = v[field].trim();
  if (!raw) return undefined; // all optional: blank means none
  const n = field === "careHours" ? Number(raw) : parseMoney(raw);
  if (Number.isNaN(n) || n < 0) {
    return field === "careHours" ? "Enter the hours as a number, or leave it blank" : "Enter an amount in pounds, or leave it blank";
  }
  if (n > 10_000_000) return "That number looks too large. Check it and try again.";
  return undefined;
}

const num = (s: string, money = true) => (s.trim() ? (money ? parseMoney(s) : Number(s)) : 0);

export function InjuryCompensationCalculator({ data, children }: { data: UkCompensationData; children: React.ReactNode }) {
  const id = useId();
  const [values, setValues] = useState<Values>({
    injury: data.injuries[0].id,
    severity: data.severities[0].id,
    lostEarnings: "",
    costs: "",
    careHours: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<UkCompensationResult | null>(null);
  const [submitted, setSubmitted] = useState<Values | null>(null);
  const { copied, copy, reset } = useCopyLink();
  const resultRef = useRef<HTMLDivElement>(null);

  const set = (patch: Partial<Values>) => setValues((v) => ({ ...v, ...patch }));
  const onBlur = (f: FieldName) => setErrors((e) => ({ ...e, [f]: validate(f, values) }));

  function run(v: Values = values, scroll = true) {
    const next: Errors = {
      lostEarnings: validate("lostEarnings", v),
      costs: validate("costs", v),
      careHours: validate("careHours", v),
    };
    setErrors(next);
    const firstBad = (Object.keys(next) as FieldName[]).find((k) => next[k]);
    if (firstBad) {
      document.getElementById(`${id}-${firstBad}`)?.focus();
      return;
    }
    setResult(
      ukCompensation(data, {
        injury: v.injury,
        severity: v.severity,
        lostEarnings: num(v.lostEarnings),
        costs: num(v.costs),
        careHours: num(v.careHours, false),
      }),
    );
    setSubmitted(v);
    reset();
    if (scroll && isStackedLayout()) {
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  // FR-09: restore a shared link's inputs once the URL is readable (after hydration).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (!q.get("injury")) return;
    const v: Values = {
      injury: data.injuries.some((i) => i.id === q.get("injury")) ? q.get("injury")! : data.injuries[0].id,
      severity: data.severities.some((s) => s.id === q.get("severity")) ? q.get("severity")! : data.severities[0].id,
      lostEarnings: q.get("earnings") ?? "",
      costs: q.get("costs") ?? "",
      careHours: q.get("care") ?? "",
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(v);
    run(v, false);
    // Runs once on load; `run` only reads the values passed to it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const injuryLabel = data.injuries.find((i) => i.id === submitted?.injury)?.label;
  const severityLabel = data.severities.find((s) => s.id === submitted?.severity)?.label;
  const hasGeneral = Boolean(result?.general);

  const steps = result
    ? [
        hasGeneral ? (
          <>
            General damages for a {severityLabel?.toLowerCase()} {injuryLabel?.toLowerCase()} injury:{" "}
            <strong className="tabular-nums">
              {formatGBP(result.general!.low)} – {formatGBP(result.general!.high)}
            </strong>
          </>
        ) : (
          `General damages for a ${severityLabel?.toLowerCase()} ${injuryLabel?.toLowerCase()} injury: [GUIDELINE BRACKET]`
        ),
        <>
          Lost earnings: <strong className="tabular-nums">{formatGBP(result.lostEarnings)}</strong>
        </>,
        <>
          Out-of-pocket costs: <strong className="tabular-nums">{formatGBP(result.costs)}</strong>
        </>,
        result.careHours > 0 ? (
          result.careValue === null ? (
            `Care from family: ${result.careHours} hours × [CARE RATE]`
          ) : (
            <>
              Care from family: {result.careHours} hours ={" "}
              <strong className="tabular-nums">{formatGBP(result.careValue)}</strong>
            </>
          )
        ) : (
          "Care from family: none entered"
        ),
        <>
          Special damages (your losses): <strong className="tabular-nums">{formatGBP(result.special)}</strong>
        </>,
      ]
    : null;

  const resultCard = (
    <ResultCard ref={resultRef}>
      {result?.combined ? (
        <ResultHeadline
          label="Estimated compensation"
          value={`${formatGBP(result.combined.low)} – ${formatGBP(result.combined.high)}`}
          sub="General damages plus your losses"
        />
      ) : (
        <ResultHeadline
          label={result ? "Your losses so far" : "Estimated compensation"}
          value={result ? formatGBP(result.special) : "£—"}
          sub={result ? "Special damages. General damages range coming soon." : "Choose your injury to see an estimate"}
        />
      )}
      <ResultBody>
        {result && !hasGeneral && (
          <div className="mb-4">
            <PendingNotice title="General damages are not available yet">
              The range for pain and suffering comes from the Judicial College Guidelines. We will add it once we have
              confirmed how the figures can be summarised and cited, and a professional has reviewed them.
            </PendingNotice>
          </div>
        )}
        <HowWeCalculated
          steps={steps}
          emptyText="Each part of the estimate will be listed here: general damages, then each of your losses."
        />
        <RatesSource
          effective={formatDate(data.effective_from, "DATE", "en-GB")}
          sourceUrl={data.source.url}
          label="Guidelines edition"
        />
        {result && submitted && (
          <ResultActions
            onCopy={() =>
              copy(
                new URLSearchParams({
                  injury: submitted.injury,
                  severity: submitted.severity,
                  earnings: String(num(submitted.lostEarnings)),
                  costs: String(num(submitted.costs)),
                  care: String(num(submitted.careHours, false)),
                }),
              )
            }
            copied={copied}
          />
        )}
        <EstimateNotice>
          Estimate only, not legal advice. For advice on your claim, speak to a solicitor.
        </EstimateNotice>
      </ResultBody>
    </ResultCard>
  );

  const inputs = (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        run();
      }}
      className={cardClass}
    >
      <CardTitle title="Your injury" sub="Pick the injury that affects you most." />

      <div className="mt-5">
        <SearchSelect
          label="Type of injury"
          labelClassName="mb-2 block text-[15px] font-semibold"
          searchPlaceholder="Search injuries"
          options={data.injuries.map((i) => ({ value: i.id, label: i.label }))}
          value={values.injury}
          onChange={(v) => set({ injury: v })}
          triggerClassName="h-12 rounded-card border border-line bg-surface px-4 text-lg text-ink hover:border-muted"
        />
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 text-[15px] font-semibold">How serious is it?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {data.severities.map((s) => (
            <label key={s.id} className="cursor-pointer">
              <input
                type="radio"
                name={`${id}-severity`}
                value={s.id}
                checked={values.severity === s.id}
                onChange={() => set({ severity: s.id })}
                className="peer sr-only"
              />
              <span className="block h-full rounded-card border border-line bg-surface px-4 py-3 peer-checked:border-brand peer-checked:bg-brand-soft peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent hover:border-brand">
                <span className="block font-semibold">{s.label}</span>
                <span className="block text-sm text-muted">{s.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <h3 className="mt-7 text-[19px] font-semibold">Your losses</h3>
      <p className="mt-0.5 text-[15px] text-muted">Leave blank anything that doesn&apos;t apply.</p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <Field
          id={`${id}-lostEarnings`}
          label="Earnings lost (£, after tax)"
          error={errors.lostEarnings}
          help="Pay you missed while off work."
        >
          <input
            id={`${id}-lostEarnings`}
            inputMode="decimal"
            autoComplete="off"
            value={values.lostEarnings}
            onChange={(e) => set({ lostEarnings: e.target.value })}
            onBlur={() => onBlur("lostEarnings")}
            {...describedBy(`${id}-lostEarnings`, errors.lostEarnings, true)}
            className={inputClass(errors.lostEarnings)}
          />
        </Field>
        <Field
          id={`${id}-costs`}
          label="Out-of-pocket costs (£)"
          error={errors.costs}
          help="Prescriptions, travel, physio, equipment."
        >
          <input
            id={`${id}-costs`}
            inputMode="decimal"
            autoComplete="off"
            value={values.costs}
            onChange={(e) => set({ costs: e.target.value })}
            onBlur={() => onBlur("costs")}
            {...describedBy(`${id}-costs`, errors.costs, true)}
            className={inputClass(errors.costs)}
          />
        </Field>
        <Field
          id={`${id}-careHours`}
          label="Hours of care from family or friends"
          error={errors.careHours}
          help="Total hours of help with washing, dressing, cooking or getting about."
          className="sm:col-span-2"
        >
          <input
            id={`${id}-careHours`}
            inputMode="decimal"
            autoComplete="off"
            value={values.careHours}
            onChange={(e) => set({ careHours: e.target.value })}
            onBlur={() => onBlur("careHours")}
            {...describedBy(`${id}-careHours`, errors.careHours, true)}
            className={inputClass(errors.careHours)}
          />
        </Field>
      </div>

      <SubmitButton>Estimate my compensation</SubmitButton>
      <PrivacyNote />
    </form>
  );

  return (
    <CalculatorLayout
      inputs={inputs}
      result={resultCard}
      showResultOnMobile={result !== null}
      upsell={
        result ? (
          <ProUpsell source="uk-compensation-calculator">
            A full report of your losses and a timeline you can share with your solicitor, as a PDF.
          </ProUpsell>
        ) : null
      }
    >
      {children}
    </CalculatorLayout>
  );
}
