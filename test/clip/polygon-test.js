import assert from "assert";
import * as d3 from "../../src/index.js";
import {geoEquirectangular, geoPath} from "d3-geo";

it("clipPolygon clips line", () => {
  const clipPolygon = d3.geoClipPolygon({ type: "Polygon", coordinates: [[[-10, -10], [-10, 10], [10, 10], [10, -10], [-10, -10]]] });
  const projection = geoEquirectangular().clipAngle(10).preclip(clipPolygon);
  const path = geoPath()
    .projection(projection);
  assert.strictEqual(path({type:"LineString", coordinates:[[-20,0], [20,0]]}), path({type:"LineString", coordinates:[[-10.5,0], [10.5,0]]}));
});


it("clipPolygon interpolates when the intersections are on the same segment", () => {
  const clipPolygon = d3.geoClipPolygon({
    type: "Polygon",
    coordinates: [[[-10, -11], [10, 10], [11, -10], [-10, -11]]]
  }),
    projection = geoEquirectangular().preclip(clipPolygon).precision(0.1),
    path = geoPath().projection(projection);
  assert.strictEqual(path({
    type: "Polygon",
    coordinates: [[[0, -11], [1, -11], [1, -10], [0, -10], [0, -11]]]
  }).replace(/[.]\d+/g, ""),
  "M482,278L482,276L480,276L480,278L466,279L453,279L506,223L509,276L495,277Z");
});
