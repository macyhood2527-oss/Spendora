"use client";

import { useSyncExternalStore } from "react";

function subscribeMediaQuery(query: string, onChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener("change", onChange);

  return () => {
    mediaQuery.removeEventListener("change", onChange);
  };
}

function getMediaSnapshot(query: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(query).matches;
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => subscribeMediaQuery(query, onChange),
    () => getMediaSnapshot(query),
    () => false,
  );
}
