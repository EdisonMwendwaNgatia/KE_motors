'use client';

const FAVORITES_KEY = 'ke_motors_favorites';
export const FAVORITES_EVENT = 'ke_motors_favorites_changed';

/**
 * Retrieves the array of favorited vehicle IDs from localStorage.
 */
export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading favorites from localStorage:', e);
    return [];
  }
}

/**
 * Checks if a vehicle ID is in the user's favorites.
 */
export function isFavorite(vehicleId: string): boolean {
  if (!vehicleId) return false;
  const list = getFavorites();
  return list.includes(vehicleId);
}

/**
 * Toggles a vehicle ID in localStorage and dispatches a custom event.
 * Returns true if the vehicle is now favorited, false otherwise.
 */
export function toggleFavorite(vehicleId: string): boolean {
  if (typeof window === 'undefined' || !vehicleId) return false;
  try {
    const current = getFavorites();
    let updated: string[];
    let isFav = false;

    if (current.includes(vehicleId)) {
      updated = current.filter((id) => id !== vehicleId);
      isFav = false;
    } else {
      updated = [...current, vehicleId];
      isFav = true;
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: { count: updated.length } }));
    return isFav;
  } catch (e) {
    console.error('Error toggling favorite:', e);
    return false;
  }
}
