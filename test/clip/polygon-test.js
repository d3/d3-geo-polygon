import assert from "node:assert";
import {it} from "vitest";
import { geoClipPolygon } from "d3-geo-polygon";
import { geoEquirectangular, geoGnomonic, geoPath, geoStream } from "d3-geo";

// The exterior ring is clockwise and the hole counterclockwise, as required by
// the GeoJSON specification.
const outer = [[-20, -20], [-20, 20], [20, 20], [20, -20], [-20, -20]];
const hole = [[-5, -5], [5, -5], [5, 5], [-5, 5], [-5, -5]];
const holedPolygon = {type: "Polygon", coordinates: [outer, hole]};

it("clipPolygon clips line", () => {
  const clipPolygon = geoClipPolygon({
    type: "Polygon",
    coordinates: [
      [
        [-10, -10],
        [-10, 10],
        [10, 10],
        [10, -10],
        [-10, -10],
      ],
    ],
  });
  const projection = geoEquirectangular().clipAngle(10).preclip(clipPolygon);
  const path = geoPath().projection(projection);
  assert.deepStrictEqual(
    path({
      type: "LineString",
      coordinates: [
        [-20, 0],
        [20, 0],
      ],
    }),
    path({
      type: "LineString",
      coordinates: [
        [-10.5, 0],
        [10.5, 0],
      ],
    })
  );
});

it("clipPolygon interpolates when the intersections are on the same segment", function () {
  const clipPolygon = geoClipPolygon({
      type: "Polygon",
      coordinates: [
        [
          [-10, -11],
          [10, 10],
          [11, -10],
          [-10, -11],
        ],
      ],
    }),
    projection = geoEquirectangular().preclip(clipPolygon).precision(0.1),
    path = geoPath().projection(projection);
  assert.deepStrictEqual(
    path({
      type: "Polygon",
      coordinates: [
        [
          [0, -11],
          [1, -11],
          [1, -10],
          [0, -10],
          [0, -11],
        ],
      ],
    }).replace(/[.]\d+/g, ""),
    "M482,278L482,276L480,276L480,278L466,279L453,279L506,223L509,276L495,277Z"
  );
});

// the visible pieces of a line (in degrees)
function clipLine(polygon, coordinates) {
  const radians = Math.PI / 180, lines = [];
  const stream = geoClipPolygon(polygon)({
    lineStart() { lines.push([]); },
    point(x, y) { lines.at(-1).push([x / radians, y / radians]); },
    lineEnd() {}
  });
  stream.lineStart();
  for (const [x, y] of coordinates) stream.point(x * radians, y * radians);
  stream.lineEnd();
  return lines;
}

function assertPieces(lines, expected) {
  assert.strictEqual(lines.length, expected.length, JSON.stringify(lines));
  const ends = lines.map((line) => [line[0], line.at(-1)]).sort((a, b) => a[0][0] - b[0][0]);
  for (let i = 0; i < ends.length; ++i) {
    for (let j = 0; j < 2; ++j) {
      assert(Math.abs(ends[i][j][0] - expected[i][j][0]) < 1e-3 && Math.abs(ends[i][j][1] - expected[i][j][1]) < 0.05, JSON.stringify(ends));
    }
  }
}

const square = {type: "Polygon", coordinates: [[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]]};

it("clipPolygon clips a line with a polygon that crosses the antimeridian", () => {
  // vertices beyond 180°
  const polygon = {type: "Polygon", coordinates: [[[135, 24], [135, 54], [190, 54], [190, 24], [135, 24]]]};
  const parallel = Array.from({length: 145}, (_, i) => [-180 + 2.5 * i, 42]);
  assertPieces(clipLine(polygon, parallel), [[[-180, 42], [-170, 42]], [[135, 42], [180, 42]]]);
});

it("clipPolygon clips a line whose vertices are on the polygon’s edges", () => {
  assertPieces(clipLine(square, [[-5, 5], [0, 5], [5, 5], [15, 5]]), [[[0, 5], [10, 5]]]);
  assertPieces(clipLine(square, [[-5, 5], [5, 5], [10, 5], [15, 5]]), [[[0, 5], [10, 5]]]);
  assertPieces(clipLine(square, [[-5, 5], [0, 5], [5, 5], [10, 5], [15, 5]]), [[[0, 5], [10, 5]]]);
  assertPieces(clipLine(square, [[5, 5], [10, 5], [15, 5], [10, 6], [5, 6]]), [[[5, 5], [10, 5]], [[10, 6], [5, 6]]]);
});

it("clipPolygon clips a line whose vertices are the polygon’s vertices", () => {
  const polygon = {type: "Polygon", coordinates: [[[0, 0], [0, 5], [0, 10], [10, 10], [10, 5], [10, 0], [0, 0]]]};
  assertPieces(clipLine(polygon, [[-5, 5], [0, 5], [5, 5], [10, 5], [15, 5]]), [[[0, 5], [10, 5]]]);
  // touching a vertex from outside
  assertPieces(clipLine(polygon, [[15, 0], [10, 0], [15, -5]]), []);
});

it("clipPolygon clips graticule lines with a box whose edges go through their vertices", () => {
  // the parallel has vertices on the meridian edges
  const polygon = {type: "Polygon", coordinates: [[[0, -85], [0, -60], [90, -60], [90, -85], [0, -85]]]};
  const parallel = Array.from({length: 145}, (_, i) => [-180 + 2.5 * i, -80]);
  const lines = clipLine(polygon, parallel);
  assert.strictEqual(lines.length, 1, JSON.stringify(lines.map((line) => [line[0], line.at(-1)])));
  assert(Math.abs(lines[0][0][0]) < 1e-6 && Math.abs(lines[0].at(-1)[0] - 90) < 1e-6, JSON.stringify([lines[0][0], lines[0].at(-1)]));
});

it("clipPolygon clips a line along an edge of the polygon", () => {
  // a slit down to the equator, as in interrupted projections
  const e = 1e-7;
  const polygon = {type: "Polygon", coordinates: [[[-10, -10], [-10, 10], [-e, 10], [-e, 0], [e, 0], [e, 10], [10, 10], [10, -10], [-10, -10]]]};
  const lines = clipLine(polygon, [[-5, 0], [-2.5, 0], [0, 0], [2.5, 0], [5, 0]]);
  let visible = 0;
  for (const line of lines) visible += line.at(-1)[0] - line[0][0];
  assert(Math.abs(visible - 10) < 3 * e, JSON.stringify(lines));
});

it("clipPolygon removes holes from points, lines and polygons", () => {
  const projection = geoEquirectangular()
    .scale(180 / Math.PI).translate([0, 0]).precision(0)
    .preclip(geoClipPolygon(holedPolygon));
  const path = geoPath(projection);
  assert.strictEqual(path({type: "Point", coordinates: [0, 0]}), null);
  assert.notStrictEqual(path({type: "Point", coordinates: [10, 0]}), null);
  assert.strictEqual(path({type: "LineString", coordinates: [[-30, 0], [30, 0]]}), "M-20,0L-5,0M5,0L20,0");
  assert.strictEqual(path({type: "LineString", coordinates: [[-2, 0], [2, 0]]}), null);
  // a polygon wholly inside the hole disappears
  assert.strictEqual(path({type: "Polygon", coordinates: [[[-2, -2], [-2, 2], [2, 2], [2, -2], [-2, -2]]]}), null);
});

it("clipPolygon keeps a polygon that contains the whole clipping region", () => {
  const projection = geoEquirectangular()
    .scale(180 / Math.PI).translate([0, 0]).precision(0)
    .preclip(geoClipPolygon(holedPolygon));
  const path = geoPath(projection);
  // the clipped subject is the region itself, hole included
  assert.strictEqual(
    path({type: "Polygon", coordinates: [[[-30, -30], [-30, 30], [30, 30], [30, -30], [-30, -30]]]}),
    "M-20,20L-20,-20L20,-20L20,20ZM-5,5L5,5L5,-5L-5,-5Z"
  );
});

it("clipPolygon handles several holes", () => {
  // both holes are wound counterclockwise, as required by the GeoJSON specification
  const second = [[10, -5], [15, -5], [15, 5], [10, 5], [10, -5]];
  const path = geoPath(geoEquirectangular().scale(180 / Math.PI).translate([0, 0]).precision(0)
    .preclip(geoClipPolygon({type: "Polygon", coordinates: [outer, hole, second]})));
  assert.strictEqual(path({type: "LineString", coordinates: [[-30, 0], [30, 0]]}), "M-20,0L-5,0M5,0L10,0M15,0L20,0");
  assert.strictEqual(path({type: "Point", coordinates: [12.5, 0]}), null);
  assert.notStrictEqual(path({type: "Point", coordinates: [7.5, 0]}), null);
});

it("clipPolygon cuts at the holes’ edges when the projection is rotated", () => {
  const projection = geoEquirectangular()
    .scale(180 / Math.PI).translate([0, 0]).precision(0)
    .preclip(geoClipPolygon(holedPolygon));
  const path = geoPath(projection);
  projection.rotate([30, 0]);
  assert.strictEqual(path({type: "LineString", coordinates: [[-60, 0], [0, 0]]}), "M-20,0L-5,0M5,0L20,0");
  // clipPoint(false) stops clipping points, but lines are still cut by the holes
  projection.preclip(projection.preclip().clipPoint(false));
  assert(path({type: "Point", coordinates: [-30, 0]}));
  assert.strictEqual(path({type: "LineString", coordinates: [[-60, 0], [0, 0]]}), "M-20,0L-5,0M5,0L20,0");
});

it("clipPolygon intersects polygon rings with multiple holes", () => {
  // Gnomonic coordinates turn great-circle arcs into straight lines. These
  // rectangles therefore have an independent analytic intersection-area oracle.
  function ring([x0, y0, x1, y1]) {
    return [[x0, y0], [x0, y1], [x1, y1], [x1, y0], [x0, y0]].map(([x, y]) => [
      Math.atan(x) * 180 / Math.PI,
      Math.atan(y / Math.sqrt(1 + x * x)) * 180 / Math.PI
    ]);
  }
  function overlap(a, b) {
    return Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]))
      * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  }
  const exterior = [-1, -1, 1, 1];
  const holes = [[-.4, -.3, -.1, .3], [.2, -.2, .5, .2]];
  const geometry = {type: "Polygon", coordinates: [ring(exterior), ...holes.map(h => ring(h).reverse())]};
  const path = geoPath(geoGnomonic().scale(1).translate([0, 0]).precision(0).preclip(geoClipPolygon(geometry)));
  for (const rectangle of [
    [-2, -2, 2, 2], [-.8, -.8, .8, .8], [-.8, -.1, .8, .1],
    [-.3, -.1, -.2, .1], [1.2, 1.2, 1.5, 1.5],
    [-1.2, -.5, 0, .5], [-.25, -.5, .35, .5], [-.8, .5, .8, .8]
  ]) {
    const expected = overlap(rectangle, exterior) - holes.reduce((sum, h) => sum + overlap(rectangle, h), 0);
    const actual = path.area({type: "Polygon", coordinates: [ring(rectangle)]});
    assert(Math.abs(actual - expected) < 1e-8, `${rectangle}: ${actual} != ${expected}`);
  }
});

it("clipPolygon preserves holes in MultiPolygon clipping regions", () => {
  const geometry = {type: "MultiPolygon", coordinates: [
    [outer, hole],
    [[[30, -10], [30, 10], [40, 10], [40, -10], [30, -10]]]
  ]};
  const path = geoPath(geoEquirectangular().scale(180 / Math.PI).translate([0, 0]).precision(0).preclip(geoClipPolygon(geometry)));
  assert.strictEqual(path({type: "LineString", coordinates: [[-30, 0], [50, 0]]}), "M-20,0L-5,0M5,0L20,0M30,0L40,0");
});

it("clipPolygon emits balanced polygons and implicitly closed rings", () => {
  const projection = geoEquirectangular().preclip(geoClipPolygon(holedPolygon));
  for (const geometry of [{type: "Sphere"}, {type: "Polygon", coordinates: [
    [[-30, -30], [-30, 30], [30, 30], [30, -30], [-30, -30]]
  ]}]) {
    let depth = 0, rings = 0, points;
    geoStream(geometry, projection.stream({
      polygonStart() { assert.strictEqual(depth++, 0); },
      polygonEnd() { assert.strictEqual(--depth, 0); },
      lineStart() { assert.strictEqual(depth, 1); ++rings; points = []; },
      lineEnd() { assert.notDeepStrictEqual(points[0], points[points.length - 1]); },
      point(x, y) { points.push([x, y]); }
    }));
    assert.strictEqual(depth, 0);
    assert.strictEqual(rings, 2);
  }
});

it("clipPolygon without holes is unchanged", () => {
  const path = geoPath(geoEquirectangular().scale(180 / Math.PI).translate([0, 0]).precision(0)
    .preclip(geoClipPolygon({type: "Polygon", coordinates: [outer]})));
  // the interior of the region is entirely visible
  assert.strictEqual(path({type: "LineString", coordinates: [[-30, 0], [30, 0]]}), "M-20,0L20,0");
  assert.strictEqual(path({type: "Point", coordinates: [30, 0]}), null);
  assert.notStrictEqual(path({type: "Point", coordinates: [0, 0]}), null);
  // and a subject polygon strictly inside keeps its area
  assert.strictEqual(path.area({type: "Polygon", coordinates: [[[-10, -10], [-10, 10], [10, 10], [10, -10], [-10, -10]]]}), 400);
});
