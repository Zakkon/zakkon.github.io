import { Vector2f, Rectf } from "../utils";
import { Site } from "../voronoi/site";

export class BaseCell{
  public ID: number; //ushort
  public Height: number; //float
  public Temperature: number; //float
  public Precipitation: number; //float
  public IsLand: boolean;
  public IsBorder: boolean = false;
  public BiomeID: number; //int
  public Coord: Vector2f;

  constructor(){}
}

export class PolygonCell extends BaseCell{
  public Verts: Vector2f[];
  protected quadTreeRect: Rectf;
  public get Rectangle(): Rectf {return this.quadTreeRect};

  constructor(){super();}

  protected SetVerts(verts: Vector2f[])
  {
    this.Verts = verts;
    let lowestX = Number.MAX_VALUE;
    let lowestY = Number.MAX_VALUE;
    let highestX = Number.MIN_VALUE;
    let highestY = Number.MIN_VALUE;
    for(let v of verts)
    {
        if(v.x < lowestX) { lowestX = v.x; }
        if(v.x > highestX) { highestX = v.x; }
        if (v.y < lowestY) { lowestY = v.y; }
        if (v.y > highestY) { highestY = v.y; }
    }
    this.quadTreeRect = new Rectf(lowestX, lowestY, highestX - lowestX, highestY - lowestY);
  }
}

export class VoroCell extends PolygonCell{
  public Site : Site;
  
  constructor(id: number, s: Site)
  {
    super();
    this.ID = id;
    this.Site = s;
    this.Coord = s.Coord;
    //Calculate if we are an edge cell
    for(var i = 0; i < this.Site.Edges.length; ++i)
    {
        if (!this.Site.Edges[i].Visible()) { this.IsBorder = true; break; }
    }
  }

  public AssignVerts() : void
  {
    super.SetVerts(this.Site.region);
  }
}