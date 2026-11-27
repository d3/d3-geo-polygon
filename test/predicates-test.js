import assert from "node:assert";
import {it} from "vitest";
import {cartesian} from "../src/cartesian.js";
import {crossingSign, edgeOrVertexCrossing, loopContains, sign} from "../src/predicates.js";

const radians = Math.PI / 180;
const point = ([x, y]) => cartesian([x * radians, y * radians]);

it("sign is the orientation of three points", () => {
  assert.strictEqual(sign(point([0, 0]), point([90, 0]), point([0, 90])), 1);
  assert.strictEqual(sign(point([90, 0]), point([0, 0]), point([0, 90])), -1);
  assert.strictEqual(sign(point([0, 0]), point([0, 0]), point([0, 90])), 0);
});

it("sign is never zero for distinct points on a great circle, and consistent", () => {
  const [a, b, c] = [point([0, 0]), point([30, 0]), point([10, 0])];
  const s = sign(a, b, c);
  assert.notStrictEqual(s, 0);
  assert.strictEqual(sign(b, c, a), s);
  assert.strictEqual(sign(c, a, b), s);
  assert.strictEqual(sign(b, a, c), -s);
  assert.strictEqual(sign(a, c, b), -s);
});

it("crossingSign tells whether two edges cross", () => {
  const [a, b, c, d] = [point([-10, 0]), point([10, 0]), point([0, -10]), point([0, 10])];
  assert.strictEqual(crossingSign(a, b, c, d), 1);
  assert.strictEqual(crossingSign(a, c, b, d), -1);
  assert.strictEqual(crossingSign(a, b, a, d), 0);
});

it("loopContains is consistent with edgeOrVertexCrossing for points on the loop", () => {
  // points on the edges and at the vertices of a square
  const loop = [[0, 0], [10, 0], [10, 10], [0, 10]].map(point);
  const contains = loopContains(loop);
  assert.strictEqual(contains(point([5, 5])), true);
  assert.strictEqual(contains(point([15, 5])), false);
  const points = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 5], [10, 5], [5, 0], [5, 5], [15, 5], [-5, 5], [5, 15], [5, -5]].map(point);
  for (const p of points) {
    for (const q of points) {
      let crossings = 0;
      for (let i = 0; i < 4; ++i) if (edgeOrVertexCrossing(p, q, loop[i], loop[(i + 1) % 4])) ++crossings;
      assert.strictEqual(contains(p) !== contains(q), crossings % 2 === 1);
    }
  }
});
