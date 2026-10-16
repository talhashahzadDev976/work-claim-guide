"use client";

import { useRef, useState } from "react";

/**
 * FR-09: "Copy link" puts the inputs in the URL query, so a result can be shared or revisited.
 * The URL bar is updated too, so the link survives even when clipboard access is blocked.
 */
export function useCopyLink() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function copy(query: URLSearchParams) {
    const url = `${window.location.origin}${window.location.pathname}?${query}`;
    window.history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard blocked: the URL bar now holds the link instead.
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2500);
  }

  return { copied, copy, reset: () => setCopied(false) };
}

/** True on phones and tablets, where the result sits below the inputs instead of beside them. */
export function isStackedLayout() {
  return window.matchMedia("(max-width: 1023px)").matches;
}
