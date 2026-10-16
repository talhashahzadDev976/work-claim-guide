import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";

const LINKS = [
  { href: "/about/", label: "About" },
  { href: "/methodology/", label: "Methodology" },
  { href: "/editorial-policy/", label: "Editorial policy" },
  { href: "/privacy/", label: "Privacy" },
  { href: "/terms/", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="no-print mt-auto bg-footer text-footer-ink">
      <Container className="py-8 sm:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <Link href="/" className="flex items-center gap-2 font-serif text-xl font-semibold">
            <Image src="/logo.png" alt="" width={28} height={28} className="h-7 w-7 rounded-md" />
            WorkClaimGuide
          </Link>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="underline underline-offset-2 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-6 text-[13px] text-footer-muted">
          WorkClaimGuide is not a law firm and does not give legal advice. Estimates only.
        </p>
      </Container>
    </footer>
  );
}
