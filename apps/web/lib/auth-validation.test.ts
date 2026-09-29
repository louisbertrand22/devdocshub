import { test } from "node:test";
import assert from "node:assert/strict";
import { isEmail, isStrongPassword, passwordScore } from "./auth-validation.ts";

test("isEmail", () => {
  assert.equal(isEmail("a@b.co"), true);
  assert.equal(isEmail("a@b"), false);
  assert.equal(isEmail("a b@c.de"), false);
});

test("passwordScore counts length, cases, digits and symbols", () => {
  assert.equal(passwordScore(""), 0);
  assert.equal(passwordScore("abcdefgh"), 2);
  assert.equal(passwordScore("Abcdefg1"), 4);
  assert.equal(passwordScore("Abcdef1!"), 5);
});

test("isStrongPassword enforces 8 characters and 3 criteria", () => {
  assert.equal(isStrongPassword("Ab1"), false);
  assert.equal(isStrongPassword("abcdefgh"), false);
  assert.equal(isStrongPassword("Abcdefg1"), true);
});
