import {Queue} from 'queue-typescript';
import {Edge, LR, EdgeReorderer} from './edge.js';
import {Vector2f, Rectf, BoundsCheck, List} from '../utils.js';
import {VoronoiGraph} from './graph.js';

export class Site {
    Coord: Vector2f;
    private edges: Edge[];
    public get Edges():Edge[] {return this.edges;}
    public get x() { return this.Coord.x; }
    public get y() { return this.Coord.y; }
    private weight: number;
    private siteIndex: number;
    public get SiteIndex() { return this.siteIndex; }
    // which end of each edge hooks up with the previous edge in edges:
    private edgeOrientations: List<LR>;
    // ordered list of points that define the region clipped to bounds:
    public region: Vector2f[];

    constructor(pos: Vector2f, index: number, fWeight: number) {
        this.Init(pos, index, fWeight);
    }

    public Init(pos: Vector2f, index: number, weight: number): Site {
        this.edges = new Array(0);
        this.region = new Array(0);
        this.Coord = pos; this.weight = weight;
        this.siteIndex = index;
        return this;
    }

    private static pool: Queue<Site>;
    public static Create(p: Vector2f, index: number, weight: number): Site {
        if (this.pool == null) { this.pool = new Queue<Site>(); } //Initialize if needed
        if (this.pool.length > 0) { return this.pool.dequeue().Init(p, index, weight); }
        else { return new Site(p, index, weight); }
    }

    private static _sortSites(s0: Site, s1: Site) {
        var returnValue: number = VoronoiGraph.CompareByYThenX(s0.Coord, s1.Coord);
        let tempIndex: number;
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
    public static SortSites(sites: Site[]) {
        sites.sort(Site._sortSites);
    }
    public Compare(s1: Site, s2: Site) {
        return s1.CompareTo(s2);
    }
    public CompareTo(s1: Site) {
        var returnValue = VoronoiGraph.CompareByYThenX(this.Coord, s1.Coord);

        let tempIndex: number;

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

    public AddEdge(edge: Edge) {
        this.edges.push(edge);
    }

    public NearestEdge(): Edge {
        this.edges.sort(Edge.CompareSitesDistances);
        return this.edges[0];
    }

    public Region(clippingBounds: Rectf) {
        if (this.edges == null || this.edges == undefined || this.edges.length == 0 || this.edges.length == undefined) {
            return new Vector2f[0];
        }
        if (this.edgeOrientations == null) {
            this.ReorderEdges();
            if(this.edges.length == undefined){console.log("still broken");}
            this.region = this.ClipToBounds(clippingBounds);
            if ((new Polygon(this.region)).PolyWinding() == Winding.CLOCKWISE) {
                this.region.reverse();
            }
        }
        return this.region;
    }

    private ClipToBounds(bounds: Rectf): Vector2f[] {
        let points: Vector2f[] = [];
        let n: number = this.edges.length;
        let i: number = 0;

        while (i < n && !this.edges[i].Visible()) { i++; }

        if (i == n) {
            // No edges visible
            return new Array(0);
        }
        let edge: Edge = this.edges[i];
        let orientation: LR = this.edgeOrientations[i];
        let clends = edge.ClippedEnds;
        points.push(clends[orientation.index]);
        points.push(clends[LR.Other(orientation).index]);

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

    private Connect(points: Vector2f[], int_j: number, bounds: Rectf, closingUp: boolean = false) : Vector2f[] {
        let rightPoint: Vector2f = points[points.length - 1];
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
            let rightCheck = BoundsCheck.Check(rightPoint, bounds);
            let newCheck = BoundsCheck.Check(newPoint, bounds);
            let px, py: number;
            if ((rightCheck & BoundsCheck.RIGHT) != 0) {
                px = bounds.right;

                if ((newCheck & BoundsCheck.BOTTOM) != 0) {
                    py = bounds.bottom;
                    points.push(new Vector2f(px, py));

                } else if ((newCheck & BoundsCheck.TOP) != 0) {
                    py = bounds.top;
                    points.push(new Vector2f(px, py));

                } else if ((newCheck & BoundsCheck.LEFT) != 0) {
                    if (rightPoint.y - bounds.y + newPoint.y - bounds.y < bounds.height) {
                        py = bounds.top;
                    } else {
                        py = bounds.bottom;
                    }
                    points.push(new Vector2f(px, py));
                    points.push(new Vector2f(bounds.left, py));
                }
            } else if ((rightCheck & BoundsCheck.LEFT) != 0) {
                px = bounds.left;

                if ((newCheck & BoundsCheck.BOTTOM) != 0) {
                    py = bounds.bottom;
                    points.push(new Vector2f(px, py));

                } else if ((newCheck & BoundsCheck.TOP) != 0) {
                    py = bounds.top;
                    points.push(new Vector2f(px, py));

                } else if ((newCheck & BoundsCheck.RIGHT) != 0) {
                    if (rightPoint.y - bounds.y + newPoint.y - bounds.y < bounds.height) {
                        py = bounds.top;
                    } else {
                        py = bounds.bottom;
                    }
                    points.push(new Vector2f(px, py));
                    points.push(new Vector2f(bounds.right, py));
                }
            } else if ((rightCheck & BoundsCheck.TOP) != 0) {
                py = bounds.top;

                if ((newCheck & BoundsCheck.RIGHT) != 0) {
                    px = bounds.right;
                    points.push(new Vector2f(px, py));

                } else if ((newCheck & BoundsCheck.LEFT) != 0) {
                    px = bounds.left;
                    points.push(new Vector2f(px, py));

                } else if ((newCheck & BoundsCheck.BOTTOM) != 0) {
                    if (rightPoint.x - bounds.x + newPoint.x - bounds.x < bounds.width) {
                        px = bounds.left;
                    } else {
                        px = bounds.right;
                    }
                    points.push(new Vector2f(px, py));
                    points.push(new Vector2f(px, bounds.bottom));
                }
            } else if ((rightCheck & BoundsCheck.BOTTOM) != 0) {
                py = bounds.bottom;

                if ((newCheck & BoundsCheck.RIGHT) != 0) {
                    px = bounds.right;
                    points.push(new Vector2f(px, py));

                } else if ((newCheck & BoundsCheck.LEFT) != 0) {
                    px = bounds.left;
                    points.push(new Vector2f(px, py));

                } else if ((newCheck & BoundsCheck.TOP) != 0) {
                    if (rightPoint.x - bounds.x + newPoint.x - bounds.x < bounds.width) {
                        px = bounds.left;
                    } else {
                        px = bounds.right;
                    }
                    points.push(new Vector2f(px, py));
                    points.push(new Vector2f(px, bounds.top));
                }
            }
        }
        if (closingUp) {
            // newEdge's ends have already been added
            return points;
        }
        points.push(newPoint);
        }
        let newRightPoint: Vector2f = newEdge.ClippedEnds[LR.Other(newOrientation).index];
        if (!Site.CloseEnough(points[0], newRightPoint)) { points.push(newRightPoint); }
        return points;
    }

    public Dist(p: Vector2f): number {
        return this.Coord.subtract(p).magnitude;
    }

    private static readonly EPSILON: number = 0.005;
    private static CloseEnough(p0: Vector2f, p1: Vector2f): boolean {
        return p0.subtract(p1).magnitude < Site.EPSILON;
    }

    private ReorderEdges() {
        let reorderer: EdgeReorderer = new EdgeReorderer(this.edges, "vertex");
        this.edges = reorderer.Edges;
        this.edgeOrientations = reorderer.EdgeOrientations;
        reorderer.Dispose();
    }
}

export class SiteList {
    public sites: Site[];
    private currentIndex: number;
    private sorted: boolean;

    constructor() {
        this.sites = [];
        this.sorted = false;
      this.currentIndex = 0;
    }

    public Add(site: Site) {
        this.sorted = false;
        this.sites.push(site);
        return this.sites.length;
    }

    
    

    public get Count() { return this.sites.length; }

    public SortList() {
        Site.SortSites(this.sites);
        this.sorted = true;
    }
    public ResetListIndex() {
        this.currentIndex = 0;
    }
    public GetSitesBounds() {
        if (!this.sorted) {
            this.SortList();
            this.ResetListIndex();
        }
        var xmin, xmax, ymin, ymax: number;
        if (this.sites.length == 0) {
            return new Rectf(0, 0, 0, 0);
        }
        xmin = Number.MAX_VALUE; //Min and max floats
        xmax = Number.MIN_VALUE;
        for(let site of this.sites) { //In most cases you want to use 'of' and not 'in'
            if (site.x < xmin) xmin = site.x;
            if (site.x > xmax) xmax = site.x;
        }
        // here's where we assume that the sites have been sorted on y:
        ymin = this.sites[0].y;
        ymax = this.sites[this.sites.length - 1].y;

        return new Rectf(xmin, ymin, xmax - xmin, ymax - ymin);
    }

    public Regions(plotBounds: Rectf) {
        var regions: Vector2f[][] = new Array(0);
        for (let site of this.sites) { regions.push(site.Region(plotBounds)); }
        return regions;
    }

    public Next(): Site {
        if (!this.sorted) {
            throw new Error("SiteList.Next(): sites have not been sorted");
        }
        if (this.currentIndex < this.sites.length) {
            return this.sites[this.currentIndex++];
        } else {
            return null;
        }
    }
}

export enum Winding {
    CLOCKWISE, COUNTERCLOCKWISE, NONE
}

export class Polygon {

    private vertices: Vector2f[];

    constructor(vertices: Vector2f[]) { this.vertices = vertices; }

    public Area(): number { return Math.abs(this.SignedDoubleArea() * 0.5); }

    public PolyWinding(): Winding {
        let signedDoubleArea = this.SignedDoubleArea();
        if (signedDoubleArea < 0) {
            return Winding.CLOCKWISE;
        }
        if (signedDoubleArea > 0) {
            return Winding.COUNTERCLOCKWISE;
        }
        return Winding.NONE;
    }

    private SignedDoubleArea(): number {
        let index, nextIndex: number;
        let n = this.vertices.length;
        let point, next: Vector2f;
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
