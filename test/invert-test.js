import {
  geoAirocean,
  geoCahillKeyes,
  geoComplexLog,
  geoCubic,
  geoDodecahedral,
  geoIcosahedral,
  geoImago,
  geoImagoBlock,
  geoTetrahedralLee,
} from "../src/index.js";
import { assertProjectionEqual } from "./asserts.js";

it("inverse polyhedrals", function () {
  [geoAirocean(), geoCubic(), geoIcosahedral(), geoDodecahedral()].forEach(
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
