import assert from "assert";
import { geoDistance } from "d3-geo";
import {
  geoAirocean,
  geoCahillKeyes,
  geoComplexLog,
  geoCubic,
  geoDodecahedral,
  geoIcosahedral,
  geoImago,
  geoImagoBlock,
  geoPolyhedralButterfly,
  geoPolyhedralCollignon,
  geoPolyhedralWaterman,
  geoRhombic,
  geoTetrahedralLee,
} from "../src/index.js";
import { assertProjectionEqual } from "./asserts.js";

function assertInverseGrid(projection, step, offset = 0, delta = 1e-6) {
  for (let y = -90 + offset; y <= 90; y += step) {
    for (let x = -180 + offset; x <= 180; x += step) {
      const p = projection.invert(projection([x, y]));
      assert(p && geoDistance(p, [x, y]) < delta, `[${x}, ${y}] inverts to ${p}`);
    }
  }
}

it("inverse polyhedrals", function () {
  [geoAirocean(), geoCubic(), geoIcosahedral(), geoDodecahedral(), geoPolyhedralCollignon()].forEach(
    function (projection) {
      [
        [-23, 12],
        [10, 10],
        [100, -45],
      ].forEach(function (location) {
        projection.angle(Math.random() * 360);
        assertProjectionEqual(projection, location, projection(location), 1e-5);
      });
    }
  );
});

it("inverse Collignon, inside the faces", function () {
  assertInverseGrid(geoPolyhedralCollignon(), 2.5, 1.25);
});

it("inverse airocean, precision", function () {
  assertInverseGrid(geoAirocean(), 5, 2.5, 1e-10);
});

it("inverse polyhedrals, on the edges of the faces", function () {
  [
    geoCubic(),
    geoIcosahedral(),
    geoPolyhedralButterfly(),
    geoPolyhedralCollignon(),
    geoPolyhedralWaterman(),
    geoRhombic(),
  ].forEach((projection) => assertInverseGrid(projection, 5));
});

it("inverse Imago, tetrahedralLee", function () {
  [geoImago(), geoImagoBlock(), geoTetrahedralLee()].forEach(function (
    projection
  ) {
    [
      [-23, 12],
      [10, 10],
      [100, -45],
    ].forEach(function (location) {
      projection.angle(Math.random() * 360);
      assertProjectionEqual(projection, location, projection(location), 1e-5);
    });
  });
});

it("inverse Cahill-Keyes", function () {
  [geoCahillKeyes()].forEach(function (projection) {
    [
      [-23, 12],
      [10, 10],
      [100, -45],
    ].forEach(function (location) {
      projection.angle(Math.random() * 360);
      assertProjectionEqual(projection, location, projection(location), 1e-5);
    });
  });
});

it("inverse complex log", function () {
  [geoComplexLog()].forEach(function (projection) {
    [
      [0, 0],
      [-23, 12],
      [10, 10],
      [100, -45],
    ].forEach(function (location) {
      projection.angle(Math.random() * 360);
      assertProjectionEqual(projection, location, projection(location), 1e-5);
    });
  });
});
