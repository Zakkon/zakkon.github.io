"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const d3 = __importStar(require("d3-selection"));
const shapes_1 = require("./src/shapes");
class Browser {
    constructor() { }
    Draw(cell) {
        var el = d3.select("#map");
        var p = el.append("path");
        var str = shapes_1.Shapes.CurveAround(shapes_1.Shapes.CoastlineAround(cell), shapes_1.ECurve.CurveBasisClosed);
        p.attr("path", str);
    }
    Test1() {
        console.log("looking for label");
        var el = d3.select("#label");
        console.log("Found label? " + !!(el != null).toString());
        var child = el.append("g");
        console.log("Made child? " + !!(child != null).toString());
    }
}
exports.Browser = Browser;
