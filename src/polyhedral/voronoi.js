import {
  geoCentroid as centroid,
  geoGnomonic as gnomonic,
  geoDistance as distance
} from "d3-geo";
import { degrees } from "../math";
import polyhedral from "./index";

export default function(parents, polygons, faceProjection, find) {
  parents = parents || [];
  polygons = polygons || { features: [] };
  find = find || find0;

  // it is possible to pass a specific projection on each face
  // by default is is a gnomonic projection centered on the face's centroid
  // scale 1 by convention
  faceProjection =
    faceProjection ||
    function(face) {
      return gnomonic()
        .scale(1)
        .translate([0, 0])
        .rotate([-face.site[0], -face.site[1]]);
    };

  var faces = [];
  function build_tree() {
    // the faces from the polyhedron each yield
    // - face: its vertices
    // - site: its voronoi site (default: centroid)
    // - project: local projection on this face
    faces = polygons.features.map(function(feature, i) {
      var polygon = feature.geometry.coordinates[0];
      var face = polygon.slice(0, -1);
      face.site =
        feature.properties && feature.properties.sitecoordinates
          ? feature.properties.sitecoordinates
          : centroid(feature.geometry);
      return {
        face: face,
        site: face.site,
        id: i,
        project: faceProjection(face)
      };
    });

    // Build a tree of the faces, starting with face 0 (North Pole)
    // which has no parent (-1)
    parents.forEach(function(d, i) {
      var node = faces[d];
      node && (node.children || (node.children = [])).push(faces[i]);
    });
  }

  // a basic function to find the polygon that contains the point
  function find0(lambda, phi) {
    var d0 = Infinity;
    var found = -1;
    for (var i = 0; i < faces.length; i++) {
      var d = distance(faces[i].site, [lambda, phi]);
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

  var p = gnomonic();

  function reset() {
    var rotate = p.rotate(),
      translate = p.translate(),
      center = p.center(),
      scale = p.scale(),
      angle = p.angle();

    if (faces.length) {
      p = polyhedral(faces[0], faceFind);
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
