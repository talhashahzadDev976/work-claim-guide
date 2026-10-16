"use client";

import { useEffect, useId, useRef, useState } from "react";

export type SearchSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  /** Small muted text after the label, e.g. "Coming soon". */
  hint?: string;
};

type Props = {
  options: SearchSelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** Accessible name; shown above the trigger unless `hideLabel`. */
  label: string;
  hideLabel?: boolean;
  labelClassName?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Styles for the trigger button (size, colours, border). */
  triggerClassName?: string;
  /** Position and width of the dropdown panel. Defaults to the trigger's width, left-aligned. */
  menuClassName?: string;
  className?: string;
};

/**
 * Searchable select (WAI-ARIA combobox inside a popup). Works with mouse, touch and keyboard:
 * ↑/↓ move, Enter picks, Esc closes, typing filters. Disabled options stay visible but can't be picked.
 */
export function SearchSelect({
  options,
  value,
  onChange,
  label,
  hideLabel = false,
  labelClassName = "",
  searchPlaceholder = "Search",
  emptyText = "No matches",
  triggerClassName = "",
  menuClassName = "left-0 right-0",
  className = "",
}: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);
  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  const optionId = (i: number) => `${id}-opt-${i}`;

  function firstEnabled(list: SearchSelectOption[], from = 0, step = 1) {
    for (let i = from; i >= 0 && i < list.length; i += step) if (!list[i].disabled) return i;
    return -1;
  }

  /**
   * Scroll only the list, never the page (scrollIntoView would also move the window).
   * `center` jumps instantly on open; otherwise the list glides just enough to show the option.
   */
  function revealInList(el: HTMLElement | null | undefined, center = false) {
    const list = listRef.current;
    if (!list || !el) return;
    const lr = list.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    let top = list.scrollTop;
    if (center) top += er.top - lr.top - (lr.height - er.height) / 2;
    else if (er.top < lr.top) top -= lr.top - er.top + 6;
    else if (er.bottom > lr.bottom) top += er.bottom - lr.bottom + 6;
    else return;
    list.scrollTo({ top, behavior: center ? "instant" : "smooth" });
  }

  function openMenu() {
    setQuery("");
    const current = options.findIndex((o) => o.value === value);
    setActive(current >= 0 ? current : firstEnabled(options));
    setOpen(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
      revealInList(listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]'), true);
    });
  }

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function pick(option: SearchSelectOption) {
    if (option.disabled) return;
    close();
    if (option.value !== value) onChange(option.value);
  }

  function move(step: 1 | -1) {
    if (filtered.length === 0) return;
    const start = active < 0 ? (step === 1 ? 0 : filtered.length - 1) : active + step;
    const next = firstEnabled(filtered, start, step);
    if (next >= 0) setActive(next);
  }

  // Keep the highlighted option in view while moving with the keyboard.
  useEffect(() => {
    if (!open || active < 0) return;
    revealInList(document.getElementById(optionId(active)));
    // optionId and revealInList only read refs and the stable useId value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active]);

  // Close when tapping or clicking anywhere outside.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <span id={`${id}-label`} className={hideLabel ? "sr-only" : labelClassName}>
        {label}
      </span>

      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openMenu();
          }
        }}
        className={`flex w-full cursor-pointer items-center justify-between gap-2 text-left ${triggerClassName}`}
      >
        <span id={`${id}-value`} className="min-w-0 truncate">
          {selected?.label ?? "Select"}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 12 8"
          className={`h-2 w-3 shrink-0 fill-none stroke-current stroke-2 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M1 1l5 5 5-5" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute top-[calc(100%+6px)] z-50 max-w-[calc(100vw-2rem)] overflow-hidden rounded-card border border-line bg-surface text-ink shadow-[0_12px_32px_-8px_rgb(0_0_0/0.25)] ${menuClassName}`}
        >
          <div className="border-b border-line p-2">
            <div className="relative">
              <svg
                aria-hidden
                viewBox="0 0 20 20"
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 fill-none stroke-muted stroke-2"
              >
                <circle cx="9" cy="9" r="6" />
                <path d="M14 14l4 4" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={`${id}-list`}
                aria-autocomplete="list"
                aria-activedescendant={active >= 0 ? optionId(active) : undefined}
                aria-label={`Search ${label.toLowerCase()}`}
                autoComplete="off"
                spellCheck={false}
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => {
                  const next = e.target.value;
                  setQuery(next);
                  const nq = next.trim().toLowerCase();
                  const list = nq ? options.filter((o) => o.label.toLowerCase().includes(nq)) : options;
                  setActive(firstEnabled(list));
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    move(1);
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    move(-1);
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (active >= 0 && filtered[active]) pick(filtered[active]);
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    close();
                  } else if (e.key === "Tab") {
                    close(false);
                  }
                }}
                className="h-10 w-full rounded-lg border border-line bg-canvas pr-3 pl-9 text-base text-ink placeholder:text-muted focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <ul
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            aria-labelledby={`${id}-label`}
            className="thin-scroll max-h-[min(320px,50vh)] overflow-y-auto p-1.5"
          >
            {filtered.length === 0 && <li className="px-3 py-3 text-[15px] text-muted">{emptyText}</li>}
            {filtered.map((o, i) => {
              const isSelected = o.value === value;
              return (
                <li
                  key={o.value}
                  id={optionId(i)}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={o.disabled || undefined}
                  onPointerMove={() => !o.disabled && active !== i && setActive(i)}
                  onClick={() => pick(o)}
                  className={`flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 py-2 text-[15px] ${
                    o.disabled ? "cursor-not-allowed text-muted" : "cursor-pointer"
                  } ${i === active ? "bg-brand-soft" : ""} ${isSelected ? "font-semibold text-brand" : ""}`}
                >
                  <span className="min-w-0 truncate">
                    {o.label}
                    {o.hint && <span className="ml-1.5 text-xs font-normal text-muted">{o.hint}</span>}
                  </span>
                  {isSelected && (
                    <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2">
                      <path d="M3 8.5l3 3 7-7" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
