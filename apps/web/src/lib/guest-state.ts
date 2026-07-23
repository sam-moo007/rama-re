const SHORTLIST_KEY = "rama_guest_shortlist";

export function getGuestShortlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(SHORTLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveGuestShortlist(slugs: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(slugs));
  } catch (e) {
    console.error("Failed to save guest shortlist", e);
  }
}

export function mergeGuestShortlist(serverSlugs: string[]): string[] {
  const guestSlugs = getGuestShortlist();
  const merged = Array.from(new Set([...serverSlugs, ...guestSlugs]));
  return merged;
}

export function clearGuestShortlist(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SHORTLIST_KEY);
}
