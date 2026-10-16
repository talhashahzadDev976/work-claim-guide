import fs from "node:fs";
import path from "node:path";
import type { UkCompensationData } from "@/lib/calculators/uk-compensation";

let cache: UkCompensationData | undefined;

/** UK injury compensation brackets and care rates, from /data/uk/. */
export function ukCompensationData(): UkCompensationData {
  cache ??= JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data", "uk", "injury-compensation.json"), "utf8"),
  ) as UkCompensationData;
  return cache;
}

/** Are the guideline figures entered and reviewed, so general damages can be shown? */
export function ukGeneralDamagesReady(d: UkCompensationData) {
  return Boolean(d.reviewed_by) && d.injuries.some((i) => Object.values(i.brackets).some(Boolean));
}
