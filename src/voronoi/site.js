"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queue_typescript_1 = require("queue-typescript");
const edge_js_1 = require("./edge.js");
const utils_js_1 = require("../utils.js");
const graph_js_1 = require("./graph.js");
class Site {
    constructor(pos, index, fWeight) {
        this.Init(pos, index, fWeight);
    }
    get Edges() { return this.edges; }
    get x() { return this.Coord.x; }
    get y() { return this.Coord.y; }
    get SiteIndex() { return this.siteIndex; }
    Init(pos, index, weight) {
        this.edges = new Array(0);
        this.region = new Array(0);
        this.Coord = pos;
        this.weight = weight;
        this.siteIndex = index;
        return this;
    }
    static Create(p, index, weight) {
        if (this.pool == null) {
            this.pool = new queue_typescript_1.Queue();
        } //Initialize if needed
        if (this.pool.length > 0) {
            return this.pool.dequeue().Init(p, index, weight);
        }
        else {
            return new Site(p, index, weight);
        }
    }
    static _sortSites(s0, s1) {
        var returnValue = graph_js_1.VoronoiGraph.CompareByYThenX(s0.Coord, s1.Coord);
        let tempIndex;
        if (returnValue == -1) {
            if (s0.siteIndex > s1.siteIndex) //Switch indices
             {
                tempIndex = s0.siteIndex;
                s0.siteIndex = s1.siteIndex;
                s1.siteIndex = s0.siteIndex;
            }
        }
        else if (returnValue == 1) {
            if (s1.siteIndex > s0.siteIndex) //Switch indices
             {
                tempIndex = s0.siteIndex;
                s1.siteIndex = s0.siteIndex;
                s0.siteIndex = s1.siteIndex;
            }
        }
        return returnValue;
    }
    static SortSites(sites) {
        sites.sort(Site._sortSites);
    }
    Compare(s1, s2) {
        return s1.CompareTo(s2);
    }
    CompareTo(s1) {
        var returnValue = graph_js_1.VoronoiGraph.CompareByYThenX(this.Coord, s1.Coord);
        let tempIndex;
        if (returnValue == -1) {
            if (this.siteIndex > s1.siteIndex) {
                tempIndex = this.siteIndex;
                this.siteIndex = s1.siteIndex;
                s1.siteIndex = tempIndex;
            }
        }
        else if (returnValue == 1) {
            if (s1.siteIndex > this.siteIndex) {
                tempIndex = s1.siteIndex;
                s1.siteIndex = this.siteIndex;
                this.siteIndex = tempIndex;
            }
        }
        return returnValue;
    }
    AddEdge(edge) {
        this.edges.push(edge);
    }
    NearestEdge() {
        this.edges.sort(edge_js_1.Edge.CompareSitesDistances);
        return this.edges[0];
    }
    Region(clippingBounds) {
        if (this.edges == null || this.edges == undefined || this.edges.length == 0 || this.edges.length == undefined) {
            return new utils_js_1.Vector2f[0];
        }
        if (this.edgeOrientations == null) {
            this.ReorderEdges();
            if (this.edges.length == undefined) {
                console.log("still broken");
            }
            this.region = this.ClipToBounds(clippingBounds);
            if ((new Polygon(this.region)).PolyWinding() == Winding.CLOCKWISE) {
                this.region.reverse();
            }
        }
        return this.region;
    }
    ClipToBounds(bounds) {
        let points = [];
        let n = this.edges.length;
        let i = 0;
        while (i < n && !this.edges[i].Visible()) {
            i++;
        }
        if (i == n) {
            // No edges visible
            return new Array(0);
        }
        let edge = this.edges[i];
        let orientation = this.edgeOrientations[i];
        let clends = edge.ClippedEnds;
        points.push(clends[orientation.index]);
        points.push(clends[edge_js_1.LR.Other(orientation).index]);
        for (let j = i + 1; j < n; j++) {
            this.edges[i] = this.edges[j];
            if (!this.edges[i].Visible()) {
                continue;
            }
            points = this.Connect(points, j, bounds);
        }
        // Close up the polygon by adding another corner point of the bounds if needed:
        points = this.Connect(points, i, bounds, true);
        return points;
    }
    Connect(points, int_j, bounds, closingUp = false) {
        let rightPoint = points[points.length - 1];
        let newEdge = this.edges[int_j];
        let newOrientation = this.edgeOrientations[int_j];
        // The point that must be conected to rightPoint:
        let newPoint = newEdge.ClippedEnds[newOrientation];
        if (!Site.CloseEnough(rightPoint, newPoint)) {
            // The points do not coincide, so they must have been clipped at the bounds;
            // see if they are on the same border of the bounds:
            if (rightPoint.x != newPoint.x && rightPoint.y != newPoint.y) {
                // They are on different borders of the bounds;
                // insert one or two corners of bounds as needed to hook them up:
                // (NOTE this will not be correct if the region should take up more than
                // half of the bounds rect, for then we will have gone the wrong way
                // around the bounds and included the smaller part rather than the larger)
                let rightCheck = utils_js_1.BoundsCheck.Check(rightPoint, bounds);
                let newCheck = utils_js_1.BoundsCheck.Check(newPoint, bounds);
                let px, py;
                if ((rightCheck & utils_js_1.BoundsCheck.RIGHT) != 0) {
                    px = bounds.right;
                    if ((newCheck & utils_js_1.BoundsCheck.BOTTOM) != 0) {
                        py = bounds.bottom;
                        points.push(new utils_js_1.Vector2f(px, py));
                    }
                    else if ((newCheck & utils_js_1.BoundsCheck.TOP) != 0) {
                        py = bounds.top;
                        points.push(new utils_js_1.Vector2f(px, py));
                    }
                    else if ((newCheck & utils_js_1.BoundsCheck.LEFT) != 0) {
                        if (rightPoint.y - bounds.y + newPoint.y - bounds.y < bounds.height) {
                            py = bounds.top;
                        }
                        else {
                            py = bounds.bottom;
                        }
                        points.push(new utils_js_1.Vector2f(px, py));
                        points.push(new utils_js_1.Vector2f(bounds.left, py));
                    }
                }
                else if ((rightCheck & utils_js_1.BoundsCheck.LEFT) != 0) {
                    px = bounds.left;
                    if ((newCheck & utils_js_1.BoundsCheck.BOTTOM) != 0) {
                        py = bounds.bottom;
                        points.push(new utils_js_1.Vector2f(px, py));
                    }
                    else if ((newCheck & utils_js_1.BoundsCheck.TOP) != 0) {
                        py = bounds.top;
                        points.push(new utils_js_1.Vector2f(px, py));
                    }
                    else if ((newCheck & utils_js_1.BoundsCheck.RIGHT) != 0) {
                        if (rightPoint.y - bounds.y + newPoint.y - bounds.y < bounds.height) {
                            py = bounds.top;
                        }
                        else {
                            py = bounds.bottom;
                        }
                        points.push(new utils_js_1.Vector2f(px, py));
                        points.push(new utils_js_1.Vector2f(bounds.right, py));
                    }
                }
                else if ((rightCheck & utils_js_1.BoundsCheck.TOP) != 0) {
                    py = bounds.top;
                    if ((newCheck & utils_js_1.BoundsCheck.RIGHT) != 0) {
                        px = bounds.right;
                        points.push(new utils_js_1.Vector2f(px, py));
                    }
                    else if ((newCheck & utils_js_1.BoundsCheck.LEFT) != 0) {
                        px = bounds.left;
                        points.push(new utils_js_1.Vector2f(px, py));
                    }
                    else if ((newCheck & utils_js_1.BoundsCheck.BOTTOM) != 0) {
                        if (rightPoint.x - bounds.x + newPoint.x - bounds.x < bounds.width) {
                            px = bounds.left;
                        }
                        else {
                            px = bounds.right;
                        }
                        points.push(new utils_js_1.Vector2f(px, py));
                        points.push(new utils_js_1.Vector2f(px, bounds.bottom));
                    }
                }
                else if ((rightCheck & utils_js_1.BoundsCheck.BOTTOM) != 0) {
                    py = bounds.bottom;
                    if ((newCheck & utils_js_1.BoundsCheck.RIGHT) != 0) {
                        px = bounds.right;
                        points.push(new utils_js_1.Vector2f(px, py));
                    }
                    else if ((newCheck & utils_js_1.BoundsCheck.LEFT) != 0) {
                        px = bounds.left;
                        points.push(new utils_js_1.Vector2f(px, py));
                    }
                    else if ((newCheck & utils_js_1.BoundsCheck.TOP) != 0) {
                        if (rightPoint.x - bounds.x + newPoint.x - bounds.x < bounds.width) {
                            px = bounds.left;
                        }
                        else {
                            px = bounds.right;
                        }
                        points.push(new utils_js_1.Vector2f(px, py));
                        points.push(new utils_js_1.Vector2f(px, bounds.top));
                    }
                }
            }
            if (closingUp) {
                // newEdge's ends have already been added
                return points;
            }
            points.push(newPoint);
        }
        let newRightPoint = newEdge.ClippedEnds[edge_js_1.LR.Other(newOrientation).index];
        if (!Site.CloseEnough(points[0], newRightPoint)) {
            points.push(newRightPoint);
        }
        return points;
    }
    Dist(p) {
        return this.Coord.subtract(p).magnitude;
    }
    static CloseEnough(p0, p1) {
        return p0.subtract(p1).magnitude < Site.EPSILON;
    }
    ReorderEdges() {
        let reorderer = new edge_js_1.EdgeReorderer(this.edges, "vertex");
        this.edges = reorderer.Edges;
        this.edgeOrientations = reorderer.EdgeOrientations;
        reorderer.Dispose();
    }
}
exports.Site = Site;
Site.EPSILON = 0.005;
class SiteList {
    constructor() {
        this.sites = [];
        this.sorted = false;
        this.currentIndex = 0;
    }
    Add(site) {
        this.sorted = false;
        this.sites.push(site);
        return this.sites.length;
    }
    get Count() { return this.sites.length; }
    SortList() {
        Site.SortSites(this.sites);
        this.sorted = true;
    }
    ResetListIndex() {
        this.currentIndex = 0;
    }
    GetSitesBounds() {
        if (!this.sorted) {
            this.SortList();
            this.ResetListIndex();
        }
        var xmin, xmax, ymin, ymax;
        if (this.sites.length == 0) {
            return new utils_js_1.Rectf(0, 0, 0, 0);
        }
        xmin = Number.MAX_VALUE; //Min and max floats
        xmax = Number.MIN_VALUE;
        for (let site of this.sites) { //In most cases you want to use 'of' and not 'in'
            if (site.x < xmin)
                xmin = site.x;
            if (site.x > xmax)
                xmax = site.x;
        }
        // here's where we assume that the sites have been sorted on y:
        ymin = this.sites[0].y;
        ymax = this.sites[this.sites.length - 1].y;
        return new utils_js_1.Rectf(xmin, ymin, xmax - xmin, ymax - ymin);
    }
    Regions(plotBounds) {
        var regions = new Array(0);
        for (let site of this.sites) {
            regions.push(site.Region(plotBounds));
        }
        return regions;
    }
    Next() {
        if (!this.sorted) {
            throw new Error("SiteList.Next(): sites have not been sorted");
        }
        if (this.currentIndex < this.sites.length) {
            return this.sites[this.currentIndex++];
        }
        else {
            return null;
        }
    }
}
exports.SiteList = SiteList;
var Winding;
(function (Winding) {
    Winding[Winding["CLOCKWISE"] = 0] = "CLOCKWISE";
    Winding[Winding["COUNTERCLOCKWISE"] = 1] = "COUNTERCLOCKWISE";
    Winding[Winding["NONE"] = 2] = "NONE";
})(Winding = exports.Winding || (exports.Winding = {}));
class Polygon {
    constructor(vertices) { this.vertices = vertices; }
    Area() { return Math.abs(this.SignedDoubleArea() * 0.5); }
    PolyWinding() {
        let signedDoubleArea = this.SignedDoubleArea();
        if (signedDoubleArea < 0) {
            return Winding.CLOCKWISE;
        }
        if (signedDoubleArea > 0) {
            return Winding.COUNTERCLOCKWISE;
        }
        return Winding.NONE;
    }
    SignedDoubleArea() {
        let index, nextIndex;
        let n = this.vertices.length;
        let point, next;
        let signedDoubleArea = 0;
        for (index = 0; index < n; index++) {
            nextIndex = (index + 1) % n;
            point = this.vertices[index];
            next = this.vertices[nextIndex];
            signedDoubleArea += point.x * next.y - next.x * point.y;
        }
        return signedDoubleArea;
    }
}
exports.Polygon = Polygon;
