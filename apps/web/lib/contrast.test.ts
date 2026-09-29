import { test } from "node:test";
import assert from "node:assert/strict";
import { contrastRatio, hexToRgb } from "./contrast.ts";

test("hexToRgb parses 6-digit hex with or without #", () => {
  assert.deepEqual(hexToRgb("#0f1115"), [15, 17, 21]);
  assert.deepEqual(hexToRgb("FFFFFF"), [255, 255, 255]);
});

test("hexToRgb rejects anything that is not 6-digit hex", () => {
  assert.throws(() => hexToRgb("#fff"), /Invalid hex colour/);
  assert.throws(() => hexToRgb("rgb(0 0 0)"), /Invalid hex colour/);
});

test("contrastRatio: black on white is 21, same colour is 1", () => {
  assert.equal(Math.round(contrastRatio("#000000", "#ffffff") * 100) / 100, 21);
  assert.equal(contrastRatio("#5ccfe6", "#5ccfe6"), 1);
});

test("contrastRatio is symmetric", () => {
  assert.equal(contrastRatio("#0e7490", "#ffffff"), contrastRatio("#ffffff", "#0e7490"));
});
