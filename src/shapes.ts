import { Vector2f } from "./utils";
import * as d3 from 'd3';
import { VoroCell } from "./filters/basecell";

export class Shapes{
  public static CurveAround(points: Vector2f[], t: ECurve){
        let ps = Shapes.toV2Array(points);
        var s;
        if (t == ECurve.CurveBasis) { s = d3.line().curve(d3.curveBasis)(ps); }
        else { s = d3.line().curve(d3.curveBasisClosed)(ps); }
        console.log(s);
        return s;
  }

  public static CoastlineAround(cell: VoroCell) : Vector2f[]
  {
    return cell.Verts; //Keep it simple for now
  }

  private static toV2Array(points: Vector2f[]) {
    var ps = [];
    var i;
    for (i = 0; i < points.length; i++) {
        ps.push([points[i].x, points[i].y]);
    }
    return ps;
  }
}


export enum ECurve{
  CurveBasis, CurveBasisClosed,
}