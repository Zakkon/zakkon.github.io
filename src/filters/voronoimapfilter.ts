import { Vector2f, Rectf } from "../utils";
import { VoronoiGraph } from "../voronoi/graph";
import { VoroCell } from "./basecell";

export class VoronoiMapFilter
{
  private mapW: number;
  private mapH: number;
  public graph: VoronoiGraph;
  public cells: VoroCell[];
  public cellsByID: VoroCell[];

  constructor(mapWidth: number, mapHeight: number)
  {
    this.mapW = mapWidth; this.mapH = mapHeight;
  }
  public CreateGraph(points: Vector2f[], lloydRelaxations: number): void
  {
      //Create the voronoi itself
      this.graph = new VoronoiGraph(points, new Rectf(0, 0, this.mapW, this.mapH), lloydRelaxations);
      var re = this.graph.Regions(); //Important
      this.CreateCells();
  }

  private CreateCells(): void{
    this.cells = [];;
    var cellsDict = new Map<number, VoroCell>();
    for(var s of this.graph.sites.sites)
    {
        var cellID = s.SiteIndex;
        var c = new VoroCell(cellID, s);
        this.cells.push(c); //Create a new cell and remember it by its ID
        cellsDict.set(c.ID, c);
    }
    this.cellsByID = new Array(this.cells.length + 1); //Adding an extra slot just to be safe. Hopefully we wont run into nullrefs. This array shouldnt be iterated over anyway
    console.log("len " + this.graph.sites.sites.length);
    for(let c of this.cells)
    {
        this.cellsByID[c.ID] = c;
        c.AssignVerts();
    }
  }
}