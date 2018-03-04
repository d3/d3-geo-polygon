import {geoCentroid as centroid, geoGnomonic as gnomonic, geoDistance as distance} from "d3-geo";
import {degrees} from "../math";
import polyhedral from "./index";

export default function (parents, rotation, poly, faceProjection) {

  // it is possible to pass a specific projection on each face
  // by default is is a gnomonic projection centered on the face's centroid
  // scale 1 by convention
  faceProjection = faceProjection || function(face) {
    return gnomonic()
      .scale(1)
      .translate([0, 0])
      .rotate([-face.site[0], -face.site[1]]);
  };

  
  // the faces from the polyhedron each yield
  // - face: its vertices
  // - site: its voronoi site (here: centroid of the pentagon)
  // - project: local projection on this face
  var faces = poly.map(function(face) {
    var polygon = face.slice();
    face = face.slice(0,-1);
    face.site = centroid({type: "Polygon", coordinates: [polygon]});
    return {
      face: face,
      site: face.site,
      project: faceProjection(face)
    };
  });

  // Build a tree of the faces, starting with face 0 (North Pole)
  // which has no parent (-1)
  parents
  .forEach(function(d, i) {
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
      if (d < d0) { d0 = d; found = i; }
    }
    return faces[found];
  }

  var proj = polyhedral(faces[0], voronoiface, rotation)
  proj.faces = faces;
  return proj;
}