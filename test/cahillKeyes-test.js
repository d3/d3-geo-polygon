import assert from "node:assert";
import {it} from "vitest";
import {range} from "d3-array";
import { geoCahillKeyes, geoCahillKeyesRaw } from "../src/index.js";

it("Cahill-Keyes is continuous at the 75th parallel", function () {
  const raw = geoCahillKeyesRaw(10000);
  const radians = Math.PI / 180;
  for (let lambda = -180; lambda <= 180; lambda += 2.5) {
    const a = raw(lambda * radians, 75 * radians);
    const b = raw(lambda * radians, (75 - 1e-9) * radians);
    assert(Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-3, `${lambda}: ${a} ${b}`);
  }
});

it("Cahill-Keyes raw scales with mg", function () {
  const raw = geoCahillKeyesRaw(10000);
  const raw1 = geoCahillKeyesRaw(1);
  const radians = Math.PI / 180;
  for (let y = -90; y <= 90; y += 2.5) {
    for (let x = -180; x <= 180; x += 2.5) {
      const a = raw(x * radians, y * radians);
      const b = raw1(x * radians, y * radians);
      assert(Math.hypot(a[0] - b[0] * 10000, a[1] - b[1] * 10000) < 1e-6, `[${x}, ${y}]: ${a} ${b}`);
    }
  }
});

it("Cahill-Keyes clips the edges of the octants where the layout opens", function () {
  // unrotated: the vertices are at the poles and at 0°, ±90° and 180° on the equator
  const projection = geoCahillKeyes().rotate([0, 0]).center([0, 0]).scale(1000).translate([0, 0]);
  const radians = Math.PI / 180;
  // the ends of the line after clipping
  const ends = (coordinates) => {
    const ends = [];
    let line;
    const stream = projection.preclip()({
      lineStart() { line = []; },
      point(x, y) { line.push([x / radians, y / radians]); },
      lineEnd() { ends.push(line[0], line[line.length - 1]); }
    });
    stream.lineStart();
    for (const [x, y] of coordinates) stream.point(x * radians, y * radians);
    stream.lineEnd();
    // not the ends of the line itself
    return ends.filter(([x, y]) => ![coordinates[0], coordinates[coordinates.length - 1]].some(([u, v]) => Math.hypot(u - x, v - y) < 1e-9));
  };
  // the distance in the plane between the two sides of the edge at p
  const gap = ([x, y], [dx, dy]) => {
    const a = projection([x - dx, y - dy]), b = projection([x + dx, y + dy]);
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  };
  for (const [coordinates, side, beyond] of [
    // the equator; beyond is towards the nearest vertex
    [range(-178.75, 180, 2.5).map((x) => [x, 0]), [0, 1e-6], ([x, y]) => [x + 0.05 * Math.sign(Math.round(x / 90) * 90 - x), y]],
    // the meridians between joined octants; beyond is towards the pole or the equator
    ...[[-90, 1], [90, 1], [0, -1]].map(([x, s]) => [range(1.25, 90, 2.5).map((y) => [x, s * y]), [1e-6, 0], ([x, y]) => [x, y + 0.05 * Math.sign(Math.round(y / 90) * 90 - y)]])
  ]) {
    const e = ends(coordinates);
    assert(e.length > 0);
    for (const p of e) {
      assert(gap(p, side) < 5, `the sides should meet at ${p}: ${gap(p, side)}`);
      assert(gap(beyond(p), side) > 100, `the sides should separate beyond ${p}: ${gap(beyond(p), side)}`);
    }
  }
});
