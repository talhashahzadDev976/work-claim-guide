"use client";

import { usePathname, useRouter } from "next/navigation";
import { SearchSelect } from "@/components/ui/SearchSelect";
import type { Place } from "@/lib/places/places";
import { placeHref } from "@/lib/places/places";
import { setPlace, usePlace } from "@/lib/places/store";

const STATE_PATH = /^\/workers-comp\/([^/]+)(\/.*)?$/;

/** Header pill: search-and-select over every state plus the UK. */
export function PlaceSelect({ places }: { places: Place[] }) {
  const stored = usePlace();
  const router = useRouter();
  const pathname = usePathname();

  // On a state or UK page, the page's own place wins over the remembered one.
  const match = pathname.match(STATE_PATH);
  const pathState = match && places.some((p) => p.slug === match[1]) ? match[1] : null;
  const onUk = pathname === "/uk" || pathname.startsWith("/uk/");
  const place = pathState ?? (onUk ? "uk" : stored);

  function onChange(slug: string) {
    setPlace(slug);
    if (slug === "uk") {
      if (pathState || pathname === "/workers-comp/") router.push(placeHref("uk"));
    } else if (pathState && match) {
      // Same calculator for the new state.
      router.push(`/workers-comp/${slug}${match[2] ?? "/"}`);
    } else if (onUk || pathname === "/workers-comp/") {
      router.push(placeHref(slug));
    }
  }

  return (
    <SearchSelect
      label="Your state or country"
      hideLabel
      searchPlaceholder="Search states"
      emptyText="No state matches"
      options={places.map((p) => ({
        value: p.slug,
        label: p.name,
        disabled: !p.available,
        hint: p.available ? undefined : "Coming soon",
      }))}
      value={place}
      onChange={onChange}
      className="w-[116px] shrink-0 sm:w-[168px]"
      triggerClassName="h-9 rounded-full border border-white/60 bg-transparent pr-3 pl-3 text-sm font-semibold text-white sm:h-10 sm:border-transparent sm:bg-white sm:pl-4 sm:text-[#0f5257]"
      menuClassName="right-0 w-[272px]"
    />
  );
}
