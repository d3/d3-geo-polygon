import {merge, range} from "d3-array";
import {geoInterpolate, geoPath} from "d3-geo";
import {
  geoBerghaus as berghaus,
  geoGingery as gingery,
  geoHealpix as healpix,
  geoInterrupt as interrupt,
  geoInterruptedBoggs as interruptedBoggs,
  geoInterruptedHomolosine as interruptedHomolosine,
  geoInterruptedMollweide as interruptedMollweide,
  geoInterruptedMollweideHemispheres as interruptedMollweideHemispheres,
  geoInterruptedSinuMollweide as interruptedSinuMollweide,
  geoInterruptedSinusoidal as interruptedSinusoidal,
} from "d3-geo-projection";
import geoClipPolygon from "./clip/polygon.js"

/**
 * Reclip projections from d3-geo-projection
 */
export function geoBerghaus() { return reclip(berghaus.apply(this, arguments)); }
export function geoGingery() { return reclip(gingery.apply(this, arguments)); }
export function geoHealpix() {return clipInterrupted(healpix.apply(this, arguments)); }
export function geoInterrupt() { return clipInterrupted(interrupt.apply(this, arguments)); }
export function geoInterruptedBoggs() { return clipInterrupted(interruptedBoggs.apply(this, arguments)); }
export function geoInterruptedHomolosine() {return clipInterrupted(interruptedHomolosine.apply(this, arguments)); }
export function geoInterruptedMollweide() {return clipInterrupted(interruptedMollweide.apply(this, arguments)); }
export function geoInterruptedMollweideHemispheres() {return clipInterrupted(interruptedMollweideHemispheres.apply(this, arguments)); }
export function geoInterruptedSinuMollweide() {return clipInterrupted(interruptedSinuMollweide.apply(this, arguments)); }
export function geoInterruptedSinusoidal() {return clipInterrupted(interruptedSinusoidal.apply(this, arguments)); }

function reclip(projection) {
  const rotate = projection.rotate();
  const scale = projection.scale();
  const translate = projection.translate();
  projection.rotate([0, 0]).translate([0, 0]);
  const sph = geoPath(projection).digits(12)({ type: "Sphere" });
  projection.scale(scale * 1.0001);
  const points = Array.from(
    sph.matchAll(/(-?\d+(?:[.]\d+)?),(-?\d+(?:[.]\d+)?)/g),
    ([, x, y]) => projection.invert([x, y])
  );
  return projection
    .preclip(geoClipPolygon({type: "Polygon", coordinates: [[...points, points[0]]]}))
    .scale(scale)
    .translate(translate)
    .rotate(rotate);
}

function clipInterrupted(projection) {
  let l = projection.lobes?.();

  // Special treatment for HEALpix
  if (typeof l === "number") {
    const hp = 41 + 48 / 36 + 37 / 3600; // healpixParallel, for K=3
    const step = 360 / (l + 1e-10);
    l = [
      range(l).map((i) => [
        [-180 + i * step, hp],
        [-180 + ((2 * i + 1) / 2) * step, 90],
        [-180 + (i + 1) * step, hp]
      ]),
      range(l).map((i) => [
        [-180 + i * step, -hp],
        [-180 + ((2 * i + 1) / 2) * step, -90],
        [-180 + (i + 1) * step, -hp]
      ])
    ];
  }
  if (!Array.isArray(l)) return projection;

  const polygon = merge(
    Array.from(l, (d, i) => {
      const hemisphere = d.flatMap(
        (q) => Array.from(q, (p) => geoInterpolate(p, [q[1][0], 0])(1e-9)) // pull inside each lobe
      );
      return i === 1
        ? // south
          hemisphere.reverse()
        : hemisphere;
    })
  );
  return projection.preclip(geoClipPolygon({type: "Polygon", coordinates: [[...polygon, polygon[0]]]}));
}