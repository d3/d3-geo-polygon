import {asin, atan2, cos, degrees, epsilon2, radians, sin, hypot} from "./math.js";

export function spherical(cartesian) {
  return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
}

export function sphericalDegrees(cartesian) {
  const c = spherical(cartesian);
  return [c[0] * degrees, c[1] * degrees];
}

export function cartesian(spherical) {
  const lambda = spherical[0], phi = spherical[1], cosPhi = cos(phi);
  return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
}

export function cartesianDegrees(spherical) {
  return cartesian([spherical[0] * radians, spherical[1] * radians]);
}

export function cartesianDot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function cartesianCross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

// TODO return a
export function cartesianAddInPlace(a, b) {
  a[0] += b[0], a[1] += b[1], a[2] += b[2];
}

export function cartesianScale(vector, k) {
  return [vector[0] * k, vector[1] * k, vector[2] * k];
}

// TODO return d
export function cartesianNormalizeInPlace(d) {
  const l = hypot(d[0], d[1], d[2]);
  d[0] /= l, d[1] /= l, d[2] /= l;
}

export function cartesianEqual(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  return dx * dx + dy * dy + dz * dz < epsilon2 * epsilon2;
}
