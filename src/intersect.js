import {abs, acos, cos, degrees, epsilon, epsilon2, pi, radians} from "./math.js";
import {cartesian, cartesianCross, cartesianDot, cartesianEqual, cartesianNormalizeInPlace, spherical} from "./cartesian.js";

export function intersectSegment(from, to) {
  this.from = from, this.to = to;
  this.normal = cartesianCross(from, to);
  this.fromNormal = cartesianCross(this.normal, from);
  this.toNormal = cartesianCross(this.normal, to);
  this.l = acos(cartesianDot(from, to));
}

// >> here a and b are segments processed by intersectSegment
export function intersect(a, b) {
  if (cartesianEqual(a.from, b.from) || cartesianEqual(a.from, b.to))
    return a.from;
  if (cartesianEqual(a.to, b.from) || cartesianEqual(a.to, b.to))
    return a.to;

  const lc = (a.l + b.l < pi) ? cos(a.l + b.l) - epsilon : -1;
  if (cartesianDot(a.from, b.from) < lc
  || cartesianDot(a.from, b.to) < lc
  || cartesianDot(a.to, b.from) < lc
  || cartesianDot(a.to, b.to) < lc)
    return;

  const axb = cartesianCross(a.normal, b.normal);
  cartesianNormalizeInPlace(axb);

  let a0 = cartesianDot(axb, a.fromNormal);
  let a1 = cartesianDot(axb, a.toNormal);
  let b0 = cartesianDot(axb, b.fromNormal);
  let b1 = cartesianDot(axb, b.toNormal);

  // check if the candidate lies on both segments
  // or is almost equal to one of the four points
  if (
    (a0 > 0 && a1 < 0 && b0 > 0 && b1 < 0) ||
    (a0 >= 0 &&
      a1 <= 0 &&
      b0 >= 0 &&
      b1 <= 0 &&
      (cartesianEqual(axb, a.from) ||
        cartesianEqual(axb, a.to) ||
        cartesianEqual(axb, b.from) ||
        cartesianEqual(axb, b.to)))
  )
    return axb;

  // same test for the antipode
  axb[0] = -axb[0];
  axb[1] = -axb[1];
  axb[2] = -axb[2];
  a0 = -a0;
  a1 = -a1;
  b0 = -b0;
  b1 = -b1;

  if (
    (a0 > 0 && a1 < 0 && b0 > 0 && b1 < 0) ||
    (a0 >= 0 &&
      a1 <= 0 &&
      b0 >= 0 &&
      b1 <= 0 &&
      (cartesianEqual(axb, a.from) ||
        cartesianEqual(axb, a.to) ||
        cartesianEqual(axb, b.from) ||
        cartesianEqual(axb, b.to)))
  )
    return axb;
}

export function intersectPointOnLine(p, a) {
  const a0 = cartesianDot(p, a.fromNormal);
  const a1 = cartesianDot(p, a.toNormal);
  p = cartesianDot(p, a.normal);
  return abs(p) < epsilon2 && (a0 > -epsilon2 && a1 < epsilon2 || a0 < epsilon2 && a1 > -epsilon2);
}

export const intersectCoincident = {};

export default function(a, b) {
  const ca = a.map(p => cartesian(p.map(d => d * radians)));
  const cb = b.map(p => cartesian(p.map(d => d * radians)));
  const i = intersect(
    new intersectSegment(ca[0], ca[1]),
    new intersectSegment(cb[0], cb[1])
  );
  return i ? spherical(i).map((d) => d * degrees) : null;
}
