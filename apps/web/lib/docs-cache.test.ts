import { test } from "node:test";
import assert from "node:assert/strict";
import { createCache } from "./docs-cache.ts";

function counter<T>(values: T[]) {
  let calls = 0;
  const fetcher = async () => values[Math.min(calls++, values.length - 1)];
  return { fetcher, calls: () => calls };
}

test("concurrent gets share one request", async () => {
  const c = counter(["a"]);
  const cache = createCache(c.fetcher, { ttlMs: 1000, now: () => 0 });
  const [x, y] = await Promise.all([cache.get(), cache.get()]);
  assert.deepEqual([x, y, c.calls()], ["a", "a", 1]);
});

test("serves the cached value within the TTL, refetches after", async () => {
  let t = 0;
  const c = counter(["a", "b"]);
  const cache = createCache(c.fetcher, { ttlMs: 1000, now: () => t });
  assert.equal(await cache.get(), "a");
  t = 999;
  assert.equal(await cache.get(), "a");
  assert.equal(c.calls(), 1);
  t = 1000;
  assert.equal(await cache.get(), "b");
  assert.equal(c.calls(), 2);
});

test("force and invalidate both trigger a refetch", async () => {
  const c = counter(["a", "b", "c"]);
  const cache = createCache(c.fetcher, { ttlMs: 1000, now: () => 0 });
  await cache.get();
  assert.equal(await cache.get({ force: true }), "b");
  cache.invalidate();
  assert.equal(await cache.get(), "c");
  assert.equal(c.calls(), 3);
});

test("errors are not cached: the next get retries", async () => {
  let calls = 0;
  const cache = createCache(async () => { if (calls++ === 0) throw new Error("500"); return "ok"; }, { ttlMs: 1000, now: () => 0 });
  await assert.rejects(cache.get(), /500/);
  assert.equal(await cache.get(), "ok");
  assert.equal(calls, 2);
});

test("peek returns the last good value, even after invalidate", async () => {
  const cache = createCache(async () => "a", { ttlMs: 1000, now: () => 0 });
  assert.equal(cache.peek(), undefined);
  await cache.get();
  cache.invalidate();
  assert.equal(cache.peek(), "a");
});
