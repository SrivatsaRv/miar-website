import { test } from "node:test";
import assert from "node:assert/strict";
import { PLATFORMS, ASSETS, OBSERVED, LEVELS, distanceKm, reachKm, assessThreat } from "../../src/lib/threat-model.mjs";

const detection = { id: "D-2291", count: 4, delta: 4, confidence: 0.88 };

test("same apron, different platform, different meaning", () => {
  const fighter = assessThreat("fighter", detection);
  const transport = assessThreat("transport", detection);
  assert.equal(fighter.level, "High");
  assert.equal(fighter.posture, "Offensive air capability");
  assert.equal(transport.level, "Watch");
  assert.equal(transport.posture, "Logistics or troop movement");
  assert.equal(transport.inRange.length, 0);
});

test("fighter threat names the nearest protected asset inside combat radius", () => {
  const signal = assessThreat("fighter", detection);
  assert.equal(signal.reach, 550);
  assert.deepEqual(signal.inRange.map((a) => a.id), ["radar-t", "afs-k", "hub-r"]);
  assert.ok(!signal.inRange.some((a) => a.id === "cmd-n"), "command centre at ~603 km is outside");
  assert.match(signal.headline, /Radar Site T · under threat from detection D-2291/);
  assert.ok(signal.reasons.some((r) => r.includes("inside combat radius")));
});

test("no surge downgrades an in-range fighter presence to Elevated", () => {
  assert.equal(assessThreat("fighter", { ...detection, delta: 0 }).level, "Elevated");
});

test("co-located tankers extend fighter reach to the far asset", () => {
  assert.equal(reachKm(PLATFORMS.fighter, { tankerPresent: true }), 850);
  const extended = assessThreat("fighter", detection, ASSETS, { tankerPresent: true });
  assert.ok(extended.inRange.some((a) => a.id === "cmd-n"));
  const tanker = assessThreat("tanker", detection);
  assert.equal(tanker.level, "Elevated");
  assert.equal(tanker.reach, 850);
});

test("AEW&C is assessed against its radar coverage", () => {
  const signal = assessThreat("aew", detection);
  assert.equal(signal.reach, 400);
  assert.equal(signal.level, "Elevated");
  assert.deepEqual(signal.inRange.map((a) => a.id), ["radar-t", "afs-k", "hub-r"]);
});

test("in-range assets are sorted nearest first with rounded distances", () => {
  const signal = assessThreat("fighter", detection);
  const distances = signal.inRange.map((a) => a.distance);
  assert.deepEqual(distances, [...distances].sort((a, b) => a - b));
  assert.equal(signal.inRange[0].distance, Math.round(distanceKm(OBSERVED, ASSETS[0])));
});

test("every signal waits for analyst qualification and carries reasons and actions", () => {
  for (const id of Object.keys(PLATFORMS)) {
    const signal = assessThreat(id, detection);
    assert.equal(signal.requiresQualification, true, id);
    assert.ok(signal.reasons.length >= 3, `${id} reasons`);
    assert.ok(signal.actions.length >= 2, `${id} actions`);
    assert.ok(LEVELS.includes(signal.level));
  }
});

test("unknown platforms are not assessed", () => {
  const signal = assessThreat("drone-x", detection);
  assert.equal(signal.level, "Unassessed");
  assert.equal(signal.requiresQualification, true);
});
