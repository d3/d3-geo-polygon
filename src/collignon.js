// code duplicated from d3-geo-projection
import {asin, pi, sin, sqrt, sqrtPi} from "./math.js";

export function collignonRaw(lambda, phi) {
  var alpha = sqrt(1 - sin(phi));
  return [(2 / sqrtPi) * lambda * alpha, sqrtPi * (1 - alpha)];
}

collignonRaw.invert = function(x, y) {
  var lambda = (lambda = y / sqrtPi - 1) * lambda;
  return [lambda > 0 ? x * sqrt(pi / lambda) / 2 : 0, asin(1 - lambda)];
};
