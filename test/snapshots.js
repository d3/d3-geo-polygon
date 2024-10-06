import { Canvas } from "canvas";
import { readFile } from "fs/promises";
import { feature } from "topojson-client";
import { geoGraticule, geoPath } from "d3-geo";
import { geoHomolosineRaw } from "d3-geo-projection";
import {
  geoAirocean,
  geoBerghaus,
  geoClipPolygon,
  geoCox,
  geoCahillKeyes,
  geoComplexLog,
  geoCubic,
  geoDeltoidal,
  geoGingery,
  geoHealpix,
  geoInterrupt,
  geoInterruptedBoggs,
  geoInterruptedHomolosine,
  geoInterruptedMollweide,
  geoInterruptedMollweideHemispheres,
  geoInterruptedSinuMollweide,
  geoInterruptedSinusoidal,
  geoRhombic,
  geoDodecahedral,
  geoIcosahedral,
  geoImago,
  geoPolyhedralButterfly,
  geoPolyhedralCollignon,
  geoPolyhedralWaterman,
  geoTetrahedralLee,
  geoTwoPointEquidistantUsa
} from "../src/index.js";

const width = 960;
const height = 500;

async function renderWorld(projection, { points, extent, clip = false } = {}) {
  const graticule = geoGraticule();
  const outline =
    extent === undefined
      ? { type: "Sphere" }
      : graticule.extent(extent).outline();
  const world = JSON.parse(
    await readFile("./node_modules/world-atlas/land-50m.json")
  );
  const canvas = new Canvas(width, height);
  const context = canvas.getContext("2d");
  const path = geoPath(projection, context);
  context.fillStyle = "#fff";
  context.beginPath();
  path(outline);
  context.fill();
  context.save();
  if (clip) {
    context.beginPath();
    path(outline);
    context.clip();
  }
  context.beginPath();
  path(feature(world, world.objects.land));
  context.fillStyle = "#000";
  context.fill();
  context.beginPath();
  path(graticule());
  context.strokeStyle = "rgba(119,119,119,0.5)";
  context.stroke();
  context.restore();
  context.beginPath();
  path(outline);
  context.strokeStyle = "#000";
  context.stroke();
  if (points) {
    context.beginPath();
    path({type: "MultiPoint", coordinates: points});
    context.fillStyle = "steelblue";
    context.fill();
  }
  return canvas;
}

export async function airocean() {
  return renderWorld(geoAirocean().precision(0.1));
}

export async function cox() {
  return renderWorld(geoCox().precision(0.1));
}

export async function cahillKeyes() {
  return renderWorld(geoCahillKeyes().precision(0.1));
}

export async function complexLog() {
  return renderWorld(geoComplexLog().precision(0.1));
}

export async function cubic() {
  return renderWorld(geoCubic().precision(0.1));
}

export async function dodecahedral() {
  return renderWorld(geoDodecahedral().precision(0.1));
}

export async function icosahedral() {
  return renderWorld(geoIcosahedral().precision(0.1));
}

export async function imago() {
  return renderWorld(geoImago().precision(0.1));
}

export async function polyhedralButterfly() {
  return renderWorld(geoPolyhedralButterfly().precision(0.1));
}

export async function polyhedralCollignon() {
  return renderWorld(geoPolyhedralCollignon().precision(0.1));
}

export async function polyhedralWaterman() {
  return renderWorld(geoPolyhedralWaterman().precision(0.1));
}

export async function deltoidal() {
  return renderWorld(geoDeltoidal().precision(0.1));
}

export async function rhombic() {
  return renderWorld(geoRhombic().precision(0.1));
}

export async function tetrahedralLee() {
  return renderWorld(geoTetrahedralLee().precision(0.1));
}

export async function tetrahedralLeeSouth() {
  return renderWorld(
    geoTetrahedralLee()
      .rotate([-30, 0])
      .angle(-30)
      .precision(0.1)
      .fitSize([width, height], { type: "Sphere" })
  );
}

// reclip
export async function berghaus() {
  return renderWorld(geoBerghaus());
}

export async function gingery() {
  return renderWorld(geoGingery());
}

export async function berghaus7() {
  return renderWorld(geoBerghaus().lobes(7).fitSize([width, height], { type: "Sphere" }));
}

export async function berghaus13() {
  return renderWorld(geoBerghaus().lobes(13).fitSize([width, height], { type: "Sphere" }));
}

export async function gingery7() {
  return renderWorld(geoGingery().lobes(7).fitSize([width, height], { type: "Sphere" }));
}

export async function gingery3() {
  return renderWorld(geoGingery().lobes(3).fitSize([width, height], { type: "Sphere" }));
}

export async function goodeOcean() {
  return renderWorld(
    geoInterrupt(geoHomolosineRaw, [
      [
        [
          [-180, 0],
          [-130, 90],
          [-95, 0],
        ],
        [
          [-95, 0],
          [-30, 90],
          [55, 0],
        ],
        [
          [55, 0],
          [120, 90],
          [180, 0],
        ],
      ],
      [
        [
          [-180, 0],
          [-120, -90],
          [-60, 0],
        ],
        [
          [-60, 0],
          [20, -90],
          [85, 0],
        ],
        [
          [85, 0],
          [140, -90],
          [180, 0],
        ],
      ],
    ])
      .rotate([-204, 0])
      .precision(0.1)
  );
}

export async function interruptedBoggs() {
  return renderWorld(geoInterruptedBoggs());
}

export async function healpix() {
  return renderWorld(geoHealpix());
}

export async function healpix5() {
  return renderWorld(geoHealpix().lobes(5));
}

export async function interruptedHomolosine() {
  return renderWorld(geoInterruptedHomolosine());
}

export async function interruptedMollweide() {
  return renderWorld(geoInterruptedMollweide());
}

export async function interruptedMollweideHemispheres() {
  return renderWorld(geoInterruptedMollweideHemispheres());
}

export async function interruptedSinuMollweide() {
  return renderWorld(geoInterruptedSinuMollweide());
}

export async function interruptedSinusoidal() {
  return renderWorld(geoInterruptedSinusoidal());
}

// https://github.com/d3/d3-geo/issues/46
export async function twoPointEquidistantUsa() {
  return renderWorld(
    geoTwoPointEquidistantUsa().fitSize([width, height], { type: "Sphere" })
  );
}

// more tests

// https://github.com/d3/d3-geo-polygon/issues/7
export async function cubic45() {
  return renderWorld(
    geoCubic()
      .parents([-1, 2, 0, 2, 5, 2])
      .rotate([0, 0, 45])
      .fitSize([width, height], { type: "Sphere" })
  );
}

// https://github.com/d3/d3-geo-polygon/issues/30
export async function airocean702() {
  return renderWorld(geoAirocean().rotate([-70.2, -47, -121.6]));
}

// https://github.com/d3/d3-geo-polygon/issues/30
export async function airocean732() {
  return renderWorld(geoAirocean().rotate([88, -37.8, -73.2]));
}

export async function rhombic00() {
  return renderWorld(geoRhombic().rotate([0, 0]).precision(0.1));
}

// https://github.com/d3/d3-geo-polygon/issues/62
export async function rhombicHalf1() {
  return renderWorld(
    geoRhombic()
      .parents([-1, 0, 6, 2, 1, 9, 11, 3, 4, 8, 6, 10])
      .precision(0.1)
      .fitSize([width, height], { type: "Sphere" })
  );
}
export async function rhombicHalf2() {
  return renderWorld(
    geoRhombic()
      .parents([4, 0, 6, 2, 1, 9, 11, 3, 4, 8, -1, 10])
      .angle(-19.5)
      .precision(0.1)
      .fitSize([width, height], { type: "Sphere" })
  );
}

// https://github.com/d3/d3-geo-polygon/issues/4
export async function clipPointWorld() {
  return renderWorld(geoRhombic(), {points: [
    [0, 0],
    [10 - 0.0001, 0],
    [10 + 0.0001, 0],
    [10, -10],
    [10, -20],
  ]});
}
export async function clipPointTrue() {
  const projection = geoRhombic();
  const polygon = projection.preclip().polygon();
  projection.preclip(geoClipPolygon(polygon).clipPoint(true));
  return renderWorld(projection, {points: [
    [0, 0],
    [10 - 0.0001, 0],
    [10 + 0.0001, 0],
    [10, -10],
    [10, -20],
  ]});
}
export async function clipPointSmall() {
  const projection = geoRhombic().parents([-1, 0, 6, 2, 1, 9, 11, 3, 4, 8, 6, 10]);
  return renderWorld(projection, {points: [
    [0, 0],
    [10 - 0.0001, 0],
    [10 + 0.0001, 0],
    [10, -10],
    [10, -20],
  ]});
}
export async function clipPointFalse() {
  const projection = geoRhombic();
  projection.preclip(geoClipPolygon(
    geoRhombic().parents([-1, 0, 6, 2, 1, 9, 11, 3, 4, 8, 6, 10]).preclip().polygon()).clipPoint(false)
  );
  return renderWorld(projection, {points: [
    [0, 0],
    [10 - 0.0001, 0],
    [10 + 0.0001, 0],
    [10, -10],
    [10, -20],
  ]});
}
