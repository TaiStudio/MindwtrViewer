"use client";

import { useSyncExternalStore } from "react";

import type { Lang, ViewId } from "./types";

export type Prefs = { lang?: Lang; theme?: string; view?: ViewId };

const STORAGE_KEY = "mindwtr-viewer-prefs";
const EMPTY: Prefs = {};

let snapshot: Prefs = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : EMPTY;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Prefs)
      : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): Prefs {
  if (!loaded) {
    loaded = true;
    snapshot = read();
  }
  return snapshot;
}

function getServerSnapshot(): Prefs {
  return EMPTY;
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

/** Merge a patch into the preferences, persist it and notify subscribers. */
export function updatePrefs(patch: Prefs): void {
  snapshot = { ...getSnapshot(), ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage unavailable — keep the in-memory value */
  }
  listeners.forEach((listener) => listener());
}

/**
 * UI preferences stored in localStorage. Read through the external-store API
 * so the server render (always the defaults) and the client stay in sync
 * without a setState-in-effect.
 */
export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
