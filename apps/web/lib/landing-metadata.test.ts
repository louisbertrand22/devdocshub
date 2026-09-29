import { test } from "node:test";
import assert from "node:assert/strict";
import { landingMetadata } from "./landing-metadata.ts";

test("without a public site URL, no absolute OG image is emitted (no localhost in previews)", () => {
  const m = landingMetadata(undefined);
  assert.equal(m.metadataBase, undefined);
  assert.equal((m.openGraph as { images?: unknown }).images, undefined);
});

test("with a site URL, OG and Twitter images are absolute and card is large", () => {
  const m = landingMetadata("https://devdocshub.example");
  assert.equal(String(m.metadataBase), "https://devdocshub.example/");
  assert.deepEqual((m.openGraph as { images: { url: string }[] }).images[0].url, "/landing/hero-dark.png");
  assert.equal((m.twitter as { card: string }).card, "summary_large_image");
  assert.equal((m.openGraph as { locale: string }).locale, "fr_FR");
});

test("the description promises only what ⌘K does", () => {
  const d = String(landingMetadata(undefined).description);
  assert.ok(!/n'importe quoi/.test(d), d);
});
