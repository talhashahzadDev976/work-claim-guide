"use client";

import { useRouter } from "next/navigation";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { placeHref, type Place } from "@/lib/places/places";
import { setPlace, usePlace } from "@/lib/places/store";

export function HeroPlacePicker({ places }: { places: Place[] }) {
  const place = usePlace();
  const router = useRouter();

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(placeHref(place));
      }}
    >
      <SearchSelect
        label="Where were you injured?"
        labelClassName="mb-2 block text-base font-semibold"
        searchPlaceholder="Search states"
        emptyText="No state matches"
        options={places.map((p) => ({
          value: p.slug,
          label: p.name,
          disabled: !p.available,
          hint: p.available ? undefined : "Coming soon",
        }))}
        value={place}
        onChange={setPlace}
        className="flex-1"
        triggerClassName="h-14 rounded-card bg-white pr-4 pl-4 text-lg text-[#1b2428]"
      />
      <button
        type="submit"
        className="h-14 rounded-card bg-[#e8a33d] px-7 text-lg font-bold text-[#1b2428] hover:bg-[#f0b860] sm:shrink-0"
      >
        Show my calculators
      </button>
    </form>
  );
}
