import {
  geoCentroid as centroid,
  geoGnomonic as gnomonic,
  geoDistance
} from "d3-geo";
import { degrees } from "../math.js";
import polyhedral from "./index.js";

// it is possible to pass a specific projection on each face
// by default is is a gnomonic projection centered on the face's centroid
// scale 1 by convention
const faceProjection0 = (face) => gnomonic()
  .scale(1)
  .translate([0, 0])
  .rotate([
    Math.abs(face.site[1]) > 89.99999999 ? 0 : -face.site[0],
    -face.site[1]
  ]);

export default function(
  parents = [],
  polygons = { features: [] },
  faceProjection = faceProjection0,
  find
) {
  if (find === undefined) find = find0;
  let faces = [];
  function build_tree() {
    // the faces from the polyhedron each yield
    // - face: its vertices
    // - site: its voronoi site (default: centroid)
    // - project: local projection on this face
    faces = polygons.features.map((feature, i) => {
      const polygon = feature.geometry.coordinates[0];
      const face = polygon.slice(0, -1);
      face.site =
        feature.properties && feature.properties.sitecoordinates
          ? feature.properties.sitecoordinates
          : centroid(feature.geometry);
      return {
        face,
        site: face.site,
        id: i,
        project: faceProjection(face)
      };
    });

    // Build a tree of the faces, starting with face 0 (North Pole)
    // which has no parent (-1)
    parents.forEach((d, i) => {
      const node = faces[d];
      node && (node.children || (node.children = [])).push(faces[i]);
    });
  }

  // a basic function to find the polygon that contains the point
  function find0(lambda, phi) {
    let d0 = Infinity;
    let found = -1;
    for (let i = 0; i < faces.length; i++) {
      const d = geoDistance(faces[i].site, [lambda, phi]);
      if (d < d0) {
        d0 = d;
        found = i;
      }
    }
    return found;
  }
  
  function faceFind(lambda, phi) {
    return faces[find(lambda * degrees, phi * degrees)];
  }

  let p = gnomonic();

  function reset() {
    let rotate = p.rotate(),
      translate = p.translate(),
      center = p.center(),
      scale = p.scale(),
      angle = p.angle();

    if (faces.length) {
      p = polyhedral(faces.find((face, i) => face && !faces[parents[i]]), faceFind);
    }

    p.parents = function(_) {
      if (!arguments.length) return parents;
      parents = _;
      build_tree();
      return reset();
    };

    p.polygons = function(_) {
      if (!arguments.length) return polygons;
      polygons = _;
      build_tree();
      return reset();
    };

    p.faceProjection = function(_) {
      if (!arguments.length) return faceProjection;
      faceProjection = _;
      build_tree();
      return reset();
    };

    p.faceFind = function(_) {
      if (!arguments.length) return find;
      find = _;
      return reset();
    };

    return p
      .rotate(rotate)
      .translate(translate)
      .center(center)
      .scale(scale)
      .angle(angle);
  }

  build_tree();
  return reset();
}
