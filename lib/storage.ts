import { ShelfProduct, SkinTelemetry } from './types';

const STORAGE_KEYS = {
  TELEMETRY: 'barrieraudit_telemetry_history',
  SHELF: 'barrieraudit_shelf_inventory',
  USER_API_KEY: 'barrieraudit_youcam_user_key'
};

export function saveTelemetryHistory(scan: SkinTelemetry): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getTelemetryHistory();
    const updated = [scan, ...existing].slice(0, 20);
    localStorage.setItem(STORAGE_KEYS.TELEMETRY, JSON.stringify(updated));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

export function getTelemetryHistory(): SkinTelemetry[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TELEMETRY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveShelfInventory(products: ShelfProduct[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SHELF, JSON.stringify(products));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

export function getShelfInventory(): ShelfProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SHELF);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveUserApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER_API_KEY, key.trim());
}

export function getUserApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.USER_API_KEY) || '';
}

export function clearAllLocalData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.TELEMETRY);
  localStorage.removeItem(STORAGE_KEYS.SHELF);
}
