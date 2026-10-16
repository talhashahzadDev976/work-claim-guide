/** Places shown in state selectors. Built on the server from the rule files, then passed down. */
export type Place = { slug: string; name: string; available: boolean };

export const DEFAULT_PLACE = "california";

export const UK_PLACE: Place = { slug: "uk", name: "United Kingdom", available: true };

/** Where "Show my calculators" leads: the state hub. */
export function placeHref(slug: string) {
  return slug === "uk" ? "/uk/" : `/workers-comp/${slug}/`;
}
