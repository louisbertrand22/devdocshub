import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { contrastRatio } from "../lib/contrast.ts";

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

function block(selector: RegExp): Record<string, string> {
  const match = css.match(selector);
  assert.ok(match, `block ${selector} not found in globals.css`);
  const vars: Record<string, string> = {};
  for (const [, name, value] of match[1].matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    vars[name] = value.trim();
  }
  return vars;
}

const themes = {
  light: block(/(?:^|\n):root\s*\{([^}]*)\}/),
  dark: block(/(?:^|\n)\.dark\s*\{([^}]*)\}/),
};

const REQUIRED = [
  "bg", "surface", "surface-2", "border", "fg", "fg-muted",
  "accent", "accent-fg", "accent-subtle", "accent-border",
  "success", "warning", "danger",
];

// [texte, fond] — toutes les paires texte/fond utilisées par l'UI
const PAIRS: [string, string][] = [
  ["fg", "bg"], ["fg", "surface"], ["fg", "surface-2"],
  ["fg-muted", "bg"], ["fg-muted", "surface"], ["fg-muted", "surface-2"],
  ["accent", "bg"], ["accent", "surface"], ["accent-fg", "accent"],
  ["success", "bg"], ["warning", "bg"], ["danger", "bg"], ["danger", "surface"],
];

for (const [name, vars] of Object.entries(themes)) {
  test(`${name}: defines every token`, () => {
    for (const token of REQUIRED) assert.ok(vars[token], `--${token} missing in ${name}`);
  });

  for (const [fg, bg] of PAIRS) {
    test(`${name}: ${fg} on ${bg} meets WCAG AA (4.5:1)`, () => {
      const ratio = contrastRatio(vars[fg], vars[bg]);
      assert.ok(ratio >= 4.5, `${fg} on ${bg} = ${ratio.toFixed(2)}:1`);
    });
  }
}
