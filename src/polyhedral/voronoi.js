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

  // the faces from the polyhedron each yield
  // - face: its vertices
  // - site: its voronoi site (default: centroid)
  // - project: local projection on this face
  var faces = polygons.features.map(function(feature, i) {
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

  var p = !faces.length
    ? gnomonic()
    : polyhedral(faces[0], voronoiface, angle);

  p.parents = function(_) {
    if (!arguments.length) return parents;
    return voronoiRaw((parents = _), angle, polygons, faceProjection);
  };

  p.angle = function(_) {
    if (!arguments.length) return angle;
    return voronoiRaw(parents, (angle = _), polygons, faceProjection);
  };

  p.polygons = function(_) {
    if (!arguments.length) return polygons;
    return voronoiRaw(parents, angle, (polygons = _), faceProjection);
  };

  p.faceProjection = function(_) {
    if (!arguments.length) return parents;
    return voronoiRaw(parents, angle, polygons, (faceProjection = _));
  };

  return p;
}

export default function() {
  var parents = [],
    angle = 0,
    polygons = { features: [] },
    faceProjection = null;

  return voronoiRaw(parents, angle, polygons, faceProjection);
}
