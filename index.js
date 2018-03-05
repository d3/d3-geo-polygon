export {default as geoClipPolygon} from "./src/clip/polygon";
export {default as geoPolyhedral} from "./src/polyhedral/index";
export {default as geoPolyhedralButterfly} from "./src/polyhedral/butterfly";
export {default as geoPolyhedralCollignon} from "./src/polyhedral/collignon";
export {default as geoPolyhedralWaterman} from "./src/polyhedral/waterman";
export {default as geoPolyhedralVoronoi} from "./src/polyhedral/voronoi";
export {default as geoDodecahedral} from "./src/polyhedral/dodecahedral";

// if necessary, the following line could export a copy of the d3-geo-projection versions under the names xxxxUnclipped
// export {geoPolyhedral as geoPolyhedralUnclipped, geoPolyhedralButterfly as geoPolyhedralButterflyUnclipped, geoPolyhedralCollignon as geoPolyhedralCollignonUnclipped, geoPolyhedralWaterman as geoPolyhedralWatermanUnclipped} from "./node_modules/d3-geo-projection/index";

// if necessary, the following line could export a copy of these versions under the names xxxxClipped
// export {default as geoPolyhedral, default as geoPolyhedralClipped} from "./src/polyhedral/index";
// export {default as geoPolyhedralButterfly, default as geoPolyhedralButterflyClipped} from "./src/polyhedral/butterfly.js";
// export {default as geoPolyhedralCollignon, default as geoPolyhedralCollignonClipped} from "./src/polyhedral/collignon.js";
// export {default as geoPolyhedralWaterman, default as geoPolyhedralWatermanClipped} from "./src/polyhedral/waterman.js";
