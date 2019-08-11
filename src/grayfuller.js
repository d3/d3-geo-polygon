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
import { abs, atan2, cos, epsilon, sin, sqrt } from "./math.js";
import { geoGnomonicRaw as gnomonicRaw } from "d3-geo";

export default function GrayFullerRaw() {
  var SQRT_3 = sqrt(3);

  // Gray’s constants
  var Z = sqrt(5 + 2 * sqrt(5)) / sqrt(15),
    el = sqrt(8) / sqrt(5 + sqrt(5)),
    dve = sqrt(3 + sqrt(5)) / sqrt(5 + sqrt(5));

  var grayfuller = function(lambda, phi) {
    var cosPhi = cos(phi),
      s = Z / (cosPhi * cos(lambda)),
      x = cosPhi * sin(lambda) * s,
      y = sin(phi) * s,
      a1p = atan2(2 * y / SQRT_3 + el / 3 - el / 2, dve),
      a2p = atan2(x - y / SQRT_3 + el / 3 - el / 2, dve),
      a3p = atan2(el / 3 - x - y / SQRT_3 - el / 2, dve);

    return [SQRT_3 * (a2p - a3p), 2 * a1p - a2p - a3p];
  };

  // Inverse approximation
  grayfuller.invert = function(x, y) {
    // if the point is out of the triangle, return
    // something meaningless (but far away enough)
    if (x * x + y * y > 5) return [0, 3];

    var R = 2.9309936378128416,
      p = gnomonicRaw.invert(x / R, y / R);

    var j = 0;
    do {
      var f = grayfuller(p[0], p[1]),
        dx = x - f[0],
        dy = y - f[1];
      p[0] += 0.2 * dx;
      p[1] += 0.2 * dy;
    } while (j++ < 30 && abs(dx) + abs(dy) > epsilon);

    return p;
  };

  return grayfuller;
}
