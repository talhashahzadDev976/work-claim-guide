import { Container } from "@/components/layout/Container";
import { HeroPlacePicker } from "@/components/places/HeroPlacePicker";
import { PopularCalculators } from "@/components/places/PopularCalculators";
import { allPlaces } from "@/lib/places/server";

const STEPS = [
  { title: "Pick your state", body: "Rules differ a lot from state to state." },
  { title: "Enter your numbers", body: "Pay, injury date, rating if you have one." },
  { title: "See how it is worked out", body: "Every step, with the official source." },
];

const GUIDES = [
  "What to do in the first 7 days after a work injury",
  "How workers' comp weekly benefits are calculated",
  "Can you claim mileage for medical appointments?",
];

export default function Home() {
  return (
    <main id="main">
      <section id="states" className="bg-[#0f5257] text-white">
        <Container className="py-10 sm:py-14 lg:py-20">
          <div className="max-w-[680px]">
            <h1 className="text-[34px] leading-[1.15] sm:text-[44px] lg:text-[52px]">
              Know what your injury claim is worth.
            </h1>
            <p className="mt-4 text-lg text-white/85 sm:text-xl">
              Free, state-specific calculators. No sign-up.
              <br className="hidden sm:block" /> Your numbers never leave your device.
            </p>
            <div className="mt-8">
              <HeroPlacePicker places={allPlaces()} />
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-10 sm:py-14">
        <section id="calculators" aria-labelledby="popular-heading" className="scroll-mt-4">
          <h2 id="popular-heading" className="font-sans text-2xl font-semibold sm:text-[28px]">
            Popular calculators
          </h2>
          <PopularCalculators />
        </section>

        <section aria-labelledby="how-heading" className="mt-12 sm:mt-16">
          <h2 id="how-heading" className="font-sans text-2xl font-semibold sm:text-[28px]">
            How it works
          </h2>
          <ol className="mt-5 grid gap-5 md:grid-cols-3 md:gap-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand"
                >
                  {i + 1}
                </span>
                <span>
                  <span className="block text-lg font-medium">{s.title}</span>
                  <span className="block text-muted">{s.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="trust-heading"
          className="mt-12 rounded-card border border-line bg-surface p-6 sm:mt-16 sm:p-8"
        >
          <h2 id="trust-heading" className="font-sans text-xl font-semibold">
            Official sources, every time
          </h2>
          <p className="mt-2 max-w-[70ch]">
            Every rate comes from the state agency, with its effective date. WorkClaimGuide is built by a
            software designer who works on transportation dispatch and case management for workers&apos;
            compensation. It is not a law firm and does not give legal advice.
          </p>
        </section>

        <section id="guides" aria-labelledby="guides-heading" className="mt-12 scroll-mt-4 sm:mt-16">
          <h2 id="guides-heading" className="font-sans text-2xl font-semibold sm:text-[28px]">
            Latest guides
          </h2>
          <ul className="mt-4 border-t border-line">
            {GUIDES.map((g) => (
              <li key={g} className="border-b border-line py-4 text-lg font-medium">
                {g}
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </main>
  );
}
