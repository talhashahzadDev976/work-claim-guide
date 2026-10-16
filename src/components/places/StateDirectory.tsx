"use client";

import Link from "next/link";
import { useState } from "react";

export type DirectoryState = { slug: string; name: string; abbr: string; ready: boolean };

/** Filterable list of every state, so phone users don't scroll through 51 entries. */
export function StateDirectory({ states }: { states: DirectoryState[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = q
    ? states.filter((s) => s.name.toLowerCase().includes(q) || s.abbr.toLowerCase() === q)
    : states;

  return (
    <div>
      <label className="block max-w-[420px]">
        <span className="mb-2 block text-[15px] font-semibold">Find your state</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a state name or code"
          className="h-12 w-full rounded-card border border-line bg-surface px-4 text-lg text-ink placeholder:text-muted/70 hover:border-muted"
        />
      </label>

      <p aria-live="polite" className="sr-only">
        {shown.length} {shown.length === 1 ? "state" : "states"} shown
      </p>

      {shown.length === 0 ? (
        <p className="mt-6 text-muted">No state matches &ldquo;{query}&rdquo;.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {shown.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/workers-comp/${s.slug}/`}
                className="flex h-full items-center justify-between gap-2 rounded-card border border-line bg-surface px-4 py-3 transition-colors hover:border-brand"
              >
                <span className="min-w-0">
                  <span className="block font-semibold">{s.name}</span>
                  <span className="block text-sm text-muted">{s.ready ? "Estimate available" : "Rates coming soon"}</span>
                </span>
                <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand">
                  {s.abbr}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
