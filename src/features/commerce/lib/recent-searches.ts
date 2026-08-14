const STORAGE_KEY = "glowscan_recent_searches";
const MAX_ENTRIES = 5;

/** Reads must happen in an effect, never during render: there is no localStorage
 *  during SSR and reading it while rendering causes a hydration mismatch.
 *  Every access is wrapped because Safari private mode throws on write. */
export function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is string => typeof entry === "string")
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function pushRecentSearch(value: string): void {
  const trimmed = value.trim();
  if (!trimmed || typeof window === "undefined") return;
  try {
    const next = [
      trimmed,
      ...readRecentSearches().filter((entry) => entry !== trimmed),
    ].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / quota — recent searches are a nicety, never a hard failure.
  }
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignored for the same reason as above.
  }
}
