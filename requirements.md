# WorkClaimGuide — Requirements

Source: *WorkClaimGuide — Product Spec* (revised, Oct 16, 2026, Talha Shahzad).
Priorities: **P1** = MVP (Phase 1), **P2** = Phase 2, **P3** = Phase 3.

---

## 1. Product summary

WorkClaimGuide (workclaimguide.com) is a free website where injured workers in the US and UK estimate their benefits, understand their claim, and track it. It earns from ads on high-paying insurance and legal topics, plus a paid Pro tier.

- **Problem:** after a work injury, people face confusing state rules, adjusters and forms. Free tools already exist (official state estimators in some states, private multi-state calculator sites, law-firm and legal-info articles), so the open question is where they still fall short. The Phase 0 validation (§3) answers that with evidence.
- **Answer:** accurate, state-specific calculators with plain-English explanations, sources and "last updated" dates. Every result explains how it was calculated.
- **Positioning:** neutral and trustworthy — "Know your numbers before you talk to anyone." Not a law firm, not tied to any insurer.
- **Where we might win (to be validated):** not by having calculators, which others already offer, but by doing one narrow job noticeably better. Leading candidate: **medical mileage** — rates are scattered across state sites, and a clean trip log with a printable claim summary may be missing. The top-10 audit in §3 decides this.
- **Founder credibility:** the founder designs software for transportation dispatch and case management in workers' compensation. The site must describe that experience **exactly as it is**, never as claims-adjuster or legal experience. A licensed professional reviewing the calculators would add credibility the site cannot get otherwise.
- **Naming:** before registering, check "WorkClaimGuide" has no trademark conflicts in the US (USPTO) and UK (IPO); then register the .com and, for UK pages, the .co.uk.

### Users

| Type | Who |
|---|---|
| Primary | Injured workers in the US (workers' comp) and UK (personal injury, sick pay, injury benefits), aged 25–60, mostly on mobile, often stressed |
| Secondary | Family members helping them; HR and small-business owners; claims professionals wanting a quick check |

### Out of scope (for now)

Legal advice, filing claims on the user's behalf, a mobile app, live chat, countries other than the US and UK.

---

## 2. Business model

Ads are the first income test; the Pro tier is built **only if a waitlist shows people will pay**. Prices are starting guesses, not validated.

| Stream | What the user gets | Price (starting point) | When |
|---|---|---|---|
| Display ads | Free calculators and guides | Free | Phase 2 (AdSense), then Ezoic / Mediavine at higher traffic |
| Pro Claim Report | PDF: benefit breakdown, timeline, adjuster questions | $9.99 / £7.99 one-time | Phase 3, after waitlist test |
| Pro Tracker | Claim tracker, mileage log, reminders, unlimited reports, no ads | $4.99 / £3.99 per month | Phase 3, after waitlist test |
| Partner referrals | Optional "talk to a specialist" link | Paid per referral by partner | Phase 3, after legal review |

**Payments:** Stripe does not onboard Pakistani businesses directly. Use Paddle or Lemon Squeezy as merchant of record (handles US sales tax and UK VAT, pays out internationally). Confirm current Pakistan payout support before integrating.

### Ad rules

- AD-1: Never place ads inside a calculator's input area or between the inputs and the result.
- AD-2: Max **3** ad slots on a calculator page, **4** on a long guide.
- AD-3: No ads on Pro pages, the account area (`/app/`), or the methodology page. No ads above the fold on Home.
- AD-4: Never above the calculator on mobile; the first screen must show the calculator title and first input.
- AD-5: Consent banner (GDPR for UK, CCPA for California) must be accepted before personalized ads load.
- AD-6: Do not build referrals until a lawyer has reviewed the setup (PI lead selling is regulated in the UK and several US states).

---

## 3. Scope by phase

Validate first, then build one narrow tool, and expand only where real traffic and interest appear. Each phase has a gate it must pass.

### Phase 0: Validation (week 1)

- [ ] Pull keyword ranges and trends for California, Texas and Florida workers' comp terms (Google Keyword Planner, plus a free keyword tool).
- [ ] Audit the top 10 results for 15–20 target searches: who ranks (state sites, calculator sites, law firms), what each tool offers, whether it cites official sources, what is missing.
- [ ] Pick **one** narrow gap from the audit (mileage log is the leading candidate, not yet confirmed).
- [ ] Show a rough prototype to 3–5 people who know the problem (injured workers, claims staff, case managers) and note what they use today.

**Gate:** a gap that the audit and the conversations both confirm. If none appears, stop and compare against other ideas before building.

| Area | Phase 1: Narrow test (weeks 2–4) | Phase 2: Expand (months 2–4) | Phase 3: Pro + UK (month 5 onward) |
|---|---|---|---|
| US states | The 3 states with the clearest gap | More states, ranked by traffic data | Remaining states |
| Calculators | The one chosen tool | Weekly benefit, average weekly wage, back pay | Settlement range, only with expert review |
| UK tools | None | None | SSP and injury benefit first; compensation estimator only after the guideline-figure question is settled |
| Content | 3–5 strong guides, methodology, about page | 20+ guides | Ongoing |
| Backend | None (static site) | Email sign-up only | Accounts, Pro, admin |
| Monetization | None yet; "Get the full report — coming soon" waitlist button | AdSense, keep the waitlist | Pro report and tracker, if the waitlist shows demand |

### Gates between phases

- **Into Phase 2:** pages are indexed and starting to rank in Search Console, and visitors complete the tool.
- **Into Phase 3:** enough waitlist sign-ups to justify building Pro. Set the number before launch so the decision isn't made on gut feel.

---

## 4. Functional requirements

| ID | Module | Requirement | Priority |
|---|---|---|---|
| FR-01 | Navigation | Header with logo, "Calculators", "Guides", "States", "Pro", and a state/country selector | P1 |
| FR-02 | Navigation | Remember the visitor's chosen state in local storage and offer it on every hub | P1 |
| FR-03 | Home | Hero with one question: "Where were you injured?" (state or UK), leading to that hub | P1 |
| FR-04 | State hub | Show the state's key rules (benefit rate, weekly max/min, waiting period, deadlines), each with source and effective date | P1 |
| FR-05 | Calculators | Every calculator runs fully in the browser; no personal data is sent to the server | P1 |
| FR-06 | Calculators | Inputs validate on blur with plain-language errors ("Enter your weekly pay before tax") | P1 |
| FR-07 | Calculators | Results show the amount, a range where the law allows one, and a "How we calculated this" panel listing each step | P1 |
| FR-08 | Calculators | Results show the rule's effective date and link to the official source | P1 |
| FR-09 | Calculators | "Copy link" stores inputs in the URL query so a result can be shared or revisited | P1 |
| FR-10 | Calculators | "Print / Save as PDF" produces a clean one-page summary with no ads | P1 |
| FR-11 | Guides | Table of contents, FAQ block (with FAQ schema), related calculators, author box | P1 |
| FR-12 | Glossary | A–Z terms (AWW, TTD, PPD, MMI, IME, impairment rating); terms auto-linked where they appear in guides | P1 |
| FR-13 | Trust | Methodology page lists every formula and data source per state, with a change log | P1 |
| FR-14 | Trust | "Report an error" link on every calculator sends a form to the admin inbox | P1 |
| FR-15 | Ads | Ad slots are components with fixed sizes so they never shift the layout | P1 |
| FR-16 | Consent | Cookie consent banner; personalized ads load only after consent | P1 |
| FR-17 | Newsletter | Email sign-up for "rule change" alerts per state | P2 |
| FR-18 | Accounts | Sign-up by email magic link or Google; no passwords | P2 |
| FR-19 | Accounts | Signed-in users can save and name calculations | P2 |
| FR-20 | Pro Report | Branded PDF with breakdown, timeline, checklist and adjuster questions | P2 |
| FR-21 | Pro Tracker | Log payments received, missed payments, medical appointments and mileage; export to CSV/PDF | P2 |
| FR-22 | Pro Tracker | Email reminders for deadlines the user enters | P2 |
| FR-23 | Billing | Checkout, receipts, plan changes and cancellation through Paddle or Lemon Squeezy | P2 |
| FR-24 | Admin | Edit state rule data in a form; changes require a source URL and effective date before publishing | P2 |
| FR-25 | Admin | Dashboard of top pages, calculator completions and error reports | P2 |
| FR-26 | Referrals | Optional, clearly labelled partner referral with explicit consent | P3 |

---

## 5. Calculator specifications

**General rule:** every calculator reads its rates from the jurisdiction's data file. No number is hard-coded. Every figure is filled from the official state agency or gov.uk, with source URL and effective date recorded.

### CALC-01 Average weekly wage (US) — P2

- **Inputs:** pay type (hourly, salary, weekly, varied), pay amount, hours per week, overtime, second job (yes/no + pay), weeks worked in the lookback period.
- **Rule:** lookback period and what counts (overtime, tips, concurrent jobs) come from the state file.
- **Formula:** `AWW = gross earnings in lookback period / weeks in lookback period`
- **Output:** AWW, with each included item listed.

### CALC-02 Weekly benefit — temporary total disability (US) — P2

- **Inputs:** AWW (typed or carried over from CALC-01), injury date.
- **Rule:** pick the rate table effective on the injury date; apply the state's percentage and weekly min/max.
- **Formula:** `TTD = min(max(AWW × r, min_week), max_week)`
- **Output:** weekly benefit, monthly equivalent, and a note when the cap or floor applied.
- **Edge cases:**
  - Wages below the state minimum — some states pay the actual wage instead of the floor (state-file flag).
  - Injury date before the earliest stored rate table — show "not covered yet".

### CALC-03 Back pay and waiting period (US) — P2

- **Inputs:** injury date, first day off work, return-to-work date (or "still off"), payments received.
- **Rule:** waiting days are unpaid unless time off exceeds the state's retroactive threshold.
- **Output:** days payable, amount owed, amount received, difference.

### CALC-04 Medical mileage reimbursement (US) — P1 candidate (the leading "one narrow tool", pending Phase 0)

- **Inputs:** list of trips (date, from, to, miles or address pair, round trip yes/no), parking and tolls.
- **Rule:** miles × state rate effective on each trip date, plus allowed costs.
- **Output:** total claim, per-trip table, printable log ready to send to the adjuster.

### CALC-05 Settlement estimator (US) — P3, only with expert review

- **Inputs:** state, impairment rating (%), body part, age, occupation group, AWW, future medical (yes/no).
- **Rule:** each state has its own permanent-disability formula module (schedule weeks, rating tables, age/occupation adjustments), referenced by `settlement_module` in the state file.
- **Output:** low–high range, **never a single number**, plus what pushes the value up or down. Always labelled "estimate only".

### CALC-06 Injury compensation estimator (UK) — postponed to P3, after the guideline-figure question is settled

- **Inputs:** injury type and severity (guided picker), recovery time, lost earnings, out-of-pocket costs, care from family.
- **Rule:** general damages from bracket ranges in the Judicial College guidelines, plus special damages (losses and costs).
- **Output:** range for general damages, total for special damages, combined range.
- **Open question:** bracket figures come from a published book — confirm how they can be summarised and cited (see Risks).

### CALC-07 Statutory Sick Pay (UK) — P3

- **Inputs:** average weekly earnings, qualifying days per week, first sick day, last sick day.
- **Rule:** current SSP rate, eligibility rules and waiting days from gov.uk. **SSP rules changed in 2026 — confirm the current version before building.**
- **Output:** SSP payable per week and in total.

### CALC-08 Industrial Injuries Disablement Benefit (UK) — P3

- **Inputs:** assessed disablement %, age, injury date.
- **Rule:** weekly rate band by disablement % from gov.uk.
- **Output:** estimated weekly amount and link to apply.

### Rules for every calculator

- CR-1: Round money to 2 decimals and show the currency (USD or GBP).
- CR-2: Every result has a "How we calculated this" panel and the effective date of the rates used.
- CR-3: Every calculator shows "Estimate only, not legal advice" (muted style, never a red alarm).
- CR-4: Unit tests — at least **10 known cases per state per calculator**, from official examples where they exist.

---

## 6. Non-functional requirements

Injury and money pages are "Your Money or Your Life" content for Google, so trust and accuracy rank as high as speed.

| ID | Area | Requirement |
|---|---|---|
| NFR-01 | Performance | LCP < 2.0 s and CLS < 0.05 on a mid-range phone over 4G, ads included |
| NFR-02 | Performance | Pages statically generated; JavaScript on a calculator page < 80 KB before ads |
| NFR-03 | SEO | Unique title, meta description and canonical URL per page; XML sitemap; breadcrumbs with schema |
| NFR-04 | SEO | Structured data: `WebApplication` on calculators; `Article` and `FAQPage` on guides |
| NFR-05 | Trust | Every rule shows source link and effective date; every guide shows author, reviewer (when added) and "last updated" |
| NFR-06 | Trust | About page describing the founder's real experience exactly as it is (software for transportation dispatch and case management in workers' comp — not claims-adjuster or legal experience); contact page; editorial policy |
| NFR-07 | Accuracy | Rate data reviewed every January and whenever a state announces a change; change log published |
| NFR-08 | Privacy | No calculator input leaves the browser on free pages; Pro data encrypted at rest; one-click delete-my-account |
| NFR-09 | Privacy | GDPR (UK) and CCPA (California): consent banner, privacy policy, data request form |
| NFR-10 | Legal | "Estimate only, not legal advice" on every calculator and every PDF; terms of use |
| NFR-11 | Accessibility | WCAG 2.2 AA: labels on every input, keyboard use, 4.5:1 contrast, results announced to screen readers |
| NFR-12 | Mobile | Mobile-first; every input usable with one thumb; no horizontal scroll at 360 px |
| NFR-13 | Reliability | 99.9% uptime; static pages served from a CDN |
| NFR-14 | Localization | US pages: US English, dollars, miles. UK pages: UK English, pounds, kilometres where relevant |

---

## 7. Information architecture

A new state is a new data file; its pages generate automatically.

```
/                                                     Home
/workers-comp/                                        US hub (state picker + map)
/workers-comp/{state}/                                State hub (rules summary + calculators)
/workers-comp/{state}/average-weekly-wage-calculator/
/workers-comp/{state}/weekly-benefit-calculator/
/workers-comp/{state}/back-pay-calculator/            (P2)
/workers-comp/{state}/mileage-reimbursement-calculator/
/workers-comp/{state}/settlement-calculator/          (P2)
/workers-comp/{state}/guide/{slug}/                   State-specific guides
/uk/                                                  UK hub
/uk/injury-compensation-calculator/
/uk/statutory-sick-pay-calculator/                    (P2)
/uk/industrial-injuries-benefit-calculator/           (P2)
/uk/guide/{slug}/
/guides/                                              All guides, filterable by country and topic
/guides/{slug}/                                       General guides
/glossary/  /glossary/{term}/
/methodology/  /methodology/{state}/
/pro/                                                 Pricing (P2)
/app/                                                 Signed-in area (P2)
/about/  /contact/  /editorial-policy/  /privacy/  /terms/
```

URLs use trailing slashes.

### Internal linking

- IL-1: Every calculator links to its state hub, the other calculators for that state, and 2–3 related guides.
- IL-2: Every guide links to at least one calculator.
- IL-3: The state hub links to that state's methodology page.

---

## 8. Design system

Calm, clear and official — closer to a good government service than a law-firm ad. One deep teal for trust, one warm amber for the result, lots of white space.

### Color tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `--brand` | `#0F5257` | `#5FB3B3` | Header, links, primary buttons |
| `--brand-soft` | `#E6F1F1` | `#16302F` | Calculator card background, selected states |
| `--accent` | `#E8A33D` | `#F0B860` | Result highlight only |
| `--ink` | `#1B2428` | `#E8EDEE` | Body text |
| `--muted` | `#5B6B70` | `#9AA9AD` | Help text, captions |
| `--line` | `#DCE3E5` | `#2A3538` | Borders, dividers |
| `--surface` | `#FFFFFF` | `#111819` | Page background |
| `--good` / `--warn` / `--bad` | `#2E7D4F` / `#B26A00` / `#B3261E` | lighter tints | Validation and notices |

### Typography

- Headings: Source Serif 4, weight 600.
- Body and UI: Public Sans, 400/500/600/700.
- Scale (mobile / desktop): H1 30/40, H2 24/30, H3 19/22, body 16/17, small 14, result number 40/52.
- Body line height 1.55; max line length 70 characters.

### Spacing and shape

- 4-point grid: 4, 8, 12, 16, 24, 32, 48, 64.
- Radius: 10 for cards and inputs, 999 for pills.
- Content width: 720 for guides, 1120 for hubs. Calculator layout is 2 columns above 960 px.

### Core components

| Component | Contents |
|---|---|
| Calculator card | Title, short "what this works out" line, inputs, primary "Calculate" button, inline errors |
| Result panel | Large amount in accent color, range bar when there is a range, "How we calculated this" accordion, source and effective date, Copy link, Print |
| Rule chip | Small pill with a state rule ("Waiting period: 3 days") and a source tooltip |
| Trust bar | "Updated {date} · Sources: {agency} · Reviewed by {name}" |
| Notice | "Estimate only, not legal advice", muted style |
| Pro upsell card | One line of benefit, price, one button; under results only |
| Ad slot | Reserved box, small "Advertisement" label, fixed size: 300×250 in content; 728×90 or 970×90 desktop leaderboard; 320×100 sticky mobile footer |

### Ad slot placement

- **Slot A:** below the result panel.
- **Slot B:** right rail on desktop (sticky).
- **Slot C:** mid-guide after the second section; on state hubs after the checklist.

---

## 9. Page layouts

Listed top to bottom as on mobile; desktop notes follow.

### 9.1 Home (P1)

1. Header: logo, menu, state selector.
2. Hero: "Know what your injury claim is worth." Sub-line: "Free, state-specific calculators. No sign-up." One select: "Where were you injured?" + button.
3. Popular calculators: 4 cards (weekly benefit, settlement, mileage, UK compensation).
4. "How it works": 3 steps (pick your state, enter your numbers, see how it's calculated).
5. Trust strip: sources used, updated date, founder's background (described exactly as in §1).
6. Latest guides: 3 cards.
7. Footer: links, legal notice, newsletter sign-up.

No ads above the fold.

### 9.2 State hub (P1)

1. Breadcrumb: Home › Workers' comp › {State}.
2. H1 "{State} Workers' Comp Benefits ({year})" + trust bar.
3. Rule chips: benefit rate, weekly max, weekly min, waiting period, reporting deadline.
4. Calculator grid (5 cards).
5. "What to do after a work injury in {State}": 6-step checklist.
6. Ad slot C.
7. State FAQ (6–8 questions).
8. Related guides.

Desktop: rule chips and calculators in the main column; sticky right rail with "Jump to" and ad slot B.

### 9.3 Calculator page (P1)

1. Breadcrumb, H1, one-line intro, trust bar.
2. Calculator card with inputs.
3. Result panel (appears after Calculate, scrolls into view): amount, monthly equivalent, cap note, "How we calculated this", source link, Copy link, Print.
4. Pro upsell card: "Get your full claim report" (P2; hidden in MVP).
5. Ad slot A.
6. Explainer, e.g. "How California calculates TTD" (300–600 words).
7. FAQ + related calculators.

Desktop: calculator left (60%), result panel sticky right (40%), so the number updates beside the inputs.

### 9.4 Guide page (P1)

Title, author box and dates, table of contents, body with callouts, inline "Try the calculator" boxes, ad slot C after section 2, FAQ, sources, related guides.

### 9.5 Pro pricing (P2)

Two cards (Report one-time, Tracker monthly), comparison list, sample report preview, FAQ about cancelling and privacy. No ads.

### 9.6 App: claim tracker (P2)

1. Claim summary card: state, injury date, weekly benefit, status.
2. Tabs: Payments · Appointments · Mileage · Documents.
3. Payments: expected vs received, missed ones flagged.
4. Mileage: trip list, "Add trip", total, "Export log".
5. Reminders panel: upcoming deadlines.

### 9.7 Admin: rule editor (P2)

Table of states; selecting one opens a form for every rule field, with required source URL and effective date, a preview of affected calculators, and Publish.

---

## 10. Data and architecture

The free site is static files on a CDN, so hosting stays near zero at any traffic. Only Pro features use a server. Guides and state rule files live in the Git repo; each push rebuilds the site. Sign-in and Pro data go to Supabase; Paddle notifies Supabase via webhook when someone pays.

### Tech stack

> **Decision needed:** the spec names **Astro + Preact islands**, but this repository was created with **Next.js** (App Router). The table below records the spec's choice and the Next.js equivalent. Confirm which one to build on before starting implementation.

| Layer | Spec choice | Next.js equivalent | Why |
|---|---|---|---|
| Framework | Astro + TypeScript | Next.js + TypeScript, static generation (`generateStaticParams` / static export) | Static pages, SEO |
| Interactive parts | Preact islands | Client components only for calculators; everything else server-rendered at build | Keep calculator JS < 80 KB |
| Styling | Tailwind CSS with §8 tokens | Same | Fast, consistent |
| Content | MDX in the repo | Same | Guides versioned with code |
| Hosting | Cloudflare Pages | Cloudflare Pages (static export) or Vercel | Free tier, global CDN |
| Accounts + DB | Supabase (Postgres, Auth, Storage) | Same | Magic link, row-level security |
| PDF reports | Server function rendering HTML to PDF | Same (route handler) | Branded Pro reports |
| Email | Resend | Same | Reminders, receipts |
| Payments | Paddle or Lemon Squeezy | Same | Merchant of record |
| Analytics | Plausible or GA4 + Search Console | Same | Traffic, keywords |
| Testing | Vitest (calculators), Playwright (key pages) | Same | Formula accuracy is the product |

### State rule file

One JSON file per jurisdiction in `/data/rules/`.

```json
{
  "jurisdiction": "US-CA",
  "name": "California",
  "agency": { "name": "Division of Workers' Compensation", "url": "https://…" },
  "rate_tables": [
    {
      "effective_from": "2026-01-01",
      "ttd_rate": 0.6667,
      "weekly_max": null,
      "weekly_min": null,
      "mileage_rate_per_mile": null,
      "source_url": "https://…"
    }
  ],
  "waiting_period_days": null,
  "retroactive_after_days": null,
  "aww_lookback_weeks": null,
  "reporting_deadline_days": null,
  "settlement_module": "ca_pd_rating",
  "last_reviewed": "2026-10-16"
}
```

- DATA-1: Nulls are placeholders to fill from the official source. **The build fails if a published jurisdiction has any null value.**
- DATA-2: Rate tables are versioned by `effective_from`; calculators pick the table in effect on the relevant date (injury date or trip date).
- DATA-3: Every rate table has a `source_url`.

### Database tables (P2)

| Table | Key fields |
|---|---|
| users | id, email, country, created_at |
| subscriptions | user_id, plan, status, paddle_id, renews_at |
| saved_calculations | id, user_id, calculator, jurisdiction, inputs (json), result (json), created_at |
| claims | id, user_id, jurisdiction, injury_date, aww, weekly_benefit, status |
| payments | id, claim_id, expected_date, amount_expected, received_date, amount_received |
| appointments | id, claim_id, date, provider_type, notes |
| trips | id, claim_id, date, from_label, to_label, miles, costs |
| reports | id, user_id, claim_id, pdf_path, created_at |
| reminders | id, user_id, claim_id, due_date, label, sent_at |

Row-level security: every table readable and writable only by its owner.

---

## 11. Content and SEO

One page targets one search intent. Check real volumes in Keyword Planner or Ahrefs before writing.

| Keyword cluster (examples) | Target page | Intent |
|---|---|---|
| "workers comp calculator california" | `/workers-comp/california/weekly-benefit-calculator/` | Calculate |
| "workers comp settlement calculator texas" | `/workers-comp/texas/settlement-calculator/` | Calculate |
| "workers comp mileage reimbursement florida" | `/workers-comp/florida/mileage-reimbursement-calculator/` | Calculate |
| "how is average weekly wage calculated for workers comp" | `/workers-comp/{state}/average-weekly-wage-calculator/` + guide | Learn + calculate |
| "what is MMI in workers comp", "what is an impairment rating" | `/glossary/{term}/` + guide | Learn |
| "what to do after a work injury" | `/guides/what-to-do-after-a-work-injury/` | Learn |
| "texas employer no workers comp" | `/workers-comp/texas/guide/non-subscriber-employers/` | Learn |
| "personal injury compensation calculator uk" | `/uk/injury-compensation-calculator/` | Calculate |
| "statutory sick pay calculator" | `/uk/statutory-sick-pay-calculator/` | Calculate |
| "industrial injuries disablement benefit rates" | `/uk/industrial-injuries-benefit-calculator/` | Calculate |

### First 10 guides (MVP)

1. What to do in the first 7 days after a work injury
2. How workers' comp weekly benefits are calculated
3. How workers' comp settlements work, step by step
4. What MMI means and what happens after it
5. What an independent medical exam (IME) is and how to prepare
6. Can you claim mileage for medical appointments?
7. Texas non-subscriber employers: your options
8. California workers' comp: complete benefits guide
9. Florida workers' comp: complete benefits guide
10. UK: how injury compensation amounts are worked out

**Writing standard:** answer the question in the first two sentences, then explain; one worked example with numbers; sources at the end; review date on the page.

**Off-page:** answer questions on Reddit and Quora with links only where they truly help; offer calculators as free embeds to small blogs (each embed links back).

---

## 12. Roadmap and KPIs

Spend a week validating, test one narrow tool for a month, and add Pro and UK tools only after real traffic and a waitlist show demand.

| Phase | Timing | Deliverables | Gate to the next phase |
|---|---|---|---|
| 0 + 1 — Validate + test | Weeks 1–4 | Keyword data and top-10 audit; one narrow tool; 3–5 guides; no backend or payments | Pages rank, the tool is used |
| 2 — Expand | Months 2–4 | More states and calculators; AdSense; email sign-up; Pro waitlist button | Waitlist shows demand |
| 3 — Pro + UK | Month 5 onward | Accounts, report, tracker; UK tools after legal check; admin panel | — |

| KPI | How measured | Target by month 6 |
|---|---|---|
| Organic visits / month | Search Console + analytics | Steady month-on-month growth |
| Calculator completion rate | "Calculate" clicks / page views | > 40% |
| Ad earnings per 1,000 visits | Ad network dashboard | Track by page type |
| Visitor-to-Pro conversion | Paddle sales / calculator users | 0.5–1% |
| Pro tracker churn | Cancellations / active subscribers per month | < 8% |
| Error reports resolved | Admin dashboard | All within 7 days |

Targets are starting guesses; reset after 3 months of data.

---

## 13. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Wrong rate or formula | Loss of trust, legal exposure | Official sources only, unit tests, yearly review, error-report link, disclaimer |
| Google rates site low-quality (YMYL) | Little traffic | Real author expertise, methodology page, depth over volume, no thin pages |
| AdSense rejection | Delayed income | Apply only after 20–30 strong pages, privacy policy and contact page are live |
| Payment provider won't pay out to Pakistan | Pro can't launch | Confirm with Paddle and Lemon Squeezy before Phase 2; keep the other as backup |
| Unauthorised practice of law claims | Legal risk | Never advise on a specific case; estimates and education only; lawyer review of terms |
| Copyright on UK guideline figures | Takedown risk | Summarise brackets in own words, cite source, get advice before launch |
| Big sites copy the calculators | Slower growth | Win on depth, state coverage, the tracker and update speed |

**Biggest risk overall:** there is no real demand or gap. Phase 0 and the gates exist to find that out in weeks, not months.

---

## 14. Open questions

1. **Framework:** Astro (spec) or Next.js (current repo)?
2. **The one narrow tool:** which calculator does Phase 0 confirm? Mileage log is the leading candidate.
3. **Waitlist number:** how many sign-ups justify building Pro? Set it before launch.
4. **Home "popular calculators":** the settlement card points to a Phase 3 calculator — swap it for the chosen Phase 1 tool?
5. **UK guideline brackets:** how can Judicial College figures be summarised and cited?
6. **SSP 2026 changes:** confirm current rules before building CALC-07.
7. **Payments:** confirm Paddle / Lemon Squeezy payout support for Pakistan.
8. **Trademark/domain:** check USPTO and UK IPO; register `.com` and `.co.uk`.

---

## 15. First tasks

- [ ] Check "WorkClaimGuide" in USPTO and UK IPO trademark search, then register the domain
- [ ] Collect keyword data for California, Texas and Florida terms
- [ ] Audit the top 10 results for 15–20 searches and record the gaps
- [ ] Choose the one narrow tool and confirm it with 3–5 people who know the problem
- [ ] Set the waitlist number that will justify building Pro
