import {least} from "d3-array";
import {geoArea, geoBounds as bounds, geoCentroid as centroid, geoInterpolate as interpolate, geoProjection as projection} from "d3-geo";
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
  const nodes = [];

  recurse(tree, {transform: null});

  function recurse(node, parent) {
    nodes.push(node);
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

  if (hasInverse(tree)) forward.invert = function(x, y) {
    const candidates = [];
    const coordinates = faceInvert(x, -y, candidates) || faceInvertNear(candidates);
    return coordinates && (coordinates[0] *= radians, coordinates[1] *= radians, coordinates);
  };

  // Tries first the face whose projected centroid is nearest, then the face
  // that contains the inverted point, and so on; then all the other faces.
  function faceInvert(x, y, candidates) {
    const tried = new Set();
    let next = least(nodes, ({center: [u, v]}) => (x - u) ** 2 + (y - v) ** 2);
    for (let i = 0; next || i < nodes.length;) {
      const node = next || nodes[i++];
      next = null;
      if (tried.has(node)) continue;
      tried.add(node);
      const invert = node.project.invert, t = node.inverse;
      const p = invert && invert(t ? [t[0] * x + t[1] * y + t[2], t[3] * x + t[4] * y + t[5]] : [x, y]);
      if (p && !isNaN(p[0])) {
        if (node === (next = faceDegrees(p))) return p;
        candidates.push([node, p]);
      }
    }
  }

  // A point on the edge of a face can be assigned to a neighboring face by
  // rounding; accept it if it is in the face once moved slightly towards the
  // face’s centroid.
  function faceInvertNear(candidates) {
    for (const [node, p] of candidates) {
      if (node === faceDegrees(interpolate(p, node.centroid)(epsilon))) return p;
    }
  }

  function faceDegrees(coordinates) {
    return face(coordinates[0] * radians, coordinates[1] * radians);
  }

  const proj = projection(forward);

  // run around the mesh of faces and stream all vertices to create the clipping polygon
  const p = [];
  const geometry = {type: "MultiPolygon", coordinates: [[p]]};
  outline({point: (lambda, phi) => p.push([lambda, phi])}, tree);
  p.push(p[0]);
  // the faces’ inverse transforms and projected centroids, for the inverse
  for (const node of nodes) {
    const t = node.transform, c = node.project(node.centroid);
    node.inverse = t && inverse(t);
    node.center = t ? [t[0] * c[0] + t[1] * c[1] + t[2], t[3] * c[0] + t[4] * c[1] + t[5]] : c;
  }
  proj.preclip(clipPolygon(geometry).clipPoint(geoArea(geometry) < 4 * Math.PI - 0.1));
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
