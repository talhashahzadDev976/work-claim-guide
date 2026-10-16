import fs from "node:fs";
import path from "node:path";
import type { Jurisdiction } from "@/lib/rules/jurisdiction";

// A new state is a new file in /data/rules; its pages generate automatically (requirements §7).
const DIR = path.join(process.cwd(), "data", "rules");

let cache: Jurisdiction[] | undefined;

export function allJurisdictions(): Jurisdiction[] {
  cache ??= fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as Jurisdiction)
    .sort((a, b) => a.name.localeCompare(b.name));
  return cache;
}

export function getJurisdiction(slug: string): Jurisdiction | undefined {
  return allJurisdictions().find((j) => j.slug === slug);
}

export function allJurisdictionSlugs(): string[] {
  return allJurisdictions().map((j) => j.slug);
}

/** Has the state's benefit rate been checked and entered yet? */
export function hasRates(j: Jurisdiction) {
  return j.rate_tables.length > 0;
}
