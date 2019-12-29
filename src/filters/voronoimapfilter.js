"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const graph_1 = require("../voronoi/graph");
const basecell_1 = require("./basecell");
class VoronoiMapFilter {
    constructor(mapWidth, mapHeight) {
        this.mapW = mapWidth;
        this.mapH = mapHeight;
    }
    CreateGraph(points, lloydRelaxations) {
        //Create the voronoi itself
        this.graph = new graph_1.VoronoiGraph(points, new utils_1.Rectf(0, 0, this.mapW, this.mapH), lloydRelaxations);
        var re = this.graph.Regions(); //Important
        this.CreateCells();
    }
    CreateCells() {
        this.cells = [];
        ;
        var cellsDict = new Map();
        for (var s of this.graph.sites.sites) {
            var cellID = s.SiteIndex;
            var c = new basecell_1.VoroCell(cellID, s);
            this.cells.push(c); //Create a new cell and remember it by its ID
            cellsDict.set(c.ID, c);
        }
        this.cellsByID = new Array(this.cells.length + 1); //Adding an extra slot just to be safe. Hopefully we wont run into nullrefs. This array shouldnt be iterated over anyway
        console.log("len " + this.graph.sites.sites.length);
        for (let c of this.cells) {
            this.cellsByID[c.ID] = c;
            c.AssignVerts();
        }
    }
}
exports.VoronoiMapFilter = VoronoiMapFilter;
