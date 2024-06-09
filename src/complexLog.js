/*
 * Complex logarithm projection
 *
 * Based on the following papers by Joachim Böttger et al.:
 * - Detail‐In‐Context Visualization for Satellite Imagery (2008) (https://doi.org/10.1111/j.1467-8659.2008.01156.x)
 * - Complex Logarithmic Views for Small Details in Large Contexts (2006) (https://doi.org/10.1109/TVCG.2006.126)
 *
 * Implemented for d3 by Matthias Albrecht and Jochen Görtler (2019)
 *
 */

import { geoProjectionMutator as projectionMutator, geoAzimuthalEqualAreaRaw as azimuthalEqualAreaRaw } from "d3-geo";
import { abs, sin, cos, pi, exp, atan2 } from "./math.js";
import { complexMul, complexLogHypot } from "./complex.js";
import { default as clipPolygon } from "./clip/polygon.js";

// Default planar projection and cutoff latitude, see below for an explanation of these settings.
const DEFAULT_PLANAR_PROJECTION_RAW = azimuthalEqualAreaRaw;
const DEFAULT_CUTOFF_LATITUDE = -0.05;

// Offset used to prevent logarithm of 0.
const CARTESIAN_OFFSET = 1e-10;

// Projection parameters for the default 960x500 projection area.
const DEFAULT_PROJECTION_PARAMS = {
  angle: 90,
  center: [0, 5.022570623227068],
  scale: 79.92959180396787,
  translate: [479.9999905630355, 250.35977064160338]
}

// Vertices of the clipping polygon in spherical coordinates.
// It contains the whole world except a small strip along longitude 0/180 crossing the south pole.
const CLIP_POLY_SPHERICAL = [
  [-180, -1e-4],
  [180, -1e-4],
  [1e-4, DEFAULT_CUTOFF_LATITUDE],
  [-1e-4, DEFAULT_CUTOFF_LATITUDE]
]

// Clipping polygon precision.
const N_SIDE = 5;    
const N_BOTTOM = 50; 


export function complexLogRaw(planarProjectionRaw = DEFAULT_PLANAR_PROJECTION_RAW) {
  function forward(lambda, phi) {
    // Project on plane.
    // Interpret projected point on complex plane.
    const azi1 = planarProjectionRaw(lambda, phi);

    // Rotate by -90 degrees in complex plane so the following complex log projection will be horizontally centered
    const aziComp = complexMul(azi1, [cos(-pi / 2), sin(-pi / 2)]);

    // Small offset to prevent logarithm of 0.
    if (aziComp[0] == 0 && aziComp[1] == 0) {
      aziComp[0] += CARTESIAN_OFFSET;
      aziComp[1] += CARTESIAN_OFFSET;
    }

    // Apply complex logarithm.
    return [complexLogHypot(aziComp[0], aziComp[1]), atan2(aziComp[1], aziComp[0])];
  }

  function invert(x, y) {
    // Inverse complex logarithm (complex exponential function).
    const inv1 = [exp(x) * cos(y), exp(x) * sin(y)];

    // Undo rotation.
    const invLogComp = complexMul(inv1, [cos(pi / 2), sin(pi / 2)]);

    // Invert azimuthal equal area.
    return planarProjectionRaw.invert(invLogComp[0], invLogComp[1]);
  }

  forward.invert = invert;
  return forward;
}


export default function(planarProjectionRaw = DEFAULT_PLANAR_PROJECTION_RAW, cutoffLatitude = DEFAULT_CUTOFF_LATITUDE) {
  const mutator = projectionMutator(complexLogRaw);
  const projection = mutator(planarProjectionRaw);

  // Projection used to project onto the complex plane.
  projection.planarProjectionRaw = function(_) {
    return arguments.length ? clipped(mutator(planarProjectionRaw = _)) : planarProjectionRaw;
  }

  // Latitude relative to the projection center at which to cutoff/clip the projection, lower values result in more detail around the projection center.
  // Value must be < 0 because complex log projects the origin to infinity.
  projection.cutoffLatitude = function(_) {
    return arguments.length ? (cutoffLatitude = _, clipped(mutator(planarProjectionRaw))) : cutoffLatitude;
  }

  function clipped(projection) {
    const angle = projection.angle();
    const scale = projection.scale();
    const center = projection.center();
    const translate = projection.translate();
    const rotate = projection.rotate();

    projection
      .angle(DEFAULT_PROJECTION_PARAMS.angle)
      .scale(1)
      .center([0, 0])
      .rotate([0, 0])
      .translate([0, 0])
      .preclip();

    // These are corner vertices of a rectangle in the projected complex log view.
    const topLeft = projection(CLIP_POLY_SPHERICAL[0]);
    const topRight = projection(CLIP_POLY_SPHERICAL[1]);
    const bottomRight = projection([CLIP_POLY_SPHERICAL[2][0], cutoffLatitude]);
    const bottomLeft = projection([CLIP_POLY_SPHERICAL[3][0], cutoffLatitude]);    
    const width = abs(topRight[0] - topLeft[0]);
    const height = abs(bottomRight[1] - topRight[1]);
    
    // Prevent overlapping polygons that result from paths that go from one side to the other, 
    // so cut along 180°/-180° degree line (left and right in complex log projected view).
    // This means cutting against a rectangular shaped polygon in the projected view.
    // The following generator produces a polygon that is shaped like this:
    //
    // Winding order: ==>
    //
    // ******************|
    // |                 |   
    // |                 |                        
    // |                 |                        
    // |                 |                       
    // |                 |                         
    // |------------------ 
    //
    // N_SIDE determines how many vertices to insert along the sides (marked as | above).
    // N_BOTTOM determines how many vertices to insert along the bottom (marked as - above).
    //
    // The resulting polygon vertices are back-projected to spherical coordinates.
    const polygon = {
        type: "Polygon",
        coordinates: [
            [
                topLeft,
                ...Array.from({length: N_SIDE}, (_, t) => [bottomRight[0], bottomRight[1] - height * (N_SIDE- t) / N_SIDE]),
                ...Array.from({length: N_BOTTOM}, (_, t) => [bottomRight[0] - width * t / N_BOTTOM, bottomRight[1]]),
                ...Array.from({length: N_SIDE}, (_, t) => [bottomLeft[0], bottomLeft[1] - height * t / N_SIDE]),
                topLeft
            ].map(point => projection.invert(point))
        ]
    };

    return projection
      .angle(angle)
      .scale(scale)
      .center(center)
      .translate(translate)
      .rotate(rotate)
      .preclip(clipPolygon(polygon));
  }

  // The following values are for the default 960x500 projection area
  return clipped(projection)
    .angle(DEFAULT_PROJECTION_PARAMS.angle)
    .center(DEFAULT_PROJECTION_PARAMS.center)
    .scale(DEFAULT_PROJECTION_PARAMS.scale)
    .translate(DEFAULT_PROJECTION_PARAMS.translate);
}
