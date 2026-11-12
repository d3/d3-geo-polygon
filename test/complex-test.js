import { assertInDelta } from "./asserts.js";
import { complexPow } from "../src/complex.js";

it("complexPow of an imaginary number", function () {
  assertInDelta(complexPow([0, 2], [2, 0]), [-4, 0]);
  assertInDelta(complexPow([0, 2], [3, 0]), [0, -8]);
  assertInDelta(complexPow([0, -1], [1, 0]), [0, -1]);
  assertInDelta(complexPow([0, -1], 1 / 2), [Math.SQRT1_2, -Math.SQRT1_2]);
  assertInDelta(complexPow([0, -5.551115123125783e-17], 1 / 2), [5.268356063861758e-9, -5.268356063861758e-9]);
});
