# d3-geo-polygon

Clipping and geometric operations for spherical polygons.

## Installing

If you use npm, `npm install d3-geo-polygon`. You can also download the [latest release on GitHub](https://github.com/d3/d3-geo-polygon/releases/latest). For vanilla HTML in modern browsers, import d3-geo-polygon from Skypack:

```html
<script type="module">
import {geoCubic} from "https://cdn.skypack.dev/d3-geo-polygon@2";
const projection = geoCubic();
</script>
```

For legacy environments, you can load d3-geo-projection’s UMD bundle from an npm-based CDN such as jsDelivr; a `d3` global is exported:

```html
<script src="https://cdn.jsdelivr.net/npm/d3-array@3"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-geo@3"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-geo-polygon@2"></script>
<script>

const projection = d3.geoCubic();

</script>
```

This module introduces a handful of additional projections. It can also be used to clip a projection with an arbitrary polygon:

```html
const projection = d3.geoEquirectangular()
  .preclip(d3.geoClipPolygon({
    type: "Polygon",
    coordinates: [[[-10, -10], [-10, 10], [10, 10], [10, -10], [-10, -10]]]
  }));
```

## API Reference

<a name="geoClipPolygon" href="#geoClipPolygon">#</a> d3.<b>geoClipPolygon</b>(<i>polygon</i>) · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/clip/polygon.js), [Examples](https://observablehq.com/@mbostock/spherical-clipping)

Given a GeoJSON *polygon* or *multipolygon*, returns a clip function suitable for [_projection_.preclip](https://github.com/d3/d3-geo#preclip).

<a name="polygon" href="#polygon">#</a> clip.<b>polygon</b>()

Given a clipPolygon function, returns the GeoJSON polygon.

<a name="geoIntersectArc" href="#geoIntersectArc">#</a> d3.<b>geoIntersectArc</b>(<i>arcs</i>) · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/intersect.js), [Examples](https://observablehq.com/@fil/spherical-intersection)

Given two spherical arcs [point0, point1] and [point2, point3], returns their intersection, or undefined if there is none. See “[Spherical Intersection](https://observablehq.com/@fil/spherical-intersection)”.

## Projections

d3-geo-polygon adds polygon clipping to the polyhedral and interrupted projections from [d3-geo-projection](https://github.com/d3/d3-geo-projection). Thus, it supersedes the following symbols:

<a href="#geoPolyhedral" name="geoPolyhedral">#</a> d3.<b>geoPolyhedral</b>(<i>tree</i>, <i>face</i>) · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/polyhedral/index.js), [Examples](https://observablehq.com/@fil/polyhedral-projections-with-d3-geo-polygon)

Defines a new polyhedral projection. The *tree* is a spanning tree of polygon face nodes; each *node* is assigned a *node*.transform matrix. The *face* function returns the appropriate *node* for a given *lambda* and *phi* in radians.

<a href="#geoPolyhedral_tree" name="geoPolyhedral_tree">#</a> <i>polyhedral</i>.<b>tree</b>() returns the spanning tree of the polyhedron, from which one can infer the faces’ centers, polygons, shared edges etc.

<a href="#geoPolyhedralButterfly" name="geoPolyhedralButterfly">#</a> d3.<b>geoPolyhedralButterfly</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/polyhedral/butterfly.js)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/polyhedralButterfly.png" width="480" height="250">](https://observablehq.com/@d3/polyhedral-gnomonic)

The gnomonic butterfly projection.

<a href="#geoPolyhedralCollignon" name="geoPolyhedralCollignon">#</a> d3.<b>geoPolyhedralCollignon</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/polyhedral/collignon.js)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/polyhedralCollignon.png" width="480" height="250">](https://www.jasondavies.com/maps/collignon-butterfly/)

The Collignon butterfly projection.

<a href="#geoPolyhedralWaterman" name="geoPolyhedralWaterman">#</a> d3.<b>geoPolyhedralWaterman</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/polyhedral/waterman.js)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/polyhedralWaterman.png" width="480" height="250">](https://www.jasondavies.com/maps/waterman-butterfly/)

A butterfly projection inspired by Steve Waterman’s design.

<a href="#geoBerghaus" name="geoBerghaus">#</a> d3.<b>geoBerghaus</b> · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/reclip.js)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/geoBerghaus.png" width="480" height="250">](https://observablehq.com/@d3/interrupted-clipped)

The Berghaus projection.

<a href="#geoGingery" name="geoGingery">#</a> d3.<b>geoGingery</b> · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/reclip.js)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/geoGingery.png" width="480" height="250">](https://observablehq.com/@d3/interrupted-clipped)

The Gingery projection.

<a href="#geoHealpix" name="geoHealpix">#</a> d3.<b>geoHealpix</b> · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/reclip.js)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/geoHealpix.png" width="480" height="250">](https://observablehq.com/@d3/interrupted-clipped)

The HEALPix projection.

<a href="#geoInterruptedBoggs" name="geoInterruptedBoggs">#</a> d3.<b>geoInterruptedBoggs</b> · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/reclip.js)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/geoInterruptedBoggs.png" width="480" height="250">](https://observablehq.com/@d3/interrupted-clipped)

Bogg’s interrupted eumorphic projection.

<a href="#geoInterruptedHomolosine" name="geoInterruptedHomolosine">#</a> d3.<b>geoInterruptedHomolosine</b> · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/reclip.js)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/geoInterruptedHomolosine.png" width="480" height="250">](https://observablehq.com/@d3/interrupted-clipped)

Goode’s interrupted homolosine projection.

<a href="#geoInterruptedMollweide" name="geoInterruptedMollweide">#</a> d3.<b>geoInterruptedMollweide</b> · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/reclip.js)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/geoInterruptedMollweide.png" width="480" height="250">](https://observablehq.com/@d3/interrupted-clipped)

Goode’s interrupted Mollweide projection.

<a href="#geoInterruptedMollweideHemispheres" name="geoInterruptedMollweideHemispheres">#</a> d3.<b>geoInterruptedMollweideHemispheres</b> · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/reclip.js)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/geoInterruptedMollweideHemispheres.png" width="480" height="250">](https://observablehq.com/@d3/interrupted-clipped)

The Mollweide projection interrupted into two (equal-area) hemispheres.

<a href="#geoInterruptedSinuMollweide" name="geoInterruptedSinuMollweide">#</a> d3.<b>geoInterruptedSinuMollweide</b> · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/reclip.js)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/geoInterruptedSinuMollweide.png" width="480" height="250">](https://observablehq.com/@d3/interrupted-clipped)

Alan K. Philbrick’s interrupted sinu-Mollweide projection.

<a href="#geoInterruptedSinusoidal" name="geoInterruptedSinusoidal">#</a> d3.<b>geoInterruptedSinusoidal</b> · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/reclip.js)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/geoInterruptedSinusoidal.png" width="480" height="250">](https://observablehq.com/@d3/interrupted-clipped)

An interrupted sinusoidal projection with asymmetrical lobe boundaries.


New projections are introduced:

<a href="#geoPolyhedralVoronoi" name="geoPolyhedralVoronoi">#</a> d3.<b>geoPolyhedralVoronoi</b>([<i>parents</i>], [<i>polygons</i>], [<i>faceProjection</i>], [<i>faceFind</i>]) · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/polyhedral/voronoi.js)

Returns a polyhedral projection based on the *polygons*, arranged in a tree. 

The tree is specified by passing *parents*, an array of indices indicating the parent of each face. The root of the tree is the first face without a parent (with the array typically specifying -1).

*polygons* are a GeoJSON FeatureCollection of geoVoronoi cells, which should indicate the corresponding sites (see [d3-geo-voronoi](https://github.com/Fil/d3-geo-voronoi)). An optional [_faceProjection_](#geoPolyhedral) is passed to d3.geoPolyhedral() -- note that the gnomonic projection on the polygons’ sites is the only faceProjection that works in the general case.

The .<b>parents</b>([<i>parents</i>]), .<b>polygons</b>([<i>polygons</i>]), .<b>faceProjection</b>([<i>faceProjection</i>]) set and read the corresponding options. Use <i>.faceFind(voronoi.find)</i> for faster results.

<a href="#geoCubic" name="geoCubic">#</a> d3.<b>geoCubic</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/cubic.js), [Examples](https://observablehq.com/@fil/cubic-projections)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/cubic.png" width="480" height="250">](https://observablehq.com/@fil/cubic-projections)

The cubic projection.

<a href="#geoDodecahedral" name="geoDodecahedral">#</a> d3.<b>geoDodecahedral</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/polyhedral/dodecahedral.js), [Examples](https://observablehq.com/@fil/dodecahedral-projection)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/dodecahedral.png" width="480" height="250">](https://observablehq.com/@fil/dodecahedral-projection)

The pentagonal dodecahedral projection.

<a href="#geoRhombic" name="geoRhombic">#</a> d3.<b>geoRhombic</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/polyhedral/rhombic.js), [Examples](https://observablehq.com/d/881a8431e638b408)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/rhombic.png" width="480" height="250">](https://observablehq.com/d/881a8431e638b408)

The rhombic dodecahedral projection.

<a href="#geoDeltoidal" name="geoDeltoidal">#</a> d3.<b>geoDeltoidal</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/polyhedral/deltoidal.js), [Examples](https://observablehq.com/d/881a8431e638b408)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/deltoidal.png" width="480" height="250">](https://observablehq.com/d/881a8431e638b408)

The deltoidal hexecontahedral projection.

<a href="#geoIcosahedral" name="geoIcosahedral">#</a> d3.<b>geoIcosahedral</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/icosahedral.js), [Examples](https://observablehq.com/@fil/icosahedral-projections)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/icosahedral.png" width="480" height="250">](https://observablehq.com/@fil/icosahedral-projections)

The icosahedral projection.

<a href="#geoAirocean" name="geoAirocean">#</a> d3.<b>geoAirocean</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/airocean.js), [Examples](https://observablehq.com/@fil/airocean-projection)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/airocean.png" width="480" height="250">](https://observablehq.com/@fil/airocean-projection)

Buckminster Fuller’s Airocean projection (also known as “Dymaxion”), based on a very specific arrangement of the icosahedron which allows continuous continent shapes. Fuller’s triangle transformation, as formulated by Robert W. Gray (and implemented by Philippe Rivière), makes the projection almost equal-area.

<a href="#geoCahillKeyes" name="geoCahillKeyes">#</a> d3.<b>geoCahillKeyes</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/cahillKeyes.js), [Examples](https://observablehq.com/@d3/cahill-keyes)
<br><a href="#geoCahillKeyesRaw" name="geoCahillKeyesRaw">#</a> d3.<b>geoCahillKeyes</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/cahillKeyes.png" width="480" height="250">](http://www.genekeyes.com/)

The Cahill-Keyes projection, designed by Gene Keyes (1975), is built on Bernard J. S. Cahill’s 1909 octant design. Implementation by Mary Jo Graça (2011), ported to D3 by Enrico Spinielli (2013).

<a href="#geoImago" name="geoImago">#</a> d3.<b>geoImago</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/imago.js), [Examples](https://observablehq.com/@fil/the-imago-projection)

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/imago.png" width="480" height="250">](https://kunimune.home.blog/2017/11/23/the-secrets-of-the-authagraph-revealed/)

The Imago projection, engineered by Justin Kunimune (2017), is inspired by Hajime Narukawa’s AuthaGraph design (1999).

<a href="#imago_k" name="imago_k">#</a> <i>imago</i>.<b>k</b>([<i>k</i>])

Exponent. Useful values include 0.59 (default, minimizes angular distortion of the continents), 0.68 (gives the closest approximation of the AuthaGraph) and 0.72 (prevents kinks in the graticule).

<a href="#imago_shift" name="imago_shift">#</a> <i>imago</i>.<b>shift</b>([<i>shift</i>])

Horizontal shift. Defaults to 1.16.

<a href="#geoTetrahedralLee" name="geoTetrahedralLee">#</a> d3.<b>geoTetrahedralLee</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/tetrahedralLee.js), [Examples](https://observablehq.com/@fil/lee-projection)
<br><a href="#geoLeeRaw" name="geoLeeRaw">#</a> d3.<b>geoLeeRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/tetrahedralLee.png" width="480" height="250">](https://observablehq.com/@d3/lees-tetrahedral)

Lee’s tetrahedral conformal projection.

<a href="#tetrahedralLee_angle" name="tetrahedralLee_angle">#</a> Default <i>angle</i> is +30°, apex up (-30° for base up, apex down).

Default aspect uses _projection_.rotate([30, 180]) and has the North Pole at the triangle’s center -- use _projection_.rotate([-30, 0]) for the [South aspect](https://observablehq.com/@fil/lee-projection).

<a href="#geoCox" name="geoCox">#</a> d3.<b>geoCox</b>() · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/cox.js), [Examples](https://observablehq.com/@fil/cox-conformal-projection-in-a-triangle)
<br><a href="#geoCoxRaw" name="geoCoxRaw">#</a> d3.<b>geoCoxRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/cox.png" width="480" height="250">](https://visionscarto.net/cox-conformal-projection)

The Cox conformal projection.

<a href="#geoComplexLog" name="geoComplexLog">#</a> d3.<b>geoComplexLog</b>([<i>planarProjectionRaw</i>[<i>, cutoffLatitude</i>]]) · [Source](https://github.com/d3/d3-geo-polygon/blob/main/src/complexLog.js), [Example](https://cgmi.github.io/complex-log-projection/)
<br><a href="#geoComplexLogRaw" name="geoComplexLogRaw">#</a> d3.<b>geoComplexLogRaw</b>([<i>planarProjectionRaw</i>])

[<img src="https://raw.githubusercontent.com/d3/d3-geo-polygon/main/test/snapshots/complexLog.png" width="480" height="250">](https://cgmi.github.io/complex-log-projection/)

Complex logarithmic view. This projection is based on the papers by Joachim Böttger et al.:

- [Detail‐In‐Context Visualization for Satellite Imagery (2008)](https://doi.org/10.1111/j.1467-8659.2008.01156.x)
- [Complex Logarithmic Views for Small Details in Large Contexts (2006)](https://doi.org/10.1109/TVCG.2006.126)

The specified raw projection *planarProjectionRaw* is used to project onto the complex plane on which the complex logarithm is applied.
Recommended are [azimuthal equal-area](https://github.com/d3/d3-geo#geoAzimuthalEqualAreaRaw) (default) or [azimuthal equidistant](https://github.com/d3/d3-geo#geoAzimuthalEquidistantRaw).

*cutoffLatitude* is the latitude relative to the projection center at which to cutoff/clip the projection, lower values result in more detail around the projection center. Value must be < 0 because complex log projects the origin to infinity.

<a href="#complexLog_planarProjectionRaw" name="complexLog_planarProjectionRaw">#</a> <i>complexLog</i>.<b>planarProjectionRaw</b>([<i>projectionRaw</i>])

If *projectionRaw* is specified, sets the planar raw projection. See above. If *projectionRaw* is not specified, returns the current planar raw projection.

<a href="#complexLog_cutoffLatitude" name="complexLog_cutoffLatitude">#</a> <i>complexLog</i>.<b>cutoffLatitude</b>([<i>latitude</i>])

If *latitude* is specified, sets the cutoff latitude. See above. If *latitude* is not specified, returns the current cutoff latitude.
