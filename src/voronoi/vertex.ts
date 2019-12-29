import {Queue} from 'queue-typescript';
import {Vector2f} from '../utils.js';
import {Halfedge} from './halfedge.js';
import {Edge, LR} from './edge.js';
import {VoronoiGraph} from './graph.js';

//Complete!
export class Vertex {
    public static readonly VERTEX_AT_INFINITY: Vertex = new Vertex(new Vector2f(NaN, NaN), -1);

    Coord: Vector2f;
    private vertexIndex: number = 0;
    public get VertexIndex() { return this.vertexIndex; }
    public get x() { return this.Coord.x; }
    public get y() { return this.Coord.y; }

	constructor(pos: Vector2f, index: number) {
		//Lets use -1 as 'null' value. So if we see that, make a new index for us
		if (index < 0) { this.SetIndex(); } else { this.vertexIndex = index; }
		this.Init(pos);
	}
	private Init(pos: Vector2f): Vertex {
		this.Coord = pos;
		return this;
	}

	public SetPos(pos: Vector2f) { this.Coord = pos; }
	//Easy way to give us a unique index
    public SetIndex() { this.vertexIndex = Vertex.nVertices; Vertex.nVertices++; }

    /*
		 * This is the only way to make a Vertex
		 * 
		 * @param halfedge0
		 * @param halfedge1
		 * @return
		 * 
		 */
	public static Intersect(halfedge0: Halfedge, halfedge1: Halfedge): Vertex {
		let edge, edge0, edge1: Edge;
		let halfedge: Halfedge;
		let determinant, intersectionX, intersectionY: number;
		let rightOfSite: boolean;

		edge0 = halfedge0.edge;
		edge1 = halfedge1.edge;
		if (edge0 == null || edge1 == null) { return null; }
		if (edge0.RightSite == edge1.RightSite) { return null; }

		determinant = edge0.a * edge1.b - edge0.b * edge1.a;
		if (Math.abs(determinant) < 1E-10) {
			// The edges are parallel
			return null;
		}

		intersectionX = (edge0.c * edge1.b - edge1.c * edge0.b) / determinant;
		intersectionY = (edge1.c * edge0.a - edge0.c * edge1.a) / determinant;

		if (VoronoiGraph.CompareByYThenX(edge0.RightSite.Coord, edge1.RightSite.Coord) < 0) {
			halfedge = halfedge0;
			edge = edge0;
		} else {
			halfedge = halfedge1;
			edge = edge1;
		}
		rightOfSite = intersectionX >= edge.RightSite.x;
		if ((rightOfSite && halfedge.leftRight == LR.LEFT) ||
			(!rightOfSite && halfedge.leftRight == LR.RIGHT)) {
			return null;
		}

		return Vertex.Create(intersectionX, intersectionY);
	}

	private static pool: Queue<Vertex> = new Queue<Vertex>();
	public static nVertices: number = 0;

	private static Create(x: number, y: number) {
		if (x == NaN || y == NaN) { return Vertex.VERTEX_AT_INFINITY; }
		if (Vertex.pool.length > 0) { return Vertex.pool.dequeue().Init(new Vector2f(x,y)); }
		else { return new Vertex(new Vector2f(x, y), -1); } //Use -1 as null index, new index will be created for us
	}
	public Dispose() {
		this.Coord = new Vector2f(0, 0);
		Vertex.pool.enqueue(this);
	}
	public toString(): string { return "Vertex (" + this.vertexIndex.toString() + ")"; }
}