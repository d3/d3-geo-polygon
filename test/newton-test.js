import {it} from "vitest";
import { assertInDelta } from "./asserts.js";
import { solve2d } from "../src/newton.js";

it("solve2d backtracks when it steps out of the domain of f", function () {
  // f is defined for a ≤ 1; the first step from a = 0.1 overshoots
  const f = (a, b) => (a <= 1 ? [a ** 3, b] : [NaN, NaN]);
  assertInDelta(solve2d(f)(0.97, 0, 0.1, 0), [Math.cbrt(0.97), 0]);
});
