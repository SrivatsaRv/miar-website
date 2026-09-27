import { test } from "node:test";
import assert from "node:assert/strict";
import { TAXONOMY, LEVELS, resolvePath, completePath, selectAt, share, countMismatches } from "../../src/lib/taxonomy.mjs";

test("every split adds up: children counts sum to their parent", () => {
  assert.deepEqual(countMismatches(TAXONOMY), []);
});

test("classification confidence narrows from domain to role to type", () => {
  // State is an attribute of the detection, not a finer class, so it is excluded:
  // an airframe can be confidently "on apron" even when its type is unresolved.
  const walk = (nodes, parent, depth) => {
    for (const node of nodes) {
      if (node.soon) continue;
      assert.ok(node.confidence > 0 && node.confidence <= 1, `${node.id} confidence out of range`);
      if (parent && depth <= 2) {
        assert.ok(node.confidence <= parent.confidence + 1e-9, `${node.id} is more confident than ${parent.id}`);
      }
      walk(node.children ?? [], node, depth + 1);
    }
  };
  walk(TAXONOMY, null, 0);
});

test("live branches reach all four levels; imagery-limited nodes explain why", () => {
  const walk = (nodes, depth) => {
    for (const node of nodes) {
      if (node.soon) continue;
      if (depth < LEVELS.length - 1) assert.ok(node.children?.length, `${node.id} stops at level ${depth}`);
      if (node.limited) assert.match(node.note ?? "", /GSD|resolution|imagery/i);
      walk(node.children ?? [], depth + 1);
    }
  };
  walk(TAXONOMY, 0);
  const limited = [];
  const find = (nodes) => nodes.forEach((n) => (n.limited && limited.push(n), find(n.children ?? [])));
  find(TAXONOMY);
  assert.ok(limited.length >= 1, "show at least one imagery-limited call");
});

test("ids are unique across the tree", () => {
  const ids = [];
  const walk = (nodes) => nodes.forEach((n) => (ids.push(n.id), walk(n.children ?? [])));
  walk(TAXONOMY);
  assert.equal(new Set(ids).size, ids.length);
});

test("completePath fills to full depth from any prefix", () => {
  assert.deepEqual(completePath(TAXONOMY, []), ["aircraft", "fighter", "su30", "su30-apron"]);
  assert.deepEqual(completePath(TAXONOMY, ["ships"]), ["ships", "combatant", "destroyer", "dd-alongside"]);
  assert.deepEqual(completePath(TAXONOMY, ["aircraft", "transport", "il76"]), ["aircraft", "transport", "il76", "il76-apron"]);
});

test("selecting a node keeps the path above it and resets below", () => {
  const path = ["aircraft", "fighter", "rafale", "rafale-taxi"];
  assert.deepEqual(selectAt(TAXONOMY, path, 1, "rotary"), ["aircraft", "rotary", "mi17", "mi17-dispersed"]);
  assert.deepEqual(selectAt(TAXONOMY, path, 3, "rafale-apron"), ["aircraft", "fighter", "rafale", "rafale-apron"]);
});

test("in-development domains resolve without children", () => {
  const path = completePath(TAXONOMY, ["vehicles"]);
  assert.equal(path[0], "vehicles");
  assert.equal(path[1], "mbt");
  assert.equal(path.length, 2);
});

test("resolvePath stops at an unknown id", () => {
  assert.equal(resolvePath(TAXONOMY, ["aircraft", "nope", "su30"]).length, 1);
});

test("share is relative to the parent count", () => {
  const [aircraft] = TAXONOMY;
  const fighter = aircraft.children[0];
  assert.equal(share(fighter, aircraft), 0.5);
  assert.equal(share(aircraft, null, TAXONOMY), 1);
  assert.equal(share(TAXONOMY[2], null, TAXONOMY), 0);
});
