"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queue_typescript_1 = require("queue-typescript");
const utils_js_1 = require("../utils.js");
const edge_js_1 = require("./edge.js");
const graph_js_1 = require("./graph.js");
//Complete!
class Vertex {
    constructor(pos, index) {
        this.vertexIndex = 0;
        //Lets use -1 as 'null' value. So if we see that, make a new index for us
        if (index < 0) {
            this.SetIndex();
        }
        else {
            this.vertexIndex = index;
        }
        this.Init(pos);
    }
    get VertexIndex() { return this.vertexIndex; }
    get x() { return this.Coord.x; }
    get y() { return this.Coord.y; }
    Init(pos) {
        this.Coord = pos;
        return this;
    }
    SetPos(pos) { this.Coord = pos; }
    //Easy way to give us a unique index
    SetIndex() { this.vertexIndex = Vertex.nVertices; Vertex.nVertices++; }
    /*
         * This is the only way to make a Vertex
         *
         * @param halfedge0
         * @param halfedge1
         * @return
         *
         */
    static Intersect(halfedge0, halfedge1) {
        let edge, edge0, edge1;
        let halfedge;
        let determinant, intersectionX, intersectionY;
        let rightOfSite;
        edge0 = halfedge0.edge;
        edge1 = halfedge1.edge;
        if (edge0 == null || edge1 == null) {
            return null;
        }
        if (edge0.RightSite == edge1.RightSite) {
            return null;
        }
        determinant = edge0.a * edge1.b - edge0.b * edge1.a;
        if (Math.abs(determinant) < 1E-10) {
            // The edges are parallel
            return null;
        }
        intersectionX = (edge0.c * edge1.b - edge1.c * edge0.b) / determinant;
        intersectionY = (edge1.c * edge0.a - edge0.c * edge1.a) / determinant;
        if (graph_js_1.VoronoiGraph.CompareByYThenX(edge0.RightSite.Coord, edge1.RightSite.Coord) < 0) {
            halfedge = halfedge0;
            edge = edge0;
        }
        else {
            halfedge = halfedge1;
            edge = edge1;
        }
        rightOfSite = intersectionX >= edge.RightSite.x;
        if ((rightOfSite && halfedge.leftRight == edge_js_1.LR.LEFT) ||
            (!rightOfSite && halfedge.leftRight == edge_js_1.LR.RIGHT)) {
            return null;
        }
        return Vertex.Create(intersectionX, intersectionY);
    }
    static Create(x, y) {
        if (x == NaN || y == NaN) {
            return Vertex.VERTEX_AT_INFINITY;
        }
        if (Vertex.pool.length > 0) {
            return Vertex.pool.dequeue().Init(new utils_js_1.Vector2f(x, y));
        }
        else {
            return new Vertex(new utils_js_1.Vector2f(x, y), -1);
        } //Use -1 as null index, new index will be created for us
    }
    Dispose() {
        this.Coord = new utils_js_1.Vector2f(0, 0);
        Vertex.pool.enqueue(this);
    }
    toString() { return "Vertex (" + this.vertexIndex.toString() + ")"; }
}
exports.Vertex = Vertex;
Vertex.VERTEX_AT_INFINITY = new Vertex(new utils_js_1.Vector2f(NaN, NaN), -1);
Vertex.pool = new queue_typescript_1.Queue();
Vertex.nVertices = 0;
