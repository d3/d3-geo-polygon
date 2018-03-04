import {acos, asin, degrees, sqrt} from "../math";
import voronoi from "./voronoi";

export default function(parents, rotation, polygons) {
var A0 = asin(1/sqrt(3)) * degrees,
        A1 = acos((sqrt(15) - sqrt(3))/6) * degrees,
        A2 = 90 - A1,
        A3 = acos(-(sqrt(3) + sqrt(15))/6) * degrees;

if (!polygons) polygons = [
  [[45,A0],[0,A1],[180,A1],[135,A0],[90,A2],[45,A0]],
  [[45,A0],[A2,0],[-A2,0],[-45,A0],[0,A1],[45,A0]],
  [[45,A0],[90,A2],[90,-A2],[45,-A0],[A2,0],[45,A0]],
  [[0,A1],[-45,A0],[-90,A2],[-135,A0],[180,A1],[0,A1]],
  [[A2,0],[45,-A0],[0,-A1],[-45,-A0],[-A2,0],[A2,0]],
  [[90,A2],[135,A0],[A3,0],[135,-A0],[90,-A2],[90,A2]],
  [[45,-A0],[90,-A2],[135,-A0],[180,-A1],[0,-A1],[45,-A0]],
  [[135,A0],[180,A1],[-135,A0],[-A3,0],[A3,0],[135,A0]],
  [[-45,A0],[-A2,0],[-45,-A0],[-90,-A2],[-90,A2],[-45,A0]],
  [[-45,-A0],[0,-A1],[180,-A1],[-135,-A0],[-90,-A2],[-45,-A0]],
  [[135,-A0],[A3,0],[-A3,0],[-135,-A0],[180,-A1],[135,-A0]],
  [[-135,A0],[-90,A2],[-90,-A2],[-135,-A0],[-A3,0],[-135,A0]]
];

if (rotation === undefined) rotation = (72 * 1.5);

// See http://blockbuilder.org/Fil/80822180c2dd077ca8fb015f06abef2b
// for the arrangement of faces
// example: [-1,0,0,0,1,0,2,0,1,11,6,3]
if (!parents) parents = [-1,0,4,8,1,2,2,3,1,8,6,3];
var projection = voronoi(parents, rotation, polygons)
   .rotate([-8,0,-32])
   .scale(99.8);

return projection;

}