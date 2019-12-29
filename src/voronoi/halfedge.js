"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const edge_js_1 = require("./edge.js");
const queue_typescript_1 = require("queue-typescript");
const utils_js_1 = require("../utils.js");
//Complete!
class Halfedge {
    constructor(edge, lr) {
        this.Init(edge, lr);
    }
    Init(edge, lr) {
        this.edge = edge;
        this.leftRight = lr;
        this.vertex = null;
        this.nextInPriorityQueue = null;
        return this;
    }
    IsLeftOf(p) {
        var topSite;
        var rightOfSite, above, fast;
        var dxp, dyp, dxs, t1, t2, t3, y1;
        topSite = this.edge.RightSite;
        rightOfSite = p.x > topSite.x;
        if (rightOfSite && this.leftRight == edge_js_1.LR.LEFT) {
            return true;
        }
        if (!rightOfSite && this.leftRight == edge_js_1.LR.RIGHT) {
            return false;
        }
        if (this.edge.a == 1) {
            dyp = p.y - topSite.y;
            dxp = p.x - topSite.x;
            fast = false;
            if ((!rightOfSite && this.edge.b < 0) || (rightOfSite && this.edge.b >= 0)) {
                above = dyp >= this.edge.b * dxp;
                fast = above;
            }
            else {
                above = p.x + p.y * this.edge.b > this.edge.c;
                if (this.edge.b < 0) {
                    above = !above;
                }
                if (!above) {
                    fast = true;
                }
            }
            if (!fast) {
                dxs = topSite.x - this.edge.LeftSite.x;
                above = this.edge.b * (dxp * dxp - dyp * dyp) < dxs * dyp * (1 + 2 * dxp / dxs + this.edge.b * this.edge.b);
                if (this.edge.b < 0) {
                    above = !above;
                }
            }
        }
        else {
            y1 = this.edge.c - this.edge.a * p.x;
            t1 = p.y - y1;
            t2 = p.x - topSite.x;
            t3 = y1 - topSite.y;
            above = t1 * t1 > t2 * t2 + t3 * t3;
        }
        return this.leftRight == edge_js_1.LR.LEFT ? above : !above;
    }
    //Will this work?
    ToString() { return "Halfedge (LeftRight: " + this.leftRight + "; vertex: " + this.vertex + ")"; }
    Dispose() {
        if (this.edgeListLeftNeighbor != null || this.edgeListRightNeighbor != null) {
            // still in EdgeList
            return;
        }
        if (this.nextInPriorityQueue != null) {
            // still in PriorityQueue
            return;
        }
        this.edge = null;
        this.leftRight = null;
        this.vertex = null;
        Halfedge.pool.enqueue(this);
    }
    ReallyDispose() {
        this.edgeListLeftNeighbor = null;
        this.edgeListRightNeighbor = null;
        this.nextInPriorityQueue = null;
        this.edge = null;
        this.leftRight = null;
        this.vertex = null;
        Halfedge.pool.enqueue(this);
    }
    static Create(edge, lr) {
        if (Halfedge.pool.length > 0) {
            return Halfedge.pool.dequeue().Init(edge, lr);
        }
        else {
            return new Halfedge(edge, lr);
        }
    }
    static CreateDummy() {
        return Halfedge.Create(null, null);
    }
}
exports.Halfedge = Halfedge;
Halfedge.pool = new queue_typescript_1.Queue();
// Also know as heap
//Complete!
class HalfedgePriorityQueue {
    constructor(ymin, deltaY, int_sqrtSitesNb) {
        this.ymin = ymin;
        this.deltaY = deltaY;
        this.hashSize = 4 * int_sqrtSitesNb;
        this.Init();
    }
    Dispose() {
        // Get rid of dummies
        for (let i = 0; i < this.hashSize; i++) {
            this.hash[i].Dispose();
        }
        this.hash = null;
    }
    Init() {
        this.count = 0;
        this.minBucked = 0;
        this.hash = new Array(this.hashSize);
        // Dummy Halfedge at the top of each hash
        for (let i = 0; i < this.hashSize; i++) {
            this.hash[i] = Halfedge.CreateDummy();
            this.hash[i].nextInPriorityQueue = null;
        }
    }
    Insert(halfedge) {
        let previous, next;
        let insertionBucket = this.Bucket(halfedge);
        if (insertionBucket < this.minBucked) {
            this.minBucked = insertionBucket;
        }
        previous = this.hash[insertionBucket];
        while ((next = previous.nextInPriorityQueue) != null &&
            (halfedge.ystar > next.ystar || (halfedge.ystar == next.ystar && halfedge.vertex.x > next.vertex.x))) {
            previous = next;
        }
        halfedge.nextInPriorityQueue = previous.nextInPriorityQueue;
        previous.nextInPriorityQueue = halfedge;
        this.count++;
    }
    Remove(halfedge) {
        let previous;
        let removalBucket = this.Bucket(halfedge);
        if (halfedge.vertex != null) {
            previous = this.hash[removalBucket];
            while (previous.nextInPriorityQueue != halfedge) {
                previous = previous.nextInPriorityQueue;
            }
            previous.nextInPriorityQueue = halfedge.nextInPriorityQueue;
            this.count--;
            halfedge.vertex = null;
            halfedge.nextInPriorityQueue = null;
            halfedge.Dispose();
        }
    }
    Bucket(halfedge) {
        let theBucket = utils_js_1.roundToInt((halfedge.ystar - this.ymin) / this.deltaY * this.hashSize);
        if (theBucket < 0) {
            theBucket = utils_js_1.assertAsInt(0);
        }
        if (theBucket >= this.hashSize) {
            theBucket = utils_js_1.assertAsInt(this.hashSize - 1);
        }
        return theBucket;
    }
    IsEmpty(bucket) {
        return (this.hash[bucket].nextInPriorityQueue == null);
    }
    /*
     * move minBucket until it contains an actual Halfedge (not just the dummy at the top);
     */
    AdjustMinBucket() {
        while (this.minBucked < this.hashSize - 1 && this.IsEmpty(utils_js_1.assertAsInt(this.minBucked))) {
            this.minBucked++;
        }
    }
    Empty() {
        return this.count == 0;
    }
    /*
     * @return coordinates of the Halfedge's vertex in V*, the transformed Voronoi diagram
     */
    Min() {
        this.AdjustMinBucket();
        let answer = this.hash[this.minBucked].nextInPriorityQueue;
        return new utils_js_1.Vector2f(answer.vertex.x, answer.ystar);
    }
    /*
     * Remove and return the min Halfedge
     */
    ExtractMin() {
        let answer;
        // Get the first real Halfedge in minBucket
        answer = this.hash[this.minBucked].nextInPriorityQueue;
        this.hash[this.minBucked].nextInPriorityQueue = answer.nextInPriorityQueue;
        this.count--;
        answer.nextInPriorityQueue = null;
        return answer;
    }
}
exports.HalfedgePriorityQueue = HalfedgePriorityQueue;
