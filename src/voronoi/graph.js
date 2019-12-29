"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_js_1 = require("../utils.js");
const site_js_1 = require("./site.js");
const edge_js_1 = require("./edge.js");
const vertex_js_1 = require("./vertex.js");
const halfedge_js_1 = require("./halfedge.js");
class VoronoiGraph {
    constructor(lPoints, plotBounds, iLloydIterations) {
        this.disposeVertsWhenDone = false;
        this.sitesIndexedByID = new Map();
        this._Init(lPoints, plotBounds);
    }
    _Init(points, bounds) {
        this.sites = new site_js_1.SiteList();
        this.AddSites(points);
        this.triangles = [];
        this.edges = [];
        this.bounds = bounds;
        this.FortunesAlgorithm();
    }
    AddSites(points) {
        for (var i = 0; i < points.length; ++i) {
            this.AddSite(points[i], i); //TODO: Make sure that no sites have id 0, we will use 0 as our 'null' value
        }
    }
    AddSite(p, index) {
        let weight = 0;
        let s = site_js_1.Site.Create(p, index, weight);
        this.sites.Add(s);
        //this.sitesIndexedByLocation[p] = s;
        this.sitesIndexedByID[index] = s;
    }
    FortunesAlgorithm() {
        let newSite, bottomSite, topSite, tempSite;
        let v, vertex;
        let newIntStar = new utils_js_1.Vector2f(0, 0);
        let leftRight;
        let lbnd, rbnd, llbnd, rrbnd, bisector;
        let edge;
        let dataBounds = this.sites.GetSitesBounds();
        let sqrtSitesNb = utils_js_1.roundToInt(Math.sqrt(this.sites.Count + 4));
        let heap = new halfedge_js_1.HalfedgePriorityQueue(dataBounds.y, dataBounds.height, sqrtSitesNb);
        let edgeList = new edge_js_1.EdgeList(dataBounds.x, dataBounds.width, sqrtSitesNb);
        let halfEdges = [];
        let vertices = [];
        let bottomMostSite = this.sites.Next();
        newSite = this.sites.Next();
        while (true) {
            if (!heap.Empty()) {
                newIntStar = heap.Min();
            }
            if (newSite != null &&
                (heap.Empty() || VoronoiGraph.CompareByYThenX(newSite, newIntStar) < 0)) {
                // New site is smallest
                //Debug.Log("smallest: new site " + newSite);
                // Step 8:
                lbnd = edgeList.EdgeListLeftNeighbor(newSite.Coord); // The halfedge just to the left of newSite
                //UnityEngine.Debug.Log("lbnd: " + lbnd);
                rbnd = lbnd.edgeListRightNeighbor; // The halfedge just to the right
                //UnityEngine.Debug.Log("rbnd: " + rbnd);
                bottomSite = this.RightRegion(lbnd, bottomMostSite); // This is the same as leftRegion(rbnd)
                // This Site determines the region containing the new site
                //UnityEngine.Debug.Log("new Site is in region of existing site: " + bottomSite);
                // Step 9
                edge = edge_js_1.Edge.CreateBisectingEdge(bottomSite, newSite);
                //UnityEngine.Debug.Log("new edge: " + edge);
                this.edges.push(edge);
                bisector = halfedge_js_1.Halfedge.Create(edge, edge_js_1.LR.LEFT);
                halfEdges.push(bisector);
                // Inserting two halfedges into edgelist constitutes Step 10:
                // Insert bisector to the right of lbnd:
                edgeList.Insert(lbnd, bisector);
                // First half of Step 11:
                if ((vertex = vertex_js_1.Vertex.Intersect(lbnd, bisector)) != null) {
                    vertices.push(vertex);
                    heap.Remove(lbnd);
                    lbnd.vertex = vertex;
                    lbnd.ystar = vertex.y + newSite.Dist(vertex);
                    heap.Insert(lbnd);
                }
                lbnd = bisector;
                bisector = halfedge_js_1.Halfedge.Create(edge, edge_js_1.LR.RIGHT);
                halfEdges.push(bisector);
                // Second halfedge for Step 10::
                // Insert bisector to the right of lbnd:
                edgeList.Insert(lbnd, bisector);
                // Second half of Step 11:
                if ((vertex = vertex_js_1.Vertex.Intersect(bisector, rbnd)) != null) {
                    vertices.push(vertex);
                    bisector.vertex = vertex;
                    bisector.ystar = vertex.y + newSite.Dist(vertex);
                    heap.Insert(bisector);
                }
                newSite = this.sites.Next();
            }
            else if (!heap.Empty()) {
                // Intersection is smallest
                lbnd = heap.ExtractMin();
                llbnd = lbnd.edgeListLeftNeighbor;
                rbnd = lbnd.edgeListRightNeighbor;
                rrbnd = rbnd.edgeListRightNeighbor;
                bottomSite = this.LeftRegion(lbnd, bottomMostSite);
                topSite = this.RightRegion(rbnd, bottomMostSite);
                // These three sites define a Delaunay triangle
                // (not actually using these for anything...)
                // triangles.Add(new Triangle(bottomSite, topSite, RightRegion(lbnd, bottomMostSite)));
                v = lbnd.vertex;
                v.SetIndex();
                lbnd.edge.SetVertex(lbnd.leftRight, v);
                rbnd.edge.SetVertex(rbnd.leftRight, v);
                edgeList.Remove(lbnd);
                heap.Remove(rbnd);
                edgeList.Remove(rbnd);
                leftRight = edge_js_1.LR.LEFT;
                if (bottomSite.y > topSite.y) {
                    tempSite = bottomSite;
                    bottomSite = topSite;
                    topSite = tempSite;
                    leftRight = edge_js_1.LR.RIGHT;
                }
                edge = edge_js_1.Edge.CreateBisectingEdge(bottomSite, topSite);
                this.edges.push(edge);
                bisector = halfedge_js_1.Halfedge.Create(edge, leftRight);
                halfEdges.push(bisector);
                edgeList.Insert(llbnd, bisector);
                edge.SetVertex(edge_js_1.LR.Other(leftRight), v);
                if ((vertex = vertex_js_1.Vertex.Intersect(llbnd, bisector)) != null) {
                    vertices.push(vertex);
                    heap.Remove(llbnd);
                    llbnd.vertex = vertex;
                    llbnd.ystar = vertex.y + bottomSite.Dist(vertex);
                    heap.Insert(llbnd);
                }
                if ((vertex = vertex_js_1.Vertex.Intersect(bisector, rrbnd)) != null) {
                    vertices.push(vertex);
                    bisector.vertex = vertex;
                    bisector.ystar = vertex.y + bottomSite.Dist(vertex);
                    heap.Insert(bisector);
                }
            }
            else {
                break;
            }
        }
        // Heap should be empty now
        heap.Dispose();
        edgeList.Dispose();
        for (let halfedge of halfEdges) {
            halfedge.ReallyDispose();
        }
        halfEdges = [];
        // we need the vertices to clip the edges
        for (let e of this.edges) {
            e.ClipVertices(this.bounds);
        }
        if (this.disposeVertsWhenDone) {
            // But we don't actually ever use them again!
            for (let ve of vertices) {
                ve.Dispose();
            }
            vertices = [];
        }
        else {
            this.cachedVerts = vertices;
        }
    }
    static CompareByYThenX(s1, s2) {
        if (s1.y < s2.y)
            return -1;
        if (s1.y > s2.y)
            return 1;
        if (s1.x < s2.x)
            return -1;
        if (s1.x > s2.x)
            return 1;
        return 0;
    }
    Regions() { return this.sites.Regions(this.bounds); }
    LeftRegion(he, bottomMostSite) {
        let edge = he.edge;
        if (edge == null) {
            return bottomMostSite;
        }
        return edge.Site(he.leftRight);
    }
    RightRegion(he, bottomMostSite) {
        let edge = he.edge;
        if (edge == null) {
            return bottomMostSite;
        }
        return edge.Site(edge_js_1.LR.Other(he.leftRight));
    }
}
exports.VoronoiGraph = VoronoiGraph;
