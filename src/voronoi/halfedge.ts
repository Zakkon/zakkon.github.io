import {Edge, LR} from './edge.js';
import {Vertex} from './vertex.js';
import {Site} from './site.js';
import {Queue} from 'queue-typescript';
import {Vector2f, Int, roundToInt, assertAsInt} from '../utils.js';

//Complete!
export class Halfedge {
    edge: Edge;
    leftRight: LR;
    vertex: Vertex;
    ystar: number;
    edgeListLeftNeighbor: Halfedge;
    edgeListRightNeighbor: Halfedge;
    nextInPriorityQueue: Halfedge;

    constructor(edge: Edge, lr: LR) { this.Init(edge, lr); }

	private Init(edge: Edge, lr: LR): Halfedge {
        this.edge = edge; this.leftRight = lr;
        this.vertex = null;
		this.nextInPriorityQueue = null;
		return this;
    }

	public IsLeftOf(p: Vector2f) {
		var topSite: Site;
		var rightOfSite, above, fast : boolean;
		var dxp, dyp, dxs, t1, t2, t3, y1 : number;

		topSite = this.edge.RightSite;
		rightOfSite = p.x > topSite.x;
		if (rightOfSite && this.leftRight == LR.LEFT) {
			return true;
		}
		if (!rightOfSite && this.leftRight == LR.RIGHT) {
			return false;
		}

		if (this.edge.a == 1) {
			dyp = p.y - topSite.y;
			dxp = p.x - topSite.x;
			fast = false;
			if ((!rightOfSite && this.edge.b < 0) || (rightOfSite && this.edge.b >= 0)) {
				above = dyp >= this.edge.b * dxp;
				fast = above;
			} else {
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
		} else {
			y1 = this.edge.c - this.edge.a * p.x;
			t1 = p.y - y1;
			t2 = p.x - topSite.x;
			t3 = y1 - topSite.y;
			above = t1 * t1 > t2 * t2 + t3 * t3;
		}
		return this.leftRight == LR.LEFT ? above : !above;
	}

	//Will this work?
	public ToString() { return "Halfedge (LeftRight: " + this.leftRight + "; vertex: " + this.vertex + ")"; }

	public Dispose() {
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
	public ReallyDispose() {
		this.edgeListLeftNeighbor = null;
		this.edgeListRightNeighbor = null;
		this.nextInPriorityQueue = null;
		this.edge = null;
		this.leftRight = null;
		this.vertex = null;
		Halfedge.pool.enqueue(this);
	}
	private static pool: Queue<Halfedge> = new Queue<Halfedge>();

	public static Create(edge: Edge, lr: LR): Halfedge {
		if (Halfedge.pool.length > 0) {
			return Halfedge.pool.dequeue().Init(edge, lr);
		} else {
			return new Halfedge(edge, lr);
		}
	}
	public static CreateDummy(): Halfedge {
		return Halfedge.Create(null, null);
	}
}

// Also know as heap
//Complete!
export class HalfedgePriorityQueue {

	private hash: Halfedge[];
	private count: number;
	private minBucked: number;
	private hashSize: number;

	private ymin: number;
	private deltaY: number;

	constructor(ymin: number, deltaY: number, int_sqrtSitesNb: number) {
		this.ymin = ymin;
		this.deltaY = deltaY;
		this.hashSize = 4 * int_sqrtSitesNb;
		this.Init();
	}

	public Dispose() {
		// Get rid of dummies
		for (let i = 0; i < this.hashSize; i++) {
			this.hash[i].Dispose();
		}
		this.hash = null;
	}

	public Init() {
		this.count = 0;
		this.minBucked = 0;
		this.hash = new Array(this.hashSize);
		// Dummy Halfedge at the top of each hash
		for (let i = 0; i < this.hashSize; i++) {
			this.hash[i] = Halfedge.CreateDummy();
			this.hash[i].nextInPriorityQueue = null;
		}
	}

	public Insert(halfedge: Halfedge) {
		let previous, next: Halfedge;

		let insertionBucket: Int = this.Bucket(halfedge);
		if (insertionBucket < this.minBucked) { this.minBucked = insertionBucket; }
		previous = this.hash[insertionBucket];
		while ((next = previous.nextInPriorityQueue) != null &&
			(halfedge.ystar > next.ystar || (halfedge.ystar == next.ystar && halfedge.vertex.x > next.vertex.x))) {
			previous = next;
		}
		halfedge.nextInPriorityQueue = previous.nextInPriorityQueue;
		previous.nextInPriorityQueue = halfedge;
		this.count++;
	}

	public Remove(halfedge: Halfedge) {
		let previous: Halfedge;
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

	private Bucket(halfedge: Halfedge): Int {
		let theBucket: Int = roundToInt((halfedge.ystar - this.ymin) / this.deltaY * this.hashSize);
		if (theBucket < 0) { theBucket = assertAsInt(0); }
		if (theBucket >= this.hashSize) { theBucket = assertAsInt(this.hashSize - 1); }
		return theBucket;
	}

	private IsEmpty(bucket: Int): boolean {
		return (this.hash[bucket].nextInPriorityQueue == null);
	}

	/*
	 * move minBucket until it contains an actual Halfedge (not just the dummy at the top);
	 */
	private AdjustMinBucket() {
		while (this.minBucked < this.hashSize - 1 && this.IsEmpty(assertAsInt(this.minBucked))) {
			this.minBucked++;
		}
	}

	public Empty(): boolean {
		return this.count == 0;
	}

	/*
	 * @return coordinates of the Halfedge's vertex in V*, the transformed Voronoi diagram
	 */
	public Min(): Vector2f {
		this.AdjustMinBucket();
		let answer = this.hash[this.minBucked].nextInPriorityQueue;
		return new Vector2f(answer.vertex.x, answer.ystar);
	}

	/*
	 * Remove and return the min Halfedge
	 */
	public ExtractMin(): Halfedge {
		let answer: Halfedge;

		// Get the first real Halfedge in minBucket
		answer = this.hash[this.minBucked].nextInPriorityQueue;

		this.hash[this.minBucked].nextInPriorityQueue = answer.nextInPriorityQueue;
		this.count--;
		answer.nextInPriorityQueue = null;

		return answer;
	}
}