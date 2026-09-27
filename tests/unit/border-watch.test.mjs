import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BASES, perception, assessBase, distanceToLineKm, nearestOnLine, sectorsFor } from "../../src/lib/border-watch.mjs";

const ib = JSON.parse(readFileSync(new URL("../../src/data/ib-sector.json", import.meta.url))).latlngs;

test("three bases at three different perception levels", () => {
  assert.deepEqual(BASES.map(perception), ["High", "Elevated", "Routine"]);
});

test("a fighter surge only reads as High when protected assets are in reach", () => {
  const a = BASES[0];
  assert.equal(perception({ ...a, protectedInReach: 0 }), "Routine");
  assert.equal(perception({ ...a, observed: a.observed.map((o) => ({ ...o, delta: 0 })) }), "Routine");
});

test("every base sits across the IB, tens of kilometres from it", () => {
  for (const base of BASES) {
    const d = distanceToLineKm(base, ib);
    assert.ok(d > 20 && d < 250, `${base.id} is ${d.toFixed(1)} km from the IB`);
    // West of the boundary at its own latitude: the observed side.
    const nearestLng = ib.reduce((best, p) => (Math.abs(p[0] - base.lat) < Math.abs(best[0] - base.lat) ? p : best))[1];
    assert.ok(base.lng < nearestLng, `${base.id} should be west of the IB`);
  }
});

test("distance to a line is exact for a simple case", () => {
  const line = [[30, 74], [31, 74]];
  const d = distanceToLineKm({ lat: 30.5, lng: 73 }, line);
  assert.ok(Math.abs(d - 111.32 * Math.cos((30.5 * Math.PI) / 180)) < 0.5);
});

test("assessments are one short line per field", () => {
  for (const base of BASES) {
    const result = assessBase(base, 80);
    assert.ok(result.observed.length >= 2);
    assert.match(result.assessment, /80 km from the IB/);
    for (const field of ["platform", "capability", "assessment", "next"]) {
      assert.ok(result[field].length > 0 && result[field].length <= 90, `${base.id}.${field} is ${result[field].length} chars`);
    }
    assert.ok(result.observed.every((line) => line.length <= 40), `${base.id} observed lines stay short`);
    assert.equal(result.requiresQualification, true);
  }
  assert.match(assessBase(BASES[0], 60).assessment, /Raised from Elevated/);
  assert.match(assessBase(BASES[1], 60).assessment, /Raised from Routine/);
  assert.match(assessBase(BASES[2], 60).capability, /No strike capability/);
  assert.doesNotMatch(assessBase(BASES[2], 60).assessment, /Raised/);
});

test("the IB splits into contiguous sectors that cover every vertex", () => {
  const sectors = sectorsFor(ib, BASES);
  assert.ok(sectors.length >= 3);
  assert.deepEqual([...new Set(sectors.map((s) => s.baseId))].sort(), ["a", "b", "c"]);
  for (let i = 1; i < sectors.length; i++) {
    assert.deepEqual(sectors[i].latlngs[0], sectors[i - 1].latlngs.at(-1), "sectors should join without gaps");
  }
  const covered = new Set(sectors.flatMap((s) => s.latlngs.map((p) => p.join(","))));
  for (const p of ib) assert.ok(covered.has(p.join(",")));
});

test("nearest point lies on the boundary and matches the distance", () => {
  for (const base of BASES) {
    const n = nearestOnLine(base, ib);
    assert.ok(Math.abs(n.distanceKm - distanceToLineKm(base, ib)) < 1e-9);
    const lats = ib.map((p) => p[0]);
    assert.ok(n.lat <= Math.max(...lats) + 1e-6 && n.lat >= Math.min(...lats) - 1e-6);
    assert.ok(distanceToLineKm({ lat: n.lat, lng: n.lng }, ib) < 0.5, "nearest point should sit on the line");
  }
});
