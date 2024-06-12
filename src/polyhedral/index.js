import {geoBounds as bounds, geoCentroid as centroid, geoInterpolate as interpolate, geoProjection as projection} from "d3-geo";
import clipPolygon from "../clip/polygon.js";
import {abs, degrees, epsilon, radians} from "../math.js";
import matrix, {multiply, inverse} from "./matrix.js";
import pointEqual from "../pointEqual.js";

// Creates a polyhedral projection.
//  * tree: a spanning tree of polygon faces.  Nodes are automatically
//    augmented with a transform matrix.
//  * face: a function that returns the appropriate node for a given {lambda, phi}
//    point (radians).
export default function(tree, face) {

  recurse(tree, {transform: null});

  function recurse(node, parent) {
    node.edges = faceEdges(node.face);
    // Find shared edge.
    if (parent.face) {
      const shared = node.shared = sharedEdge(node.face, parent.face);
      const m = matrix(shared.map(parent.project), shared.map(node.project));
      node.transform = parent.transform ? multiply(parent.transform, m) : m;
      // Replace shared edge in parent edges array.
      let edges = parent.edges;
      for (let i = 0, n = edges.length; i < n; ++i) {
        if (pointEqual(shared[0], edges[i][1]) && pointEqual(shared[1], edges[i][0])) edges[i] = node;
        if (pointEqual(shared[0], edges[i][0]) && pointEqual(shared[1], edges[i][1])) edges[i] = node;
      }
      edges = node.edges;
      for (let i = 0, n = edges.length; i < n; ++i) {
        if (pointEqual(shared[0], edges[i][0]) && pointEqual(shared[1], edges[i][1])) edges[i] = parent;
        if (pointEqual(shared[0], edges[i][1]) && pointEqual(shared[1], edges[i][0])) edges[i] = parent;
      }
    } else {
      node.transform = parent.transform;
    }
    if (node.children) node.children.forEach((child) => recurse(child, node));
    return node;
  }

  function forward(lambda, phi) {
    const node = face(lambda, phi);
    const point = node.project([lambda * degrees, phi * degrees]);
    const t  = node.transform;
    return t
      ? [t[0] * point[0] + t[1] * point[1] + t[2], -(t[3] * point[0] + t[4] * point[1] + t[5])]
      : [point[0], -point[1]];
  }

  // Naive inverse!  A faster solution would use bounding boxes, or even a
  // polygonal quadtree.
  if (hasInverse(tree)) forward.invert = function(x, y) {
    const coordinates = faceInvert(tree, [x, -y]);
    return coordinates && (coordinates[0] *= radians, coordinates[1] *= radians, coordinates);
  };

  function faceInvert(node, coordinates) {
    const invert = node.project.invert;
    let point = coordinates;
    let p;
    let t = node.transform;
    if (t) {
      t = inverse(t);
      point = [t[0] * point[0] + t[1] * point[1] + t[2], (t[3] * point[0] + t[4] * point[1] + t[5])];
    }
    if (invert && node === faceDegrees(p = invert(point))) return p;
    const children = node.children;
    for (let i = 0, n = children && children.length; i < n; ++i) {
      p = faceInvert(children[i], coordinates);
      if (p) return p;
    }
  }

  function faceDegrees(coordinates) {
    return face(coordinates[0] * radians, coordinates[1] * radians);
  }

  const proj = projection(forward);

  // run around the mesh of faces and stream all vertices to create the clipping polygon
  const polygon = [];
  outline({point: function(lambda, phi) { polygon.push([lambda, phi]); }}, tree);
  polygon.push(polygon[0]);
  proj.preclip(clipPolygon({ type: "Polygon", coordinates: [ polygon ] }));
  proj.tree = function() { return tree; };
  
  return proj;
}

function outline(stream, node, parent) {
  let point,
      edges = node.edges,
      n = edges.length,
      edge,
      multiPoint = {type: "MultiPoint", coordinates: node.face},
      notPoles = node.face.filter(function(d) { return abs(d[1]) !== 90; }),
      b = bounds({type: "MultiPoint", coordinates: notPoles}),
      inside = false,
      j = -1,
      dx = b[1][0] - b[0][0];
  // TODO
  node.centroid = dx === 180 || dx === 360
      ? [(b[0][0] + b[1][0]) / 2, (b[0][1] + b[1][1]) / 2]
      : centroid(multiPoint);
  // First find the shared edge…
  if (parent) while (++j < n) {
    if (edges[j] === parent) break;
  }
  ++j;
  for (let i = 0; i < n; ++i) {
    edge = edges[(i + j) % n];
    if (Array.isArray(edge)) {
      if (!inside) {
        stream.point((point = interpolate(edge[0], node.centroid)(epsilon))[0], point[1]);
        inside = true;
      }
      stream.point((point = interpolate(edge[1], node.centroid)(epsilon))[0], point[1]);
    } else {
      inside = false;
      if (edge !== parent) outline(stream, edge, node);
    }
  }
}

// Finds a shared edge given two clockwise polygons.
function sharedEdge(a, b) {
  const n = a.length;
  let x, y, found = null;
  for (let i = 0; i < n; ++i) {
    x = a[i];
    for (let j = b.length; --j >= 0;) {
      y = b[j];
      if (x[0] === y[0] && x[1] === y[1]) {
        if (found) return [found, x];
        found = x;
      }
    }
  }
}

// Converts an array of n face vertices to an array of n + 1 edges.
function faceEdges(face) {
  const n = face.length;
  const edges = [];
  for (let i = 0, a = face[n - 1]; i < n; ++i) edges.push([a, a = face[i]]);
  return edges;
}

function hasInverse(node) {
  return node.project.invert || node.children && node.children.some(hasInverse);
}
