export type Cache<T> = {
  /** Valeur en cache si fraîche, sinon (re)chargement ; requêtes simultanées mutualisées. */
  get(opts?: { force?: boolean }): Promise<T>;
  /** La prochaine lecture refera la requête. */
  invalidate(): void;
  /** Dernière valeur obtenue, même périmée. */
  peek(): T | undefined;
};

export function createCache<T>(
  fetcher: () => Promise<T>,
  { ttlMs, now = Date.now }: { ttlMs: number; now?: () => number },
): Cache<T> {
  let value: T | undefined;
  let fetchedAt: number | null = null;
  let inFlight: Promise<T> | null = null;

  return {
    get({ force = false } = {}) {
      if (inFlight) return inFlight;
      if (!force && fetchedAt !== null && now() - fetchedAt < ttlMs) {
        return Promise.resolve(value as T);
      }
      inFlight = fetcher()
        .then((result) => {
          value = result;
          fetchedAt = now();
          return result;
        })
        .finally(() => {
          inFlight = null;
        });
      return inFlight;
    },
    invalidate() {
      fetchedAt = null;
    },
    peek() {
      return value;
    },
  };
}
