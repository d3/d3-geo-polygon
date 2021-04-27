import * as d3 from "../src/index.js";
import {assertProjectionEqual} from "./asserts.js";

it("inverse polyhedrals", () => {

  [ d3.geoAirocean(), d3.geoCubic(), d3.geoIcosahedral(), d3.geoDodecahedral() ]
  .forEach(function(projection) {
    [ [-23, 12], [10,10], [100,-45] ]
    .forEach(function(location) {
      projection.angle(Math.random()*360);
      assertProjectionEqual(projection, location, projection(location), 1e-5);
    });
  });
});

it("inverse Imago, tetrahedralLee", () => {

  [ d3.geoImago(), d3.geoImagoBlock(), d3.geoTetrahedralLee() ]
  .forEach(function(projection) {
    [ [-23, 12], [10,10], [100,-45] ]
    .forEach(function(location) {
      projection.angle(Math.random()*360);
      assertProjectionEqual(projection, location, projection(location), 1e-5);
    });
  });
});

it("inverse Cahill-Keyes", () => {

  [ d3.geoCahillKeyes() ]
  .forEach(function(projection) {
    [ [-23, 12], [10,10], [100,-45] ]
    .forEach(function(location) {
      projection.angle(Math.random()*360);
      assertProjectionEqual(projection, location, projection(location), 1e-5);
    });
  });
});

it("inverse complex log", () => {

  [ d3.geoComplexLog() ]
  .forEach(function(projection) {
    [ [0, 0], [-23, 12], [10,10], [100,-45] ]
    .forEach(function(location) {
      projection.angle(Math.random()*360);
      assertProjectionEqual(projection, location, projection(location), 1e-5);
    });
  });
});

