import { test } from "node:test";
import assert from "node:assert/strict";
import { fragStep, pinnedProgress } from "../../src/lib/frag-steps.mjs";

test("maps scroll progress to the four story steps", () => {
  assert.equal(fragStep(0), 0);
  assert.equal(fragStep(0.09), 0);
  assert.equal(fragStep(0.1), 1);
  assert.equal(fragStep(0.3), 1);
  assert.equal(fragStep(0.5), 2);
  assert.equal(fragStep(0.7), 3);
  assert.equal(fragStep(1), 3);
});

test("is monotonic and tolerates bad input", () => {
  let last = 0;
  for (let p = 0; p <= 1; p += 0.01) {
    const step = fragStep(p);
    assert.ok(step >= last);
    last = step;
  }
  assert.equal(fragStep(Number.NaN), 0);
  assert.equal(fragStep(-1), 0);
  assert.equal(fragStep(4), 3);
});

test("pinned progress clamps to the scrollable span", () => {
  // Section 2520px tall in a 900px viewport → 1620px of pinned scroll.
  assert.equal(pinnedProgress(200, 2520, 900), 0);
  assert.equal(pinnedProgress(-810, 2520, 900), 0.5);
  assert.equal(pinnedProgress(-5000, 2520, 900), 1);
  assert.equal(pinnedProgress(-10, 600, 900), 1);
});
