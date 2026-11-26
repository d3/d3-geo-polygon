/*
 * Buckminster Fuller’s spherical triangle transformation procedure
 *
 * Based on Robert W. Gray’s formulae published in “Exact Transformation Equations
 * For Fuller's World Map,” _Cartographica_, 32(3): 17-25 (1995).
 *
 * Implemented for D3.js by Philippe Rivière, 2018 (https://visionscarto.net/)
 *
 * To the extent possible under law, Philippe Rivière has waived all copyright
 * and related or neighboring rights to this implementation. (Public Domain.)
 */
import { atan2, cos, sin, sqrt } from "./math.js";
import { geoGnomonicRaw as gnomonicRaw } from "d3-geo";
import { solve2d } from "./newton.js";

export default function GrayFullerRaw() {
  const SQRT_3 = sqrt(3);

  // Gray’s constants
  const Z = sqrt(5 + 2 * sqrt(5)) / sqrt(15);
  const el = sqrt(8) / sqrt(5 + sqrt(5));
  const dve = sqrt(3 + sqrt(5)) / sqrt(5 + sqrt(5));

  const grayfuller = function(lambda, phi) {
    const cosPhi = cos(phi),
      s = Z / (cosPhi * cos(lambda)),
      x = cosPhi * sin(lambda) * s,
      y = sin(phi) * s,
      a1p = atan2(2 * y / SQRT_3 + el / 3 - el / 2, dve),
      a2p = atan2(x - y / SQRT_3 + el / 3 - el / 2, dve),
      a3p = atan2(el / 3 - x - y / SQRT_3 - el / 2, dve);

    return [SQRT_3 * (a2p - a3p), 2 * a1p - a2p - a3p];
  };

  // Inverse approximation
  const solver = solve2d(grayfuller);
  grayfuller.invert = function(x, y) {
    // if the point is out of the triangle, return
    // something meaningless (but far away enough)
    if (x * x + y * y > 5) return [0, 3];

    const R = 2.9309936378128416;
    const p = gnomonicRaw.invert(x / R, y / R);
    return solver(x, y, p[0], p[1]);
  };

  return grayfuller;
}
