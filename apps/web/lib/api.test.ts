import { test } from "node:test";
import assert from "node:assert/strict";
import { ApiError, apiFetch, isUnauthorized } from "./api.ts";

function mockFetch(status: number, body = "") {
  globalThis.fetch = (async () => new Response(body, { status, statusText: "X" })) as typeof fetch;
}

test("apiFetch lève une ApiError qui porte le statut HTTP", async () => {
  mockFetch(429, "slow down");
  await assert.rejects(apiFetch("/auth/me", {}, "http://api"), (err: unknown) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.status, 429);
    assert.match(err.message, /^429 X — slow down$/);
    return true;
  });
});

test("isUnauthorized : seul un 401 invalide la session", () => {
  assert.equal(isUnauthorized(new ApiError(401, "401")), true);
  assert.equal(isUnauthorized(new ApiError(429, "429")), false);
  assert.equal(isUnauthorized(new ApiError(500, "500")), false);
  assert.equal(isUnauthorized(new TypeError("Failed to fetch")), false);
});
