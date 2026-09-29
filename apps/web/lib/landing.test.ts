import { test } from "node:test";
import assert from "node:assert/strict";
import { landingInitScript } from "./landing.ts";

/** Exécute le script de <head> ; renvoie true si <html> reçoit data-authed. */
function run(pathname: string, token: string | null, opts: { storageThrows?: boolean } = {}): boolean {
  const attrs = new Set<string>();
  const document = { documentElement: { setAttribute: (name: string) => attrs.add(name) } };
  const localStorage = {
    getItem: (key: string) => {
      if (opts.storageThrows) throw new Error("SecurityError");
      return key === "ddh_token" ? token : null;
    },
  };
  new Function("document", "location", "localStorage", landingInitScript)(document, { pathname }, localStorage);
  return attrs.has("data-authed");
}

test("hides the landing for a signed-in visitor on /", () => {
  assert.equal(run("/", "jwt"), true);
});

test("shows the landing to signed-out visitors", () => {
  assert.equal(run("/", null), false);
  assert.equal(run("/", ""), false);
});

test("never touches other routes", () => {
  assert.equal(run("/docs", "jwt"), false);
  assert.equal(run("/auth", "jwt"), false);
});

test("blocked storage: no exception, landing shown", () => {
  assert.equal(run("/", "jwt", { storageThrows: true }), false);
});
