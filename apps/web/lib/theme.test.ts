import { test } from "node:test";
import assert from "node:assert/strict";
import { THEME_STORAGE_KEY, resolveTheme, themeInitScript } from "./theme.ts";

test("resolveTheme: only an explicit 'light' gives light", () => {
  assert.equal(resolveTheme("light"), "light");
  assert.equal(resolveTheme("dark"), "dark");
  assert.equal(resolveTheme(null), "dark");
  assert.equal(resolveTheme(undefined), "dark");
  assert.equal(resolveTheme("system"), "dark");
  assert.equal(resolveTheme(""), "dark");
});

/** Exécute le script d'init contre un faux document ; renvoie true si .dark est posé. */
function runInitScript(stored: string | null, opts: { storageThrows?: boolean } = {}): boolean {
  const classes = new Set<string>(["dark"]); // le serveur rend <html class="dark">
  const documentElement = {
    classList: {
      toggle(name: string, force: boolean) { if (force) classes.add(name); else classes.delete(name); },
      add(name: string) { classes.add(name); },
    },
  };
  const localStorage = {
    getItem(key: string) {
      if (opts.storageThrows) throw new Error("SecurityError");
      return key === THEME_STORAGE_KEY ? stored : null;
    },
  };
  new Function("document", "localStorage", themeInitScript)({ documentElement }, localStorage);
  return classes.has("dark");
}

test("init script keeps dark when nothing is stored", () => {
  assert.equal(runInitScript(null), true);
});

test("init script removes dark when light is stored", () => {
  assert.equal(runInitScript("light"), false);
});

test("init script keeps dark for dark or unknown values", () => {
  assert.equal(runInitScript("dark"), true);
  assert.equal(runInitScript("system"), true);
});

test("init script falls back to dark when localStorage throws", () => {
  assert.equal(runInitScript("light", { storageThrows: true }), true);
});
