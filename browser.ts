import { VoroCell } from "./src/filters/basecell";
import * as d3 from "d3-selection";
import { Shapes, ECurve } from "./src/shapes";

export class Browser{
  constructor(){}
  public Draw(cell: VoroCell):void{
    var el = d3.select("#map");
    var p = el.append("path");
    var str = Shapes.CurveAround(Shapes.CoastlineAround(cell), ECurve.CurveBasisClosed);
    p.attr("path", str);
  }
  public Test1(): void{
    console.log("looking for label");
    var el = d3.select("#label");
    console.log("Found label? " + !!(el != null).toString());
    var child = el.append("g");
    console.log("Made child? " + !!(child != null).toString());
  }
}