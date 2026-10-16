import { UK_PLACE, type Place } from "@/lib/places/places";
import { allJurisdictions } from "@/lib/rules/server";

export function allPlaces(): Place[] {
  return [...allJurisdictions().map((j) => ({ slug: j.slug, name: j.name, available: true })), UK_PLACE];
}
