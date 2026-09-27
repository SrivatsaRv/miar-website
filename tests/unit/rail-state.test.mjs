import { test } from "node:test";
import assert from "node:assert/strict";
import { railState } from "../../src/lib/rail-state.mjs";

// Five stages mapped to eight sections, each 800px tall, laid out back to back.
const layout = [0, 1, 2, 2, 2, 2, 3, 4];
const sectionsAt = (scrollY, start = 1000) =>
  layout.map((stage, i) => ({ stage, top: start + i * 800 - scrollY, bottom: start + (i + 1) * 800 - scrollY }));
const VH = 900;

test("hidden before the first staged section reaches the reading line", () => {
  const state = railState(sectionsAt(0), VH, 5);
  assert.equal(state.visible, false);
  assert.equal(state.complete, false);
});

test("stage follows the section under the reading line", () => {
  // Reading line (450px) inside section 0 → Receive.
  assert.equal(railState(sectionsAt(700), VH, 5).stage, 0);
  // Inside section 1 → Register.
  assert.equal(railState(sectionsAt(1500), VH, 5).stage, 1);
  // Any of sections 2–5 → Exploit.
  for (const y of [2300, 3100, 3900, 4700]) assert.equal(railState(sectionsAt(y), VH, 5).stage, 2);
  // Section 6 → Qualify, section 7 → Publish.
  assert.equal(railState(sectionsAt(5500), VH, 5).stage, 3);
  assert.equal(railState(sectionsAt(6300), VH, 5).stage, 4);
});

test("progress is continuous and never goes backwards while scrolling down", () => {
  let previous = -1;
  for (let y = 600; y <= 7200; y += 25) {
    const { progress, visible } = railState(sectionsAt(y), VH, 5);
    if (!visible) continue;
    assert.ok(progress >= previous, `progress regressed at scroll ${y}`);
    assert.ok(progress >= 0 && progress <= 1);
    previous = progress;
  }
  assert.equal(previous, 1);
});

test("progress fills within a multi-section stage", () => {
  const early = railState(sectionsAt(2300), VH, 5).progress;
  const late = railState(sectionsAt(4700), VH, 5).progress;
  assert.ok(early > 2 / 5 && early < 2.3 / 5, `early exploit progress ${early}`);
  assert.ok(late > 2.7 / 5 && late < 3 / 5, `late exploit progress ${late}`);
});

test("shows a complete state, then terminates after the last stage", () => {
  // Last section ends at 7400 in document space; reading line 450px → complete at scroll > 6950.
  const justDone = railState(sectionsAt(7000), VH, 5);
  assert.equal(justDone.visible, true);
  assert.equal(justDone.complete, true);
  assert.equal(justDone.progress, 1);

  const wellPast = railState(sectionsAt(7400), VH, 5);
  assert.equal(wellPast.visible, false);
  assert.equal(wellPast.complete, true);
});

test("handles empty input", () => {
  assert.equal(railState([], VH, 5).visible, false);
});

test("rail fill reaches each stage's dot as that stage begins", () => {
  // Top of section 1 (Register) crosses the reading line at scroll 1350.
  const atRegister = railState(sectionsAt(1351), VH, 5);
  assert.equal(atRegister.stage, 1);
  assert.ok(Math.abs(atRegister.track - 0.25) < 0.01, `track ${atRegister.track}`);
  // Entering Publish fills the track completely.
  const atPublish = railState(sectionsAt(6151), VH, 5);
  assert.equal(atPublish.stage, 4);
  assert.equal(atPublish.track, 1);
});
