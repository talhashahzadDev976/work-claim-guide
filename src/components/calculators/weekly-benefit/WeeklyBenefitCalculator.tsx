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
import { DatePicker } from "@/components/ui/DatePicker";
import { averageWeeklyWage, weeklyBenefit, type PayType, type WeeklyBenefitResult } from "@/lib/calculators/weekly-benefit";
import { formatDate, formatUSD, parseMoney, placeholder, todayISO } from "@/lib/format";
import { isStackedLayout, useCopyLink } from "@/lib/hooks/useCopyLink";
import { latestRateTable, rateWords, type Jurisdiction } from "@/lib/rules/jurisdiction";

type FieldName = "amount" | "hours" | "date";
type Errors = Partial<Record<FieldName, string>>;
type Values = { payType: PayType; amount: string; hours: string; date: string };

const PAY_TYPES: { value: PayType; label: string; short: string; amountLabel: string; missing: string }[] = [
  { value: "weekly", label: "Weekly", short: "Weekly", amountLabel: "Average weekly pay ($)", missing: "Enter your weekly pay before tax" },
  { value: "hourly", label: "Hourly", short: "Hourly", amountLabel: "Hourly rate ($)", missing: "Enter your hourly rate before tax" },
  { value: "yearly", label: "Yearly salary", short: "Yearly", amountLabel: "Yearly salary ($)", missing: "Enter your yearly salary before tax" },
];

function validate(field: FieldName, v: Values): string | undefined {
  if (field === "amount") {
    const n = parseMoney(v.amount);
    const missing = PAY_TYPES.find((p) => p.value === v.payType)!.missing;
    if (Number.isNaN(n)) return missing;
    if (n <= 0) return `${missing}. It should be more than $0.`;
    if (n > 10_000_000) return "That number looks too large. Check it and try again.";
  }
  if (field === "hours" && v.payType === "hourly") {
    const n = Number(v.hours);
    if (!v.hours.trim() || Number.isNaN(n) || n <= 0) return "Enter the hours you usually work each week";
    if (n > 168) return "A week has 168 hours. Enter a smaller number.";
  }
  if (field === "date") {
    if (!v.date) return "Enter the date you were injured, like 08/12/2026";
    if (v.date > todayISO()) return "The injury date can't be in the future";
  }
  return undefined;
}

export function WeeklyBenefitCalculator({
  jurisdiction: j,
  children,
}: {
  jurisdiction: Jurisdiction;
  /** Server-rendered content for the main column, below the calculator. */
  children: React.ReactNode;
}) {
  const id = useId();
  const [values, setValues] = useState<Values>({ payType: "weekly", amount: "", hours: "40", date: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<WeeklyBenefitResult | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const { copied, copy, reset } = useCopyLink();
  const amountRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const { payType, amount, hours, date } = values;
  const pay = PAY_TYPES.find((p) => p.value === payType)!;
  const set = (patch: Partial<Values>) => setValues((v) => ({ ...v, ...patch }));
  const onBlur = (field: FieldName) => setErrors((e) => ({ ...e, [field]: validate(field, values) }));

  function run(v: Values = values, scroll = true) {
    const next: Errors = { amount: validate("amount", v), hours: validate("hours", v), date: validate("date", v) };
    setErrors(next);
    const firstBad = (Object.keys(next) as FieldName[]).find((k) => next[k]);
    if (firstBad) {
      document.getElementById(`${id}-${firstBad}`)?.focus();
      return;
    }
    setResult(
      weeklyBenefit(j, { payType: v.payType, amount: parseMoney(v.amount), hoursPerWeek: Number(v.hours), injuryDate: v.date }),
    );
    reset();
    if (isStackedLayout()) {
      setCollapsed(true);
      if (scroll) requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  // FR-09: a shared link carries the inputs; restore them and show the result.
  // The URL is only readable after hydration, so this sync from it has to live in an effect.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const v: Values = {
      payType: (PAY_TYPES.some((p) => p.value === q.get("pay")) ? q.get("pay") : "weekly") as PayType,
      amount: q.get("amount") ?? "",
      hours: q.get("hours") ?? "40",
      date: q.get("date") ?? "",
    };
    if (!v.amount || !v.date) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(v);
    run(v, false);
    // Runs once on load; `run` only reads the values passed to it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function copyLink() {
    const q = new URLSearchParams({ pay: payType, amount: String(parseMoney(amount)), date });
    if (payType === "hourly") q.set("hours", hours);
    copy(q);
  }

  const ok = result?.status === "ok" ? result : null;
  const latest = latestRateTable(j);
  const awwOnly =
    result?.status === "no-rates"
      ? averageWeeklyWage({ payType, amount: parseMoney(amount), hoursPerWeek: Number(hours), injuryDate: date })
      : null;

  const steps = ok
    ? [
        <>
          Average weekly wage:{" "}
          {payType === "hourly"
            ? `${formatUSD(parseMoney(amount))} × ${hours} hours = `
            : payType === "yearly"
              ? `${formatUSD(parseMoney(amount))} ÷ 52 weeks = `
              : ""}
          <strong className="tabular-nums">{formatUSD(ok.aww)}</strong>
        </>,
        <>
          {j.name} pays {rateWords(ok.rate)}: {formatUSD(ok.aww)} × {ok.rate} ={" "}
          <strong className="tabular-nums">{formatUSD(ok.raw)}</strong>
        </>,
        ok.applied === "max"
          ? `Above the weekly max, so you get the max of ${formatUSD(ok.weekly)}`
          : ok.applied === "min"
            ? `Below the weekly min, so you get the min of ${formatUSD(ok.weekly)}`
            : ok.applied === "actual-wage"
              ? `Your wage is under the weekly min, so ${j.name} pays your actual wage`
              : `Checked against the ${placeholder(ok.table.weekly_max, "WEEKLY MAX", (v) => `weekly max of ${formatUSD(v)}`)} and ${placeholder(ok.table.weekly_min, "WEEKLY MIN", (v) => `weekly min of ${formatUSD(v)}`)} for your injury date`,
      ]
    : null;

  const resultCard = (
    <ResultCard ref={resultRef}>
      {result?.status === "not-covered" ? (
        <ResultBody>
          <PendingNotice title="This injury date is not covered yet">
            We only have {j.name} rates from {formatDate(result.earliest)}. Ask your claims administrator for the
            rate on your date.
          </PendingNotice>
        </ResultBody>
      ) : !latest ? (
        <>
          <ResultHeadline
            label={awwOnly !== null ? "Your average weekly wage" : "Estimated weekly benefit"}
            value={awwOnly !== null ? formatUSD(awwOnly) : "$—"}
            sub={awwOnly !== null ? "Weekly benefit estimate coming soon" : "Enter your pay to see your numbers"}
          />
          <ResultBody>
            <PendingNotice title={`We are still checking ${j.name}'s official rates`}>
              We only show a benefit estimate once {j.name}&apos;s benefit rate, weekly max and weekly min have been
              checked against the official state source, with their effective dates.
            </PendingNotice>
            <EstimateNotice />
          </ResultBody>
        </>
      ) : (
        <>
          <ResultHeadline
            label="Estimated weekly benefit"
            value={ok ? formatUSD(ok.weekly) : "$—"}
            sub={ok ? `About ${formatUSD(ok.monthly)} a month` : "Enter your pay to see your estimate"}
          />
          <ResultBody>
            <HowWeCalculated
              steps={steps}
              emptyText={`Each step will be listed here, with the ${j.name} rate for your injury date.`}
            />
            <RatesSource
              effective={formatDate(ok?.table.effective_from ?? latest.effective_from)}
              sourceUrl={ok?.table.source_url ?? latest.source_url}
            />
            {ok && <ResultActions onCopy={copyLink} copied={copied} />}
            <EstimateNotice />
          </ResultBody>
        </>
      )}
      {ok && (
        <p className="print-only px-5 pb-4 text-sm">
          Inputs: {pay.label.toLowerCase()} pay {formatUSD(parseMoney(amount))}
          {payType === "hourly" ? ` × ${hours} hours` : ""} · injury date {formatDate(date)}
        </p>
      )}
    </ResultCard>
  );

  const inputs = (
    <>
      {collapsed && result && (
        <div className="no-print flex items-center justify-between gap-4 rounded-card border border-line bg-surface p-5 lg:hidden">
          <div>
            <p className="text-muted">{pay.amountLabel.replace(" ($)", "")}</p>
            <p className="text-lg font-semibold">
              {formatUSD(parseMoney(amount))} · {pay.label.toLowerCase()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCollapsed(false);
              requestAnimationFrame(() => amountRef.current?.focus());
            }}
            className="h-12 rounded-card border border-brand px-5 font-semibold text-brand hover:bg-brand-soft"
          >
            Edit
          </button>
        </div>
      )}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
        className={`${cardClass} ${collapsed && result ? "hidden lg:block" : ""}`}
      >
        <CardTitle title="Your pay" sub="Use your pay before tax. Include regular overtime." />

        <div className="mt-5">
          <PillRadios
            name={`${id}-pay`}
            legend="How are you paid?"
            options={PAY_TYPES}
            value={payType}
            onChange={(p) => {
              set({ payType: p });
              setErrors({});
            }}
          />
        </div>

        <div className={`mt-5 grid gap-5 ${payType === "hourly" ? "sm:grid-cols-2" : ""}`}>
          <Field
            id={`${id}-amount`}
            label={pay.amountLabel}
            error={errors.amount}
            help="Not sure? An average weekly wage calculator is coming soon."
          >
            <input
              ref={amountRef}
              id={`${id}-amount`}
              inputMode="decimal"
              autoComplete="off"
              value={amount}
              onChange={(e) => set({ amount: e.target.value })}
              onBlur={() => onBlur("amount")}
              {...describedBy(`${id}-amount`, errors.amount, true)}
              className={inputClass(errors.amount)}
            />
          </Field>

          {payType === "hourly" && (
            <Field id={`${id}-hours`} label="Hours per week" error={errors.hours}>
              <input
                id={`${id}-hours`}
                inputMode="decimal"
                value={hours}
                onChange={(e) => set({ hours: e.target.value })}
                onBlur={() => onBlur("hours")}
                {...describedBy(`${id}-hours`, errors.hours)}
                className={inputClass(errors.hours)}
              />
            </Field>
          )}
        </div>

        <Field id={`${id}-date`} label="Date of injury" error={errors.date} className="mt-5">
          <DatePicker
            id={`${id}-date`}
            label="Date of injury"
            value={date}
            max="today"
            onChange={(iso) => {
              set({ date: iso });
              setErrors((e) => ({ ...e, date: validate("date", { ...values, date: iso }) }));
            }}
            invalid={!!errors.date}
            describedBy={errors.date ? `${id}-date-err` : undefined}
          />
        </Field>

        <SubmitButton>Calculate my benefit</SubmitButton>
        <PrivacyNote />
      </form>
    </>
  );

  return (
    <CalculatorLayout
      inputs={inputs}
      result={resultCard}
      showResultOnMobile={result !== null}
      upsell={ok ? <ProUpsell source="weekly-benefit-calculator" /> : null}
    >
      {children}
    </CalculatorLayout>
  );
}
