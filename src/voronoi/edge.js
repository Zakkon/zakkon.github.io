"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const halfedge_js_1 = require("./halfedge.js");
const vertex_js_1 = require("./vertex.js");
const utils_js_1 = require("../utils.js");
const queue_typescript_1 = require("queue-typescript");
class Edge {
    constructor(newIndex, forceVisible) {
        this.forceVisible = false;
        this.Init(newIndex);
    }
    get EdgeIndex() { return this._edgeIndex; }
    get LeftVertex() { return this.leftVertex; }
    get RightVertex() { return this.rightVertex; }
    get ClippedEnds() { return this.clippedVertices; }
    get LeftSite() { return this.sites[LR.LEFT.index]; }
    set LeftSite(value) { this.sites[LR.LEFT.index] = value; }
    get RightSite() { return this.sites[LR.RIGHT.index]; }
    set RightSite(value) { this.sites[LR.RIGHT.index] = value; }
    Init(newIndex) {
        this.sites = new Map();
        if (newIndex < 0) {
            this._edgeIndex = Edge.nEdges;
            Edge.nEdges++;
        }
        else {
            this._edgeIndex = newIndex;
        }
        this.clippedVertices = new Map();
    }
    Visible() {
        if (this.clippedVertices != null) {
            //console.log("clSize: " + this.clippedVertices.size);
            if (this.clippedVertices["left"] != undefined && this.clippedVertices.size < 1) {
                console.log("l");
            }
            //else if(this.clippedVertices["left"] == undefined){console.log("r");}
        }
        return this.forceVisible || !!(this.clippedVertices != null && this.clippedVertices.size > 0);
    }
    get IsClipped() { return !!(this.clippedVertices != null && this.clippedVertices.size > 0); } //!! means make true false, then true true
    ClipVertices(bounds) {
        var xmin = bounds.x;
        var ymin = bounds.y;
        var xmax = bounds.right;
        var ymax = bounds.bottom;
        var vertex0;
        var vertex1;
        var x0, x1, y0, y1;
        if (this.a == 1 && this.b >= 0) {
            vertex0 = this.rightVertex;
            vertex1 = this.leftVertex;
        }
        else {
            vertex0 = this.leftVertex;
            vertex1 = this.rightVertex;
        }
        if (this.a == 1) {
            y0 = ymin;
            if (vertex0 != null && vertex0.y > ymin) {
                y0 = vertex0.y;
            }
            if (y0 > ymax) {
                return;
            }
            x0 = this.c - this.b * y0;
            y1 = ymax;
            if (vertex1 != null && vertex1.y < ymax) {
                y1 = vertex1.y;
            }
            if (y1 < ymin) {
                return;
            }
            x1 = this.c - this.b * y1;
            if ((x0 > xmax && x1 > xmax) || (x0 < xmin && x1 < xmin)) {
                return;
            }
            if (x0 > xmax) {
                x0 = xmax;
                y0 = (this.c - x0) / this.b;
            }
            else if (x0 < xmin) {
                x0 = xmin;
                y0 = (this.c - x0) / this.b;
            }
            if (x1 > xmax) {
                x1 = xmax;
                y1 = (this.c - x1) / this.b;
            }
            else if (x1 < xmin) {
                x1 = xmin;
                y1 = (this.c - x1) / this.b;
            }
        }
        else {
            x0 = xmin;
            if (vertex0 != null && vertex0.x > xmin) {
                x0 = vertex0.x;
            }
            if (x0 > xmax) {
                return;
            }
            y0 = this.c - this.a * x0;
            x1 = xmax;
            if (vertex1 != null && vertex1.x < xmax) {
                x1 = vertex1.x;
            }
            if (x1 < xmin) {
                return;
            }
            y1 = this.c - this.a * x1;
            if ((y0 > ymax && y1 > ymax) || (y0 < ymin && y1 < ymin)) {
                return;
            }
            if (y0 > ymax) {
                y0 = ymax;
                x0 = (this.c - y0) / this.a;
            }
            else if (y0 < ymin) {
                y0 = ymin;
                x0 = (this.c - y0) / this.a;
            }
            if (y1 > ymax) {
                y1 = ymax;
                x1 = (this.c - y1) / this.a;
            }
            else if (y1 < ymin) {
                y1 = ymin;
                x1 = (this.c - y1) / this.a;
            }
        }
        this.clippedVertices = new Map();
        if (vertex0 == this.leftVertex) {
            this.clippedVertices[LR.LEFT.index] = new utils_js_1.Vector2f(x0, y0);
            this.clippedVertices[LR.RIGHT.index] = new utils_js_1.Vector2f(x1, y1);
        }
        else {
            this.clippedVertices[LR.RIGHT.index] = new utils_js_1.Vector2f(x0, y0);
            this.clippedVertices[LR.LEFT.index] = new utils_js_1.Vector2f(x1, y1);
        }
    }
    Site(leftRight) {
        return this.sites[leftRight.index];
    }
    Vertex(lr) {
        return lr == LR.LEFT ? this.leftVertex : this.rightVertex;
    }
    SetVertex(lr, v) {
        if (lr == LR.LEFT) {
            this.leftVertex = v;
        }
        else {
            this.rightVertex = v;
        }
    }
    static CompareSitesDistances(edge0, edge1) {
        return -Edge.CompareSitesDistances_MAX(edge0, edge1);
    }
    static CompareSitesDistances_MAX(edge0, edge1) {
        let length0 = edge0.SitesDistance();
        let length1 = edge1.SitesDistance();
        if (length0 < length1) {
            return 1;
        }
        if (length0 > length1) {
            return -1;
        }
        return 0;
    }
    SitesDistance() {
        return this.LeftSite.Coord.subtract(this.RightSite.Coord).magnitude;
    }
    /*
         * This is the only way to create a new Edge
         * @param site0
         * @param site1
         * @return
         */
    static CreateBisectingEdge(s0, s1) {
        let dx, dy;
        let absdx, absdy;
        let a, b, c;
        dx = s1.x - s0.x;
        dy = s1.y - s0.y;
        absdx = dx > 0 ? dx : -dx;
        absdy = dy > 0 ? dy : -dy;
        c = s0.x * dx + s0.y * dy + (dx * dx + dy * dy) * 0.5;
        if (absdx > absdy) {
            a = 1;
            b = dy / dx;
            c /= dx;
        }
        else {
            b = 1;
            a = dx / dy;
            c /= dy;
        }
        let edge = Edge.Create();
        edge.LeftSite = s0;
        edge.RightSite = s1;
        s0.AddEdge(edge);
        s1.AddEdge(edge);
        edge.a = a;
        edge.b = b;
        edge.c = c;
        return edge;
    }
    static Create() {
        let edge;
        if (Edge.pool.length > 0) {
            edge = Edge.pool.dequeue();
            edge.Init(edge._edgeIndex);
        }
        else {
            edge = new Edge(-1, false);
        }
        return edge;
    }
}
exports.Edge = Edge;
Edge.nEdges = 0;
Edge.DELETED = new Edge(-1, false);
Edge.pool = new queue_typescript_1.Queue();
class LR {
    constructor(name) {
        this.name = name;
    }
    get index() { return this.name; }
    static Other(leftRight) {
        return leftRight == LR.LEFT ? LR.RIGHT : LR.LEFT;
    }
    ToString() { return name; }
}
exports.LR = LR;
LR.LEFT = new LR("left");
LR.RIGHT = new LR("right");
class EdgeReorderer {
    constructor(origEdges, criterion) {
        this.edges = new Array(0);
        this.edgeOrientations = new utils_js_1.List();
        if (origEdges.length > 0) {
            this.edges = this.ReorderEdges(origEdges, criterion);
        }
    }
    get Edges() { return this.edges; }
    get EdgeOrientations() { return this.edgeOrientations; }
    Dispose() {
        this.edges = null;
        this.edgeOrientations = null;
    }
    ReorderEdges(origEdges, criterion) {
        let i;
        let n = origEdges.length;
        let edge;
        // We're going to reorder the edges in order of traversal
        let done = [];
        let nDone = 0;
        for (let b = 0; b < n; b++) {
            done.push(false);
        }
        let newEdges = new utils_js_1.List();
        i = 0;
        edge = origEdges[i];
        newEdges.add(edge);
        this.edgeOrientations.add(LR.LEFT);
        let firstPoint;
        let lastPoint;
        if (criterion == "vertex") {
            firstPoint = edge.LeftVertex;
            lastPoint = edge.RightVertex;
        }
        else {
            firstPoint = edge.LeftSite;
            lastPoint = edge.RightSite;
        }
        if (firstPoint == vertex_js_1.Vertex.VERTEX_AT_INFINITY || lastPoint == vertex_js_1.Vertex.VERTEX_AT_INFINITY) {
            return new Edge[0];
        }
        done[i] = true;
        nDone++;
        while (nDone < n) {
            for (i = 1; i < n; i++) {
                if (done[i]) {
                    continue;
                }
                edge = origEdges[i];
                let leftPoint;
                let rightPoint;
                if (criterion == "vertex") {
                    leftPoint = edge.LeftVertex;
                    rightPoint = edge.RightVertex;
                }
                else {
                    leftPoint = edge.LeftSite;
                    rightPoint = edge.RightSite;
                }
                if (leftPoint == vertex_js_1.Vertex.VERTEX_AT_INFINITY || rightPoint == vertex_js_1.Vertex.VERTEX_AT_INFINITY) {
                    return new Edge[0];
                }
                if (leftPoint == lastPoint) {
                    lastPoint = rightPoint;
                    this.edgeOrientations.add(LR.LEFT);
                    newEdges.add(edge);
                    done[i] = true;
                }
                else if (rightPoint == firstPoint) {
                    firstPoint = leftPoint;
                    this.edgeOrientations.insert(0, LR.LEFT);
                    newEdges.insert(0, edge);
                    done[i] = true;
                }
                else if (leftPoint == firstPoint) {
                    firstPoint = rightPoint;
                    this.edgeOrientations.insert(0, LR.RIGHT);
                    newEdges.insert(0, edge);
                    done[i] = true;
                }
                else if (rightPoint == lastPoint) {
                    lastPoint = leftPoint;
                    this.edgeOrientations.add(LR.RIGHT);
                    newEdges.add(edge);
                    done[i] = true;
                }
                if (done[i]) {
                    nDone++;
                }
            }
        }
        //Convert back to array
        let ar = new Array(0);
        for (let ex = 0; ex < newEdges.size(); ++ex) {
            ar.push(newEdges.get(ex));
        }
        return ar;
    }
}
exports.EdgeReorderer = EdgeReorderer;
class EdgeList {
    constructor(xmin, deltaX, int_sqrtSitesNb) {
        this.xmin = xmin;
        this.deltaX = deltaX;
        this.hashSize = int_sqrtSitesNb * 2;
        this.hash = new Array(this.hashSize);
        //Two dummy halfedges:
        this.leftEnd = halfedge_js_1.Halfedge.CreateDummy();
        this.rightEnd = halfedge_js_1.Halfedge.CreateDummy();
        this.leftEnd.edgeListLeftNeighbor = null;
        this.leftEnd.edgeListRightNeighbor = this.rightEnd;
        this.rightEnd.edgeListLeftNeighbor = this.leftEnd;
        this.rightEnd.edgeListRightNeighbor = null;
        this.hash[0] = this.leftEnd;
        this.hash[this.hashSize - 1] = this.rightEnd;
    }
    get LeftEnd() { return this.leftEnd; }
    get RightEnd() { return this.rightEnd; }
    /*
         * Insert newHalfedge to the right of lb
         * @param lb
         * @param newHalfedge
         */
    Insert(lb, newHalfedge) {
        newHalfedge.edgeListLeftNeighbor = lb;
        newHalfedge.edgeListRightNeighbor = lb.edgeListRightNeighbor;
        lb.edgeListRightNeighbor.edgeListLeftNeighbor = newHalfedge;
        lb.edgeListRightNeighbor = newHalfedge;
    }
    /*
     * This function only removes the Halfedge from the left-right list.
     * We cannot dispose it yet because we are still using it.
     * @param halfEdge
     */
    Remove(halfedge) {
        halfedge.edgeListLeftNeighbor.edgeListRightNeighbor = halfedge.edgeListRightNeighbor;
        halfedge.edgeListRightNeighbor.edgeListLeftNeighbor = halfedge.edgeListLeftNeighbor;
        halfedge.edge = Edge.DELETED;
        halfedge.edgeListLeftNeighbor = halfedge.edgeListRightNeighbor = null;
    }
    /*
     * Find the rightmost Halfedge that is still elft of p
     * @param p
     * @return
     */
    EdgeListLeftNeighbor(p) {
        let bucket;
        let halfedge;
        // Use hash table to get close to desired halfedge
        bucket = utils_js_1.roundToInt((p.x - this.xmin) / this.deltaX * this.hashSize);
        if (bucket < 0) {
            bucket = utils_js_1.roundToInt(0);
        }
        if (bucket >= this.hashSize) {
            bucket = utils_js_1.roundToInt(this.hashSize - 1);
        }
        halfedge = this.GetHash(bucket);
        if (halfedge == null) {
            for (let i = 0; true; i++) {
                if ((halfedge = this.GetHash(bucket - i)) != null)
                    break;
                if ((halfedge = this.GetHash(bucket + i)) != null)
                    break;
            }
        }
        // Now search linear list of haledges for the correct one
        if (halfedge == this.leftEnd || (halfedge != this.rightEnd && halfedge.IsLeftOf(p))) {
            do {
                halfedge = halfedge.edgeListRightNeighbor;
            } while (halfedge != this.rightEnd && halfedge.IsLeftOf(p));
            halfedge = halfedge.edgeListLeftNeighbor;
        }
        else {
            do {
                halfedge = halfedge.edgeListLeftNeighbor;
            } while (halfedge != this.leftEnd && !halfedge.IsLeftOf(p));
        }
        // Update hash table and reference counts
        if (bucket > 0 && bucket < this.hashSize - 1) {
            this.hash[bucket] = halfedge;
        }
        return halfedge;
    }
    // Get entry from the has table, pruning any deleted nodes
    GetHash(int_b) {
        let halfedge;
        if (int_b < 0 || int_b >= this.hashSize) {
            return null;
        }
        halfedge = this.hash[int_b];
        if (halfedge != null && halfedge.edge == Edge.DELETED) {
            // Hash table points to deleted halfedge. Patch as necessary
            this.hash[int_b] = null;
            // Still can't dispose halfedge yet!
            return null;
        }
        else {
            return halfedge;
        }
    }
    Dispose() {
        let halfedge = this.leftEnd;
        let prevHe;
        while (halfedge != this.rightEnd) {
            prevHe = halfedge;
            halfedge = halfedge.edgeListRightNeighbor;
            prevHe.Dispose();
        }
        this.leftEnd = null;
        this.rightEnd.Dispose();
        this.rightEnd = null;
        this.hash = null;
    }
}
exports.EdgeList = EdgeList;
