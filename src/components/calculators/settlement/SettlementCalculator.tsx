"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalculatorLayout } from "@/components/calculators/shared/CalculatorLayout";
import {
  CardTitle,
  cardClass,
  describedBy,
  Field,
  inputClass,
  PillRadios,
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
import {
  BODY_PARTS,
  OCCUPATION_GROUPS,
  settlementFactors,
  settlementRange,
  type SettlementInput,
  type SettlementResult,
} from "@/lib/calculators/settlement";
import { formatDate, formatUSD, parseMoney } from "@/lib/format";
import { isStackedLayout, useCopyLink } from "@/lib/hooks/useCopyLink";
import type { Jurisdiction } from "@/lib/rules/jurisdiction";

type Values = {
  rating: string;
  bodyPart: string;
  age: string;
  occupation: string;
  aww: string;
  futureMedical: "yes" | "no";
};
type FieldName = "rating" | "age" | "aww";
type Errors = Partial<Record<FieldName, string>>;

const INITIAL: Values = { rating: "", bodyPart: "back", age: "", occupation: "medium", aww: "", futureMedical: "no" };

function validate(field: FieldName, v: Values): string | undefined {
  if (field === "rating") {
    const n = Number(v.rating);
    if (!v.rating.trim() || Number.isNaN(n)) return "Enter your impairment rating as a percentage";
    if (n <= 0 || n > 100) return "The rating should be between 1 and 100";
  }
  if (field === "age") {
    const n = Number(v.age);
    if (!v.age.trim() || Number.isNaN(n)) return "Enter your age";
    if (n < 14 || n > 100) return "Enter an age between 14 and 100";
  }
  if (field === "aww") {
    const n = parseMoney(v.aww);
    if (Number.isNaN(n)) return "Enter your average weekly wage before tax";
    if (n <= 0) return "Your average weekly wage should be more than $0";
    if (n > 100_000) return "That number looks too large. Check it and try again.";
  }
  return undefined;
}

function toInput(v: Values): SettlementInput {
  return {
    rating: Number(v.rating),
    bodyPart: v.bodyPart,
    age: Number(v.age),
    occupation: v.occupation,
    aww: parseMoney(v.aww),
    futureMedical: v.futureMedical === "yes",
  };
}

const UNAVAILABLE: Record<Exclude<SettlementResult, { status: "ok" }>["reason"], (name: string) => string> = {
  "no-module": (n) => `We have not built ${n}'s permanent disability formula yet.`,
  "not-reviewed": (n) =>
    `We only show a settlement range once ${n}'s formula has been checked by a licensed professional.`,
  "missing-data": (n) => `We are still checking ${n}'s official permanent disability figures.`,
  "no-body-part": (n) => `${n}'s schedule does not list this body part. Your adjuster can tell you how it is rated.`,
};

export function SettlementCalculator({ jurisdiction: j, children }: { jurisdiction: Jurisdiction; children: React.ReactNode }) {
  const id = useId();
  const [values, setValues] = useState<Values>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<SettlementResult | null>(null);
  const [submitted, setSubmitted] = useState<Values | null>(null);
  const { copied, copy, reset } = useCopyLink();
  const resultRef = useRef<HTMLDivElement>(null);

  const set = (patch: Partial<Values>) => setValues((v) => ({ ...v, ...patch }));
  const onBlur = (f: FieldName) => setErrors((e) => ({ ...e, [f]: validate(f, values) }));

  function run(v: Values = values, scroll = true) {
    const next: Errors = { rating: validate("rating", v), age: validate("age", v), aww: validate("aww", v) };
    setErrors(next);
    const firstBad = (Object.keys(next) as FieldName[]).find((k) => next[k]);
    if (firstBad) {
      document.getElementById(`${id}-${firstBad}`)?.focus();
      return;
    }
    setResult(settlementRange(j, toInput(v)));
    setSubmitted(v);
    reset();
    if (scroll && isStackedLayout()) {
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  // FR-09: restore a shared link's inputs once the URL is readable (after hydration).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (!q.get("rating") || !q.get("aww")) return;
    const v: Values = {
      rating: q.get("rating") ?? "",
      bodyPart: BODY_PARTS.some((b) => b.value === q.get("part")) ? q.get("part")! : INITIAL.bodyPart,
      age: q.get("age") ?? "",
      occupation: OCCUPATION_GROUPS.some((o) => o.value === q.get("job")) ? q.get("job")! : INITIAL.occupation,
      aww: q.get("aww") ?? "",
      futureMedical: q.get("med") === "yes" ? "yes" : "no",
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(v);
    run(v, false);
    // Runs once on load; `run` only reads the values passed to it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ok = result?.status === "ok" ? result : null;
  const factors = settlementFactors(submitted ? toInput(submitted) : {});

  const resultCard = (
    <ResultCard ref={resultRef}>
      <ResultHeadline
        label="Estimated settlement range"
        value={ok ? `${formatUSD(ok.low)} – ${formatUSD(ok.high)}` : "$— – $—"}
        sub={ok ? "A range, not a promise of any amount" : result ? "Range not available yet" : "Enter your details to see a range"}
      />
      <ResultBody>
        {result && !ok && (
          <div className="mb-4">
            <PendingNotice title={`No ${j.name} range yet`}>
              {UNAVAILABLE[(result as Exclude<SettlementResult, { status: "ok" }>).reason](j.name)}
            </PendingNotice>
          </div>
        )}

        {ok && (
          <HowWeCalculated
            steps={[
              <>
                Weekly rate: <strong className="tabular-nums">{formatUSD(ok.weeklyRate)}</strong>
              </>,
              <>
                Weeks payable: <strong className="tabular-nums">{ok.weeks}</strong>
              </>,
              <>
                {formatUSD(ok.weeklyRate)} × {ok.weeks} weeks ={" "}
                <strong className="tabular-nums">{formatUSD(ok.base)}</strong>
              </>,
              ...ok.steps.slice(3).map((s) => `${s.label}: ${s.value}`),
            ]}
            emptyText=""
          />
        )}

        <div className={ok ? "mt-4" : ""}>
          <p className="font-semibold">What pushes the value up or down</p>
          <ul className="mt-2 space-y-2 text-[15px]">
            {factors.map((f) => (
              <li key={f.text} className="flex gap-2.5">
                <span
                  aria-hidden
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    f.direction === "up"
                      ? "bg-brand-soft text-brand"
                      : f.direction === "down"
                        ? "bg-accent-soft text-accent-ink"
                        : "bg-canvas text-muted"
                  }`}
                >
                  {f.direction === "up" ? "↑" : f.direction === "down" ? "↓" : "~"}
                </span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <RatesSource
          effective={formatDate(j.settlement_rules.effective_from)}
          sourceUrl={j.settlement_rules.source_url}
          label="Rules effective"
        />
        {result && submitted && (
          <ResultActions
            onCopy={() =>
              copy(
                new URLSearchParams({
                  rating: submitted.rating,
                  part: submitted.bodyPart,
                  age: submitted.age,
                  job: submitted.occupation,
                  aww: String(parseMoney(submitted.aww)),
                  med: submitted.futureMedical,
                }),
              )
            }
            copied={copied}
          />
        )}
        <EstimateNotice>
          Estimate only, not legal advice. Every settlement depends on the facts of the case; a licensed attorney can
          advise on yours.
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
      <CardTitle title="Your injury and pay" sub="Use the rating from your doctor's or the medical examiner's report." />

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field
          id={`${id}-rating`}
          label="Impairment rating (%)"
          error={errors.rating}
          help="Sometimes called a disability or PD rating."
        >
          <input
            id={`${id}-rating`}
            inputMode="decimal"
            autoComplete="off"
            value={values.rating}
            onChange={(e) => set({ rating: e.target.value })}
            onBlur={() => onBlur("rating")}
            {...describedBy(`${id}-rating`, errors.rating, true)}
            className={inputClass(errors.rating)}
          />
        </Field>

        <SearchSelect
          label="Injured body part"
          labelClassName="mb-2 block text-[15px] font-semibold"
          searchPlaceholder="Search body parts"
          options={BODY_PARTS.map((b) => ({ value: b.value, label: b.label }))}
          value={values.bodyPart}
          onChange={(v) => set({ bodyPart: v })}
          triggerClassName="h-12 rounded-card border border-line bg-surface px-4 text-lg text-ink hover:border-muted"
        />

        <Field id={`${id}-aww`} label="Average weekly wage ($)" error={errors.aww}>
          <input
            id={`${id}-aww`}
            inputMode="decimal"
            autoComplete="off"
            value={values.aww}
            onChange={(e) => set({ aww: e.target.value })}
            onBlur={() => onBlur("aww")}
            {...describedBy(`${id}-aww`, errors.aww)}
            className={inputClass(errors.aww)}
          />
        </Field>

        <Field id={`${id}-age`} label="Your age" error={errors.age}>
          <input
            id={`${id}-age`}
            inputMode="numeric"
            autoComplete="off"
            value={values.age}
            onChange={(e) => set({ age: e.target.value })}
            onBlur={() => onBlur("age")}
            {...describedBy(`${id}-age`, errors.age)}
            className={inputClass(errors.age)}
          />
        </Field>

        <SearchSelect
          label="Type of work"
          labelClassName="mb-2 block text-[15px] font-semibold"
          searchPlaceholder="Search"
          options={OCCUPATION_GROUPS.map((o) => ({ value: o.value, label: o.label }))}
          value={values.occupation}
          onChange={(v) => set({ occupation: v })}
          className="sm:col-span-2"
          triggerClassName="h-12 rounded-card border border-line bg-surface px-4 text-lg text-ink hover:border-muted"
        />
      </div>

      <div className="mt-5">
        <PillRadios
          name={`${id}-med`}
          legend="Will you need medical care in the future?"
          columns={2}
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No or not sure" },
          ]}
          value={values.futureMedical}
          onChange={(v) => set({ futureMedical: v })}
        />
      </div>

      <SubmitButton>Estimate my range</SubmitButton>
      <PrivacyNote />
    </form>
  );

  return (
    <CalculatorLayout
      inputs={inputs}
      result={resultCard}
      showResultOnMobile={result !== null}
      upsell={ok ? <ProUpsell source="settlement-calculator" /> : null}
    >
      {children}
    </CalculatorLayout>
  );
}
