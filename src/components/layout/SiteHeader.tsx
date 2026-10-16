"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PlaceSelect } from "@/components/places/PlaceSelect";
import type { Place } from "@/lib/places/places";

const NAV = [
  { href: "/#calculators", label: "Calculators" },
  { href: "/#guides", label: "Guides" },
  { href: "/workers-comp/", label: "States" },
  { href: "/pro/", label: "Pro" },
];

export function SiteHeader({ places }: { places: Place[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    !href.includes("#") && pathname.startsWith(href.replace(/\/$/, ""));

  return (
    <header className="no-print bg-[#0f5257] text-white">
      <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-serif text-[19px] font-semibold tracking-tight min-[400px]:text-[21px] sm:text-[23px]">
          <Image src="/logo.png" alt="" width={32} height={32} priority className="h-8 w-8 rounded-lg ring-1 ring-white/30" />
          WorkClaimGuide
        </Link>

        <nav aria-label="Main" className="ml-4 hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="rounded-md px-2.5 py-2 text-[15px] font-medium hover:bg-white/10 aria-[current=page]:underline aria-[current=page]:underline-offset-4"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <PlaceSelect places={places} />
          <button
            type="button"
            className="-mr-2 inline-flex h-11 w-10 items-center justify-center rounded-md hover:bg-white/10 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Main" className="border-t border-white/15 md:hidden">
          <ul className="mx-auto max-w-[1120px] px-2 py-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="block rounded-md px-3 py-3 text-base font-medium hover:bg-white/10 aria-[current=page]:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
