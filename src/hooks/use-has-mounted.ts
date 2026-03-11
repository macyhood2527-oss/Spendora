"use client";

import { useSyncExternalStore } from "react";

let hasMountedSnapshot = false;
const listeners = new Set<() => void>();

function emitMounted() {
  hasMountedSnapshot = true;
  listeners.forEach((listener) => listener());
}

export function useHasMounted() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);

      if (!hasMountedSnapshot) {
        queueMicrotask(emitMounted);
      }

      return () => {
        listeners.delete(listener);
      };
    },
    () => hasMountedSnapshot,
    () => false,
  );
}
