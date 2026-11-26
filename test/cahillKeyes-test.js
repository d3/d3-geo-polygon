import assert from "node:assert";
import {it} from "vitest";
import { geoCahillKeyesRaw } from "../src/index.js";

it("Cahill-Keyes is continuous at the 75th parallel", function () {
  const raw = geoCahillKeyesRaw(10000);
  const radians = Math.PI / 180;
  for (let lambda = -180; lambda <= 180; lambda += 2.5) {
    const a = raw(lambda * radians, 75 * radians);
    const b = raw(lambda * radians, (75 - 1e-9) * radians);
    assert(Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-3, `${lambda}: ${a} ${b}`);
  }
});

it("Cahill-Keyes raw scales with mg", function () {
  const raw = geoCahillKeyesRaw(10000);
  const raw1 = geoCahillKeyesRaw(1);
  const radians = Math.PI / 180;
  for (let y = -90; y <= 90; y += 2.5) {
    for (let x = -180; x <= 180; x += 2.5) {
      const a = raw(x * radians, y * radians);
      const b = raw1(x * radians, y * radians);
      assert(Math.hypot(a[0] - b[0] * 10000, a[1] - b[1] * 10000) < 1e-6, `[${x}, ${y}]: ${a} ${b}`);
    }
  }
});
