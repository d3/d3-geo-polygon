export const abs = Math.abs;
export const atan = Math.atan;
export const atan2 = Math.atan2;
export const ceil = Math.ceil;
export const cos = Math.cos;
export const exp = Math.exp;
export const floor = Math.floor;
export const hypot = Math.hypot;
export const log = Math.log;
export const max = Math.max;
export const min = Math.min;
export const pow = Math.pow;
export const round = Math.round;
export const sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
export const sin = Math.sin;
export const tan = Math.tan;

export const epsilon = 1e-6;
export const epsilon2 = 1e-12;
export const pi = Math.PI;
export const halfPi = pi / 2;
export const quarterPi = pi / 4;
export const sqrt1_2 = Math.SQRT1_2;
export const sqrt2 = sqrt(2);
export const sqrtPi = sqrt(pi);
export const tau = pi * 2;
export const degrees = 180 / pi;
export const radians = pi / 180;

export function sinci(x) {
  return x ? x / sin(x) : 1;
}

export function asin(x) {
  return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
}

export function acos(x) {
  return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
}

export function sqrt(x) {
  return x > 0 ? Math.sqrt(x) : 0;
}

export function tanh(x) {
  x = exp(2 * x);
  return (x - 1) / (x + 1);
}

export function sinh(x) {
  return (exp(x) - exp(-x)) / 2;
}

export function cosh(x) {
  return (exp(x) + exp(-x)) / 2;
}

export function arsinh(x) {
  return log(x + sqrt(x * x + 1));
}

export function arcosh(x) {
  return log(x + sqrt(x * x - 1));
}
