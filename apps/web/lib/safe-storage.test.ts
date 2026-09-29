import { test } from "node:test";
import assert from "node:assert/strict";
import { safeGetItem, safeRemoveItem, safeSetItem } from "./safe-storage.ts";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => { data.set(k, v); },
    removeItem: (k: string) => { data.delete(k); },
  };
}
const throwing = {
  getItem: () => { throw new Error("SecurityError"); },
  setItem: () => { throw new Error("QuotaExceededError"); },
  removeItem: () => { throw new Error("SecurityError"); },
};

test("reads, writes and removes through a working storage", () => {
  const s = memoryStorage();
  assert.equal(safeSetItem("k", "v", () => s), true);
  assert.equal(safeGetItem("k", () => s), "v");
  assert.equal(safeRemoveItem("k", () => s), true);
  assert.equal(safeGetItem("k", () => s), null);
});

test("returns null / false when accessing storage itself throws", () => {
  const blocked = () => { throw new Error("SecurityError"); };
  assert.equal(safeGetItem("k", blocked), null);
  assert.equal(safeSetItem("k", "v", blocked), false);
  assert.equal(safeRemoveItem("k", blocked), false);
});

test("returns null / false when storage is missing", () => {
  assert.equal(safeGetItem("k", () => null), null);
  assert.equal(safeSetItem("k", "v", () => undefined), false);
});

test("returns null / false when storage methods throw", () => {
  assert.equal(safeGetItem("k", () => throwing), null);
  assert.equal(safeSetItem("k", "v", () => throwing), false);
  assert.equal(safeRemoveItem("k", () => throwing), false);
});
