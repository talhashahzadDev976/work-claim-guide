"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_PLACE } from "@/lib/places/places";

// FR-02: remember the visitor's chosen state across pages.
const KEY = "wcg-place";
const EVENT = "wcg-place-change";

function read() {
  try {
    return localStorage.getItem(KEY) ?? DEFAULT_PLACE;
  } catch {
    return DEFAULT_PLACE;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function usePlace() {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_PLACE);
}

export function setPlace(slug: string) {
  try {
    localStorage.setItem(KEY, slug);
  } catch {
    // Storage blocked: the choice simply isn't remembered.
  }
  window.dispatchEvent(new Event(EVENT));
}
