import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHex, withAlpha } from "../../src/lib/theme.mjs";

test("parses short and long hex", () => {
  assert.deepEqual(parseHex("#f2f1ec"), [242, 241, 236]);
  assert.deepEqual(parseHex(" #fff "), [255, 255, 255]);
  assert.equal(parseHex("rebeccapurple"), null);
});

test("builds canvas colours from tokens with clamped alpha", () => {
  assert.equal(withAlpha("#0b0e10", 0.86), "rgba(11,14,16,0.86)");
  assert.equal(withAlpha("#0b0e10", 2), "rgba(11,14,16,1)");
  assert.equal(withAlpha("not-a-colour", 0.5), "not-a-colour");
});
