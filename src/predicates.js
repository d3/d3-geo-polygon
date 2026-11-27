// Exact predicates on the sphere, after S2 (https://github.com/google/s2geometry).
// Ties are broken by symbolic perturbation, so the tests never contradict each other.

import {fsum} from "d3-array";
import {cartesianCross, cartesianNormalize} from "./cartesian.js";

// Exact arithmetic: products are split into exact pairs (Dekker), and fsum is
// exact up to its final rounding, so the sign of its result is exact.
const eps = 2 ** -53;
const splitter = 2 ** 27 + 1;
const errbound3 = (7 + 56 * eps) * eps;

// a * b = x + y exactly; returns [y, x]
function twoProduct(a, b) {
  const x = a * b;
  let c = splitter * a;
  const ahi = c - (c - a), alo = a - ahi;
  c = splitter * b;
  const bhi = c - (c - b), blo = b - bhi;
  return [alo * blo - (x - ahi * bhi - alo * bhi - ahi * blo), x];
}

// sign(p0 * q1 - p1 * q0)
function det2(p0, p1, q0, q1) {
  return Math.sign(fsum([...twoProduct(p0, q1), ...twoProduct(-p1, q0)]));
}

// sign(a · (b × c))
function det3(a, b, c) {
  const b1c2 = b[1] * c[2], b2c1 = b[2] * c[1];
  const b2c0 = b[2] * c[0], b0c2 = b[0] * c[2];
  const b0c1 = b[0] * c[1], b1c0 = b[1] * c[0];
  const d = a[0] * (b1c2 - b2c1) + a[1] * (b2c0 - b0c2) + a[2] * (b0c1 - b1c0);
  const permanent =
    Math.abs(a[0]) * (Math.abs(b1c2) + Math.abs(b2c1)) +
    Math.abs(a[1]) * (Math.abs(b2c0) + Math.abs(b0c2)) +
    Math.abs(a[2]) * (Math.abs(b0c1) + Math.abs(b1c0));
  if (Math.abs(d) > errbound3 * permanent) return Math.sign(d);
  // six products, each exactly the sum of four numbers
  const terms = [];
  for (const [s, i, j, k] of [[1, 0, 1, 2], [-1, 0, 2, 1], [1, 1, 2, 0], [-1, 1, 0, 2], [1, 2, 0, 1], [-1, 2, 1, 0]]) {
    const [y, x] = twoProduct(s * a[i], b[j]);
    terms.push(...twoProduct(y, c[k]), ...twoProduct(x, c[k]));
  }
  return Math.sign(fsum(terms));
}

export function equal(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

function less(a, b) {
  return a[0] < b[0] || (a[0] === b[0] && (a[1] < b[1] || (a[1] === b[1] && a[2] < b[2])));
}

// S2’s SymbolicallyPerturbedSign, for a < b < c (lexicographic); never 0.
function perturbedSign(a, b, c) {
  let s;
  if ((s = det2(b[0], b[1], c[0], c[1]))) return s; // (b × c)[2]
  if ((s = det2(b[2], b[0], c[2], c[0]))) return s; // (b × c)[1]
  if ((s = det2(b[1], b[2], c[1], c[2]))) return s; // (b × c)[0]
  if ((s = det2(c[0], c[1], a[0], a[1]))) return s;
  if ((s = Math.sign(c[0]))) return s;
  if ((s = -Math.sign(c[1]))) return s;
  if ((s = det2(c[2], c[0], a[2], a[0]))) return s;
  if ((s = Math.sign(c[2]))) return s;
  if ((s = det2(a[0], a[1], b[0], b[1]))) return s;
  if ((s = -Math.sign(b[0]))) return s;
  if ((s = Math.sign(b[1]))) return s;
  if ((s = Math.sign(a[0]))) return s;
  return 1;
}

// sign(a · (b × c)), perturbed; 0 only if two points are equal.
export function sign(a, b, c) {
  if (equal(a, b) || equal(b, c) || equal(c, a)) return 0;
  const s = det3(a, b, c);
  if (s) return s;
  let p = 1;
  if (less(b, a)) ([a, b] = [b, a]), (p = -p);
  if (less(c, b)) ([b, c] = [c, b]), (p = -p);
  if (less(b, a)) ([a, b] = [b, a]), (p = -p);
  return p * perturbedSign(a, b, c);
}

// 1 if edges AB and CD cross, 0 if they share a vertex, -1 otherwise.
export function crossingSign(a, b, c, d) {
  if (equal(a, c) || equal(a, d) || equal(b, c) || equal(b, d)) return 0;
  if (equal(a, b) || equal(c, d)) return -1;
  const acb = -sign(a, b, c);
  if (sign(a, b, d) !== acb) return -1;
  if (-sign(c, d, b) !== acb) return -1;
  return sign(c, d, a) === acb ? 1 : -1;
}

// Are OA, OB, OC in counterclockwise order around O?
function orderedCCW(a, b, c, o) {
  let sum = 0;
  if (sign(b, o, a) >= 0) ++sum;
  if (sign(c, o, b) >= 0) ++sum;
  if (sign(a, o, c) > 0) ++sum;
  return sum >= 2;
}

// S2::Ortho
function ortho(a) {
  const x = Math.abs(a[0]), y = Math.abs(a[1]), z = Math.abs(a[2]);
  let k = (x > y ? (x > z ? 0 : 2) : y > z ? 1 : 2) - 1;
  if (k < 0) k = 2;
  const t = [0.012, 0.0053, 0.00457];
  t[k] = 1;
  return cartesianNormalize(cartesianCross(a, t));
}

// S2::VertexCrossing: does AB cross CD at their shared vertex?
function vertexCrossing(a, b, c, d) {
  if (equal(a, b) || equal(c, d)) return false;
  if (equal(a, c)) return equal(b, d) || orderedCCW(ortho(a), d, b, a);
  if (equal(b, d)) return orderedCCW(ortho(b), c, a, b);
  if (equal(a, d)) return equal(b, c) || orderedCCW(ortho(a), c, b, a);
  if (equal(b, c)) return orderedCCW(ortho(b), d, a, b);
  return false;
}

// Does AB cross CD, including at a shared vertex?
export function edgeOrVertexCrossing(a, b, c, d) {
  const s = crossingSign(a, b, c, d);
  return s < 0 ? false : s > 0 ? true : vertexCrossing(a, b, c, d);
}

// S2::Origin
const origin = cartesianNormalize([-0.0099994664350250197, 0.0025924542609324121, 0.99994664350250195]);

// S2Loop::Contains: the parity of crossings from the origin. Vertices are
// counterclockwise, without a closing vertex.
export function loopContains(vertices) {
  vertices = vertices.filter((v, i) => !equal(v, vertices[(i + 1) % vertices.length]));
  const n = vertices.length;
  if (n < 3) return () => false;
  function contains(p, inside) {
    // an edge whose ends are on the same side of origin → p cannot cross it
    const sides = vertices.map((v) => sign(origin, p, v));
    for (let i = 0; i < n; ++i) {
      const j = (i + 1) % n;
      if (sides[i] && sides[i] === sides[j]) continue;
      if (edgeOrVertexCrossing(origin, p, vertices[i], vertices[j])) inside = !inside;
    }
    return inside;
  }
  // is the origin inside? compare two ways of testing vertex 1
  const v1Inside = orderedCCW(ortho(vertices[1]), vertices[0], vertices[2], vertices[1]);
  const originInside = v1Inside !== contains(vertices[1], false);
  return (p) => contains(p, originInside);
}
