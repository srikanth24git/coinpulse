const STORAGE_KEY = "digipulse-watchlist";

export function getWatchlist(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function isFavorite(id: string): boolean {
  return getWatchlist().includes(id);
}

export function toggleFavorite(id: string): string[] {
  const list = getWatchlist();

  let updated: string[];

  if (list.includes(id)) {
    updated = list.filter((coin) => coin !== id);
  } else {
    updated = [...list, id];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return updated;
}