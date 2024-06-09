// code duplicated from d3-geo-projection
import {abs, asin, atan2, cos, epsilon, halfPi, pow, sign, sin} from "./math.js";

export function lagrangeRaw(n) {

  function forward(lambda, phi) {
    if (abs(abs(phi) - halfPi) < epsilon) return [0, phi < 0 ? -2 : 2];
    const sinPhi = sin(phi);
    const v = pow((1 + sinPhi) / (1 - sinPhi), n / 2);
    const c = 0.5 * (v + 1 / v) + cos(lambda *= n);
    return [2 * sin(lambda) / c, (v - 1 / v) / c];
  }

  forward.invert = (x, y) => {
    const y0 = abs(y);
    if (abs(y0 - 2) < epsilon) return x ? null : [0, sign(y) * halfPi];
    if (y0 > 2) return null;

    x /= 2, y /= 2;
    const x2 = x * x;
    const y2 = y * y;
    let t = 2 * y / (1 + x2 + y2); // tanh(nPhi)
    t = pow((1 + t) / (1 - t), 1 / n);
    return [
      atan2(2 * x, 1 - x2 - y2) / n,
      asin((t - 1) / (t + 1))
    ];
  };

  return forward;
}
