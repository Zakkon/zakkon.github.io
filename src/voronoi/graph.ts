import { Rectf, Vector2f, roundToInt, Int } from "../utils.js";
import { SiteList, Site } from "./site.js";
import { Edge, LR, EdgeList } from "./edge.js";
import { Vertex } from "./vertex.js";
import { Halfedge, HalfedgePriorityQueue } from "./halfedge.js";
import { Triangle } from "./triangle.js";

export class VoronoiGraph {
    bounds: Rectf;
    sites: SiteList;
    //sitesIndexedByLocation: Map<Vector2f, Site>; //Todo: check equals of vector2f
    sitesIndexedByID: Map<number, Site>;
    edges: Edge[];
	triangles: Triangle[];
	disposeVertsWhenDone: boolean = false;
	cachedVerts: Vertex[];

		constructor(lPoints: Vector2f[], plotBounds: Rectf, iLloydIterations: number) { //Take a DOM as a parameter (interesting!)
			this.sitesIndexedByID = new Map<number, Site>();
        this._Init(lPoints, plotBounds);
    }

    private _Init(points: Vector2f[], bounds: Rectf) {
        this.sites = new SiteList();
        this.AddSites(points);
        this.triangles = [];
        this.edges = [];
		this.bounds = bounds;

        this.FortunesAlgorithm();
    }

    private AddSites(points: Vector2f[]) {
        for (var i = 0; i < points.length; ++i) {
            this.AddSite(points[i], i); //TODO: Make sure that no sites have id 0, we will use 0 as our 'null' value
        }
    }
    private AddSite(p: Vector2f, index: number) {
        let weight = 0;
		let s: Site = Site.Create(p, index, weight);
		this.sites.Add(s);
		//this.sitesIndexedByLocation[p] = s;
		this.sitesIndexedByID[index] = s;
    }

    private FortunesAlgorithm() {
		let newSite, bottomSite, topSite, tempSite : Site;
		let v, vertex : Vertex;
		let newIntStar: Vector2f = new Vector2f(0,0);
		let leftRight: LR;
		let lbnd, rbnd, llbnd, rrbnd, bisector: Halfedge;
		let edge: Edge;

		let dataBounds: Rectf = this.sites.GetSitesBounds();

		let sqrtSitesNb: Int = roundToInt(Math.sqrt(this.sites.Count + 4));
		let heap: HalfedgePriorityQueue = new HalfedgePriorityQueue(dataBounds.y, dataBounds.height, sqrtSitesNb);
		let edgeList: EdgeList = new EdgeList(dataBounds.x, dataBounds.width, sqrtSitesNb);
		let halfEdges: Halfedge[] = [];
		let vertices: Vertex[] = [];

		let bottomMostSite: Site = this.sites.Next();
		newSite = this.sites.Next();

		while (true) {
			if (!heap.Empty()) { newIntStar = heap.Min(); }

			if (newSite != null &&
				(heap.Empty() || VoronoiGraph.CompareByYThenX(newSite, newIntStar) < 0)) {
				// New site is smallest
				//Debug.Log("smallest: new site " + newSite);

				// Step 8:
				lbnd = edgeList.EdgeListLeftNeighbor(newSite.Coord);	// The halfedge just to the left of newSite
				//UnityEngine.Debug.Log("lbnd: " + lbnd);
				rbnd = lbnd.edgeListRightNeighbor;		// The halfedge just to the right
				//UnityEngine.Debug.Log("rbnd: " + rbnd);
				bottomSite = this.RightRegion(lbnd, bottomMostSite); // This is the same as leftRegion(rbnd)
				// This Site determines the region containing the new site
				//UnityEngine.Debug.Log("new Site is in region of existing site: " + bottomSite);

				// Step 9
				edge = Edge.CreateBisectingEdge(bottomSite, newSite);
				//UnityEngine.Debug.Log("new edge: " + edge);
				this.edges.push(edge);

				bisector = Halfedge.Create(edge, LR.LEFT);
				halfEdges.push(bisector);
				// Inserting two halfedges into edgelist constitutes Step 10:
				// Insert bisector to the right of lbnd:
				edgeList.Insert(lbnd, bisector);

				// First half of Step 11:
				if ((vertex = Vertex.Intersect(lbnd, bisector)) != null) {
					vertices.push(vertex);
					heap.Remove(lbnd);
					lbnd.vertex = vertex;
					lbnd.ystar = vertex.y + newSite.Dist(vertex);
					heap.Insert(lbnd);
				}

				lbnd = bisector;
				bisector = Halfedge.Create(edge, LR.RIGHT);
				halfEdges.push(bisector);
				// Second halfedge for Step 10::
				// Insert bisector to the right of lbnd:
				edgeList.Insert(lbnd, bisector);

				// Second half of Step 11:
				if ((vertex = Vertex.Intersect(bisector, rbnd)) != null) {
					vertices.push(vertex);
					bisector.vertex = vertex;
					bisector.ystar = vertex.y + newSite.Dist(vertex);
					heap.Insert(bisector);
				}

				newSite = this.sites.Next();
			}
			else if (!heap.Empty())
			{
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
				leftRight = LR.LEFT;
				if (bottomSite.y > topSite.y) {
					tempSite = bottomSite;
					bottomSite = topSite;
					topSite = tempSite;
					leftRight = LR.RIGHT;
				}
				edge = Edge.CreateBisectingEdge(bottomSite, topSite);
				this.edges.push(edge);
				bisector = Halfedge.Create(edge, leftRight);
				halfEdges.push(bisector);
				edgeList.Insert(llbnd, bisector);
				edge.SetVertex(LR.Other(leftRight), v);
				if ((vertex = Vertex.Intersect(llbnd, bisector)) != null) {
					vertices.push(vertex);
					heap.Remove(llbnd);
					llbnd.vertex = vertex;
					llbnd.ystar = vertex.y + bottomSite.Dist(vertex);
					heap.Insert(llbnd);
				}
				if ((vertex = Vertex.Intersect(bisector, rrbnd)) != null) {
					vertices.push(vertex);
					bisector.vertex = vertex;
					bisector.ystar = vertex.y + bottomSite.Dist(vertex);
					heap.Insert(bisector);
				}
			}
			else { break; }
		}

		// Heap should be empty now
		heap.Dispose();
		edgeList.Dispose();

		for (let halfedge of halfEdges) { halfedge.ReallyDispose(); }
		halfEdges = [];

		// we need the vertices to clip the edges
		for (let e of this.edges) { e.ClipVertices(this.bounds); }

		if (this.disposeVertsWhenDone) {
			// But we don't actually ever use them again!
			for(let ve of vertices) { ve.Dispose(); }
			vertices = [];
		}
		else { this.cachedVerts = vertices; }
	}

	public static CompareByYThenX(s1: Vector2f, s2: Vector2f) {
		if (s1.y < s2.y) return -1;
		if (s1.y > s2.y) return 1;
		if (s1.x < s2.x) return -1;
		if (s1.x > s2.x) return 1;
		return 0;
	}

	public Regions(): Vector2f[][] { return this.sites.Regions(this.bounds); }
	private LeftRegion(he: Halfedge, bottomMostSite: Site): Site {
		let edge = he.edge;
		if (edge == null) { return bottomMostSite; }
		return edge.Site(he.leftRight);
	}
	private RightRegion(he: Halfedge, bottomMostSite: Site): Site {
		let edge = he.edge;
		if (edge == null) { return bottomMostSite; }
		return edge.Site(LR.Other(he.leftRight));
	}
}