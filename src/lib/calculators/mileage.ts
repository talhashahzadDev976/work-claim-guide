import { round2 } from "@/lib/format";
import { rateTableFor, type Jurisdiction } from "@/lib/rules/jurisdiction";

// CALC-04: miles × the state rate in effect on each trip date, plus parking and tolls.

export type Trip = {
  id: string;
  date: string; // YYYY-MM-DD
  from: string;
  to: string;
  miles: number;
  roundTrip: boolean;
  costs: number; // parking and tolls
};

export type TripLine = {
  trip: Trip;
  /** Miles actually claimed (doubled for a round trip). */
  miles: number;
  /** null when no checked rate covers this trip's date. */
  rate: number | null;
  mileageAmount: number | null;
  rateEffectiveFrom: string | null;
  sourceUrl: string | null;
};

export type MileageResult = {
  lines: TripLine[];
  totalMiles: number;
  totalCosts: number;
  /** Sum of mileage amounts for trips that have a rate. */
  mileageAmount: number;
  /** Trips we could not price because no checked rate covers their date. */
  unpricedTrips: number;
  /** mileageAmount + totalCosts, only meaningful when every trip is priced. */
  totalClaim: number;
};

export function claimedMiles(trip: Pick<Trip, "miles" | "roundTrip">) {
  return round2(trip.miles * (trip.roundTrip ? 2 : 1));
}

export function mileageClaim(j: Jurisdiction, trips: Trip[]): MileageResult {
  const lines = [...trips]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((trip): TripLine => {
      const miles = claimedMiles(trip);
      const table = rateTableFor(j, trip.date);
      const rate = table?.mileage_rate_per_mile ?? null;
      return {
        trip,
        miles,
        rate,
        mileageAmount: rate === null ? null : round2(miles * rate),
        rateEffectiveFrom: rate === null ? null : table!.effective_from,
        sourceUrl: rate === null ? null : table!.source_url,
      };
    });

  const totalMiles = round2(lines.reduce((s, l) => s + l.miles, 0));
  const totalCosts = round2(trips.reduce((s, t) => s + t.costs, 0));
  const mileageAmount = round2(lines.reduce((s, l) => s + (l.mileageAmount ?? 0), 0));
  const unpricedTrips = lines.filter((l) => l.rate === null).length;

  return {
    lines,
    totalMiles,
    totalCosts,
    mileageAmount,
    unpricedTrips,
    totalClaim: round2(mileageAmount + totalCosts),
  };
}
