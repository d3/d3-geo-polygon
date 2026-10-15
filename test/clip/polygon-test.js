import assert from "assert";
import { geoClipPolygon } from "../../src/index.js";
import { geoEquirectangular, geoGnomonic, geoPath, geoStream } from "d3-geo";

const outer = [[-20, -20], [-20, 20], [20, 20], [20, -20], [-20, -20]];
const hole = [[-5, -5], [5, -5], [5, 5], [-5, 5], [-5, -5]];
const holedPolygon = {type: "Polygon", coordinates: [outer, hole]};

it("clipPolygon removes holes from lines as well as points", () => {
  const projection = geoEquirectangular()
    .scale(180 / Math.PI).translate([0, 0]).precision(0)
    .preclip(geoClipPolygon(holedPolygon));
  const path = geoPath(projection);
  assert.strictEqual(path({type: "Point", coordinates: [0, 0]}), null);
  assert.strictEqual(path({type: "LineString", coordinates: [[-30, 0], [30, 0]]}), "M-20,0L-5,0M5,0L20,0");
  assert.strictEqual(path({type: "LineString", coordinates: [[-2, 0], [2, 0]]}), null);
  projection.rotate([30, 0]);
  assert.strictEqual(path({type: "LineString", coordinates: [[-60, 0], [0, 0]]}), "M-20,0L-5,0M5,0L20,0");
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
    [[ [30, -10], [30, 10], [40, 10], [40, -10], [30, -10] ]]
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
