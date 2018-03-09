import {
  geoCentroid as centroid,
  geoGnomonic as gnomonic,
  geoDistance as distance
} from "d3-geo";
import { degrees } from "../math";
import polyhedral from "./index";

export function voronoiRaw(parents, angle, polygons, faceProjection) {
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

  // use the voronoi construction to find the relevant face
  // i.e. the one whose centre is closest to the point
  function voronoiface(lambda, phi) {
    lambda *= degrees;
    phi *= degrees;
    var d0 = Infinity;
    var found = -1;
    for (var i = 0; i < faces.length; i++) {
      var d = distance(faces[i].site, [lambda, phi]);
      if (d < d0) {
        d0 = d;
        found = i;
      }
    }
    return faces[found];
  }

  var p = gnomonic();
  p.angle = function(_) {
    if (!arguments.length) return angle;
    angle = +_;
    return reset();
  };

  function reset() {
    var rotate = p.rotate(),
      translate = p.translate(),
      center = p.center(),
      scale = p.scale();

    if (faces.length) {
      p = polyhedral(faces[0], voronoiface, angle);
      p._angle = p.angle;
      p.angle = function(_) {
        if (!arguments.length) return angle;
        p._angle((angle = +_));
        return reset();
      };
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
      if (!arguments.length) return parents;
      faceProjection = _;
      build_tree();
      return reset();
    };

    return p
      .rotate(rotate)
      .translate(translate)
      .center(center)
      .scale(scale);
  }

  build_tree();
  return reset();
}

export default function() {
  var parents = [],
    angle = 0,
    polygons = { features: [] },
    faceProjection = null;

  return voronoiRaw(parents, angle, polygons, faceProjection);
}
