import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Faq } from "@/components/ui/Faq";
import { WaitlistButton } from "@/components/ui/WaitlistButton";

export const metadata: Metadata = {
  title: "Pro: claim report and claim tracker",
  description:
    "The calculators are free forever. Pro adds a full claim report and a tracker so missed payments and deadlines don't slip past you.",
  alternates: { canonical: "/pro/" },
};

const PLANS = [
  {
    name: "Claim Report",
    cadence: "One-time purchase",
    price: "$9.99",
    per: null,
    features: [
      "Full benefit breakdown for your state",
      "Payment timeline from your injury date",
      "Checklist of documents to keep",
      "Questions to ask your adjuster",
      "Branded PDF, ready to print",
    ],
    cta: "Get the full report — coming soon",
    source: "pro-report",
    featured: false,
  },
  {
    name: "Claim Tracker",
    cadence: "Monthly, cancel any time",
    price: "$4.99",
    per: "/ month",
    features: [
      "Everything in Claim Report, unlimited",
      "Track expected vs received payments",
      "Mileage log you can send to your adjuster",
      "Email reminders for your deadlines",
      "No ads anywhere on the site",
    ],
    cta: "Track my claim — coming soon",
    source: "pro-tracker",
    featured: true,
  },
];

const FAQ = [
  {
    q: "When will Pro be available?",
    a: "Pro is not available yet. We will build it only if enough people show they want it, so pressing a coming-soon button helps us decide.",
  },
  {
    q: "Who can see my claim details?",
    a: "Only you. Your data will be encrypted, and you will be able to delete your account in one click.",
  },
  {
    q: "How do I cancel?",
    a: "From your account page, any time. You will keep access until the end of the month you paid for.",
  },
  {
    q: "Is this legal advice?",
    a: "No. WorkClaimGuide gives estimates and education only. For advice on your case, speak to a licensed attorney or solicitor.",
  },
];

// No ads on Pro pages (AD-3).
export default function ProPage() {
  return (
    <main id="main">
      <Container width="narrow" className="py-10 sm:py-14 lg:py-16">
        <header className="mx-auto max-w-[600px] text-center">
          <p className="mb-3 inline-block rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent-ink">
            Coming soon
          </p>
          <h1 className="text-[30px] leading-[1.15] lg:text-[40px]">Stay on top of your claim</h1>
          <p className="mt-3 text-lg text-ink/85">
            The calculators are free forever. Pro adds a full report and a tracker so missed payments and deadlines
            don&apos;t slip past you.
          </p>
        </header>

        <ul className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-2 md:gap-5">
          {PLANS.map((p) => (
            <li
              key={p.name}
              className={`flex flex-col rounded-card bg-surface p-6 sm:p-7 ${
                p.featured ? "border-2 border-brand" : "border border-line"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-sans text-xl font-semibold">{p.name}</h2>
                  <p className="text-sm text-muted">{p.cadence}</p>
                </div>
                {p.featured && (
                  <span className="shrink-0 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
                    Most useful
                  </span>
                )}
              </div>
              <p className="mt-5 text-xs font-semibold tracking-[0.06em] text-muted uppercase">Planned price</p>
              <p className="mt-1">
                <span className="font-serif text-[40px] leading-none font-semibold">{p.price}</span>
                {p.per && <span className="ml-1.5 text-muted">{p.per}</span>}
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-[15px]">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <svg
                      aria-hidden
                      viewBox="0 0 16 16"
                      className="mt-1 h-4 w-4 shrink-0 fill-none stroke-brand stroke-2"
                    >
                      <path d="M3 8.5l3 3 7-7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <WaitlistButton source={p.source} label={p.cta} variant={p.featured ? "solid" : "outline"} />
              </div>
            </li>
          ))}
        </ul>

        <section aria-labelledby="pro-faq" className="mx-auto mt-12 max-w-[720px] sm:mt-16">
          <h2 id="pro-faq" className="text-2xl lg:text-[28px]">
            Questions
          </h2>
          <div className="mt-4">
            <Faq items={FAQ} withSchema />
          </div>
        </section>
      </Container>
    </main>
  );
}
