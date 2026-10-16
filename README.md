# WorkClaimGuide

Free, state-specific calculators for injured workers in the US and UK. Product spec: [requirements.md](requirements.md).

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static production build
npm run lint
```

Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, TypeScript.

## Project structure

```
data/                      Rule data, one file per jurisdiction. No number is hard-coded in code.
  rules/<state>.json       US states + DC: rates, limits, waiting period, settlement rules
  uk/                      UK injury compensation brackets and care rates

src/
  app/                     Routes only. Pages stay thin and compose components.
    workers-comp/
      [state]/             State hub + one folder per calculator
        _lib/              Private helpers shared by the state calculator routes
    uk/                    UK hub + calculators
    pro/                   Pro pricing (coming-soon waitlist)
  components/
    layout/                Header, footer, container, breadcrumbs, skeletons
    ui/                    Reusable primitives (SearchSelect, Faq, RuleChip, WaitlistButton)
    ads/                   Fixed-size ad slots
    places/                State/country pickers and directory
    calculators/
      shared/              Calculator layout, result card, form fields, Pro upsell (client-safe)
      page/                Server pieces for calculator pages (shell, header, below-the-fold)
      <calculator>/        One folder per calculator UI
  lib/
    calculators/           Pure calculation functions + the calculator catalog (unit-testable)
    rules/                 Rule types, loaders (*.server.ts read data/), shared rule facts
    places/                Place list and remembered-place store
    hooks/                 Client hooks
```

Conventions:

- **Calculation logic lives in `src/lib/calculators/`**, free of React, so formulas can be tested on their own.
- **Files ending in `.server.ts` read from disk** and must only be imported by server components.
- **Calculators never show a number built on unchecked data.** While a figure in `data/` is `null`, the page shows a visible placeholder (`[RATE]`, `[AMOUNT]`) and says the official figure is still being checked.

## Filling in a state's rules

Edit `data/rules/<state>.json` with figures from the state agency, and record a `source_url` and `effective_from` for each:

| To turn on | Fill in |
|---|---|
| Weekly benefit estimate | a `rate_tables` entry: `ttd_rate`, `weekly_max`, `weekly_min` |
| Mileage dollar amounts | `mileage_rate_per_mile` in the rate table for each period |
| Settlement range | `settlement_module` (currently `"schedule"`), every field in `settlement_rules`, and `reviewed_by` (expert review is required) |

The UK estimator shows general damages once the brackets in `data/uk/injury-compensation.json` are filled in and `reviewed_by` is set. Care from family is priced once `care.hourly_rate` is set.

If a production build ever ignores a CSS change, delete `.next/cache/turbopack` and build again.
