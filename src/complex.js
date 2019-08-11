import { abs, atan2, cos, exp, halfPi, log, pow, sin, sqrt } from "./math.js";

export function complexAtan(x, y) {
  var x2 = x * x,
    y_1 = y + 1,
    t = 1 - x2 - y * y;
  return [
    0.5 * ((x >= 0 ? halfPi : -halfPi) - atan2(t, 2 * x)),
    -0.25 * log(t * t + 4 * x2) + 0.5 * log(y_1 * y_1 + x2)
  ];
}

export function complexDivide(a, b) {
  if (b[1]) (a = complexMul(a, [b[0], -b[1]])), (b = complexNorm2(b));
  else b = b[0];
  return [a[0] / b, a[1] / b];
}

export function complexMul(a, b) {
  return [a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]];
}

export function complexAdd(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

export function complexSub(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}

export function complexNorm2(a) {
  return a[0] * a[0] + a[1] * a[1];
}

export function complexNorm(a) {
  return sqrt(complexNorm2(a));
}

export function complexLogHypot(a, b) {
  var _a = abs(a),
    _b = abs(b);
  if (a === 0) return log(_b);
  if (b === 0) return log(_a);
  if (_a < 3000 && _b < 3000) return log(a * a + b * b) * 0.5;
  return log(a / cos(atan2(b, a)));
}

// adapted from https://github.com/infusion/Complex.js
export function complexPow(a, n) {
  var b = a[1],
    arg,
    loh;
  a = a[0];
  if (a === 0 && b === 0) return [0, 0];

  if (typeof n === "number") n = [n, 0];

  if (!n[1]) {
    if (b === 0 && a >= 0) {
      return [pow(a, n[0]), 0];
    } else if (a === 0) {
      switch ((n[1] % 4 + 4) % 4) {
        case 0:
          return [pow(b, n[0]), 0];
        case 1:
          return [0, pow(b, n[0])];
        case 2:
          return [-pow(b, n[0]), 0];
        case 3:
          return [0, -pow(b, n[0])];
      }
    }
  }

  arg = atan2(b, a);
  loh = complexLogHypot(a, b);
  a = exp(n[0] * loh - n[1] * arg);
  b = n[1] * loh + n[0] * arg;
  return [a * cos(b), a * sin(b)];
}
