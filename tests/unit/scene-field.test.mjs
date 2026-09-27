import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SENSORS,
  makeScenes,
  chaosPosition,
  entryPosition,
  recordLayout,
  phases,
  staggered,
} from "../../src/lib/scene-field.mjs";

const viewport = { width: 1440, height: 900 };
const safe = { left: 320, right: 1120, top: 120, bottom: 560 };

test("scene set: one usable EO and SAR scene per date, HSI every other date", () => {
  const dates = 12;
  const scenes = makeScenes(dates);
  const usable = scenes.filter((s) => s.usable);
  assert.equal(usable.filter((s) => s.sensor === "eo").length, dates);
  assert.equal(usable.filter((s) => s.sensor === "sar").length, dates);
  assert.equal(usable.filter((s) => s.sensor === "hsi").length, dates / 2);
  assert.ok(scenes.some((s) => !s.usable && s.reason === "cloud"));
  assert.ok(scenes.some((s) => !s.usable && s.reason === "duplicate"));
  // Exactly one change per sensor row.
  for (const sensor of SENSORS) {
    assert.equal(usable.filter((s) => s.sensor === sensor && s.change).length, 1, sensor);
  }
});

test("scene set is deterministic for a seed", () => {
  assert.deepEqual(makeScenes(8, 3), makeScenes(8, 3));
});

test("scattered scenes never cover the headline", () => {
  const size = 44;
  for (const scene of makeScenes(12)) {
    const { x, y, rot } = chaosPosition(scene, viewport, safe, size);
    const hits = x + size > safe.left && x < safe.right && y + size > safe.top && y < safe.bottom;
    assert.equal(hits, false, `scene ${scene.id} overlaps text at ${x},${y}`);
    assert.ok(x >= 0 && y >= 0 && x + size <= viewport.width && y + size <= viewport.height);
    assert.ok(Math.abs(rot) <= 18);
  }
});

test("scattered scenes also keep clear of the site header", () => {
  const size = 44;
  const header = { left: 0, right: viewport.width, top: 0, bottom: 76 };
  for (const scene of makeScenes(12)) {
    const { x, y } = chaosPosition(scene, viewport, [safe, header], size);
    for (const rect of [safe, header]) {
      const hits = x + size > rect.left && x < rect.right && y + size > rect.top && y < rect.bottom;
      assert.equal(hits, false, `scene ${scene.id} overlaps a protected area at ${x},${y}`);
    }
  }
});

test("scenes enter from outside the viewport", () => {
  for (const scene of makeScenes(12)) {
    const { x, y } = entryPosition(scene, viewport, 44);
    const outside = x < 0 || y < 0 || x > viewport.width || y > viewport.height;
    assert.ok(outside, `scene ${scene.id} enters from inside at ${x},${y}`);
  }
});

test("site record: rows by sensor, columns by date, all inside the band", () => {
  const dates = 12;
  const scenes = makeScenes(dates);
  const band = { left: 80, top: 600, width: 1280, height: 240 };
  const layout = recordLayout(scenes, band, dates);
  assert.equal(layout.positions.size, scenes.filter((s) => s.usable).length);
  for (const scene of scenes.filter((s) => s.usable)) {
    const { x, y } = layout.positions.get(scene.id);
    assert.equal(y, layout.rowY[SENSORS.indexOf(scene.sensor)]);
    assert.equal(x, layout.colX[scene.date]);
    assert.ok(x >= band.left && x + layout.size <= band.left + band.width + 0.001);
    assert.ok(y >= band.top && y + layout.size <= band.top + band.height + 0.001);
  }
  // Columns increase with date; no two usable scenes share a cell.
  for (let i = 1; i < dates; i++) assert.ok(layout.colX[i] > layout.colX[i - 1]);
  const cells = new Set([...layout.positions.values()].map((p) => `${p.x}:${p.y}`));
  assert.equal(cells.size, layout.positions.size);
});

test("site record shrinks tiles to fit a narrow band", () => {
  const dates = 8;
  const layout = recordLayout(makeScenes(dates), { left: 16, top: 500, width: 358, height: 160 }, dates);
  assert.ok(layout.size < 40);
  assert.ok(layout.left + layout.width <= 16 + 358 + 0.001);
});

test("phases are monotonic and ordered in the story", () => {
  let previous = phases(0);
  for (let p = 0; p <= 1.0001; p += 0.01) {
    const current = phases(p);
    for (const key of ["order", "discard", "change", "contract", "caption"]) {
      assert.ok(current[key] >= previous[key] - 1e-9, `${key} regressed at ${p}`);
    }
    previous = current;
  }
  const start = phases(0);
  assert.equal(start.order, 0);
  assert.equal(start.caption, 0);
  const end = phases(1);
  assert.equal(end.order, 1);
  assert.equal(end.contract, 1);
  assert.equal(end.caption, 2);
  // Change markers only light once the record has formed.
  assert.equal(phases(0.5).change, 0);
  assert.ok(phases(0.62).order > 0.99);
});

test("stagger settles earlier dates first and every tile by the end", () => {
  const scenes = makeScenes(12);
  const first = scenes.find((s) => s.date === 0);
  const last = scenes.find((s) => s.date === 11);
  assert.ok(staggered(0.5, first, 12) > staggered(0.5, last, 12));
  assert.equal(staggered(1, last, 12), 1);
  assert.equal(staggered(0, first, 12), 0);
});

test("tolerates bad input", () => {
  assert.equal(phases(Number.NaN).order, 0);
  assert.equal(phases(5).order, 1);
});
