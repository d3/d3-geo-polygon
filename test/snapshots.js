import { Canvas } from "canvas";
import { readFile } from "fs/promises";
import { feature } from "topojson-client";
import { geoGraticule, geoPath } from "d3-geo";
import {
  geoAirocean,
  geoCox,
  geoCahillKeyes,
  geoComplexLog,
  geoCubic,
  geoDeltoidalHexecontahedral,
  geoRhombicDodecahedral,
  geoDodecahedral,
  geoIcosahedral,
  geoImago,
  geoPolyhedralButterfly,
  geoPolyhedralCollignon,
  geoPolyhedralWaterman,
  geoTetrahedralLee,
} from "../src/index.js";

const width = 960;
const height = 500;

async function renderWorld(projection, { extent, clip = false } = {}) {
  const graticule = geoGraticule();
  const outline =
    extent === undefined
      ? { type: "Sphere" }
      : graticule.extent(extent).outline();
  const world = JSON.parse(
    await readFile("./node_modules/world-atlas/world/50m.json")
  );
  const canvas = new Canvas(width, height);
  const context = canvas.getContext("2d");
  const path = geoPath(projection, context);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
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

export async function deltoidalHexecontahedral() {
  return renderWorld(geoDeltoidalHexecontahedral().precision(0.1));
}

export async function rhombicDodecahedral() {
  return renderWorld(geoRhombicDodecahedral().precision(0.1));
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
      .fitSize([960, 500], { type: "Sphere" })
  );
}
