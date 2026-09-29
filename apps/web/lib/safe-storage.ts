type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type StorageGetter = () => StorageLike | null | undefined;

// Accéder à window.localStorage peut lever une SecurityError (cookies bloqués,
// iframe sandboxée) ou renvoyer null (stockage désactivé) : tout passe par ici.
const defaultStorage: StorageGetter = () =>
  typeof window === "undefined" ? null : window.localStorage;

function resolve(getStorage: StorageGetter): StorageLike | null {
  try {
    return getStorage() ?? null;
  } catch {
    return null;
  }
}

export function safeGetItem(key: string, getStorage: StorageGetter = defaultStorage): string | null {
  const storage = resolve(getStorage);
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string, getStorage: StorageGetter = defaultStorage): boolean {
  const storage = resolve(getStorage);
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemoveItem(key: string, getStorage: StorageGetter = defaultStorage): boolean {
  const storage = resolve(getStorage);
  if (!storage) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
