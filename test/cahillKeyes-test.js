import assert from "assert";
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
