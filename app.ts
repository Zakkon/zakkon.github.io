import { Vertex } from "./src/voronoi/vertex"
import { Vector2f } from "./src/utils"
import { VoronoiGraph } from "./src/voronoi/graph";
import { Random } from "./src/random";
import { PointSelector } from "./src/voronoi/pointselector";
import { VoronoiMapFilter } from "./src/filters/voronoimapfilter";
import { Browser } from "./browser";

//Call this to build with webpack: webpack-cli app.ts --output=bundle.js -d
declare var require: any
let r = new Random(123);
let mapw = 1900; let maph = 944;
let points = PointSelector.GeneratePointsJittered(1000, mapw, maph, r);
let filter = new VoronoiMapFilter(mapw, maph);
filter.CreateGraph(points, PointSelector.NUM_LLOYD_RELAXATIONS);
console.log(filter.graph.sites.Count);
console.log(filter.cells.length);
var browser = new Browser();
browser.Draw(filter.cellsByID[547]);