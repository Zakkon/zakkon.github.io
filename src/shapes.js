"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const d3 = __importStar(require("d3"));
class Shapes {
    static CurveAround(points, t) {
        let ps = Shapes.toV2Array(points);
        var s;
        if (t == ECurve.CurveBasis) {
            s = d3.line().curve(d3.curveBasis)(ps);
        }
        else {
            s = d3.line().curve(d3.curveBasisClosed)(ps);
        }
        console.log(s);
        return s;
    }
    static CoastlineAround(cell) {
        return cell.Verts; //Keep it simple for now
    }
    static toV2Array(points) {
        var ps = [];
        var i;
        for (i = 0; i < points.length; i++) {
            ps.push([points[i].x, points[i].y]);
        }
        return ps;
    }
}
exports.Shapes = Shapes;
var ECurve;
(function (ECurve) {
    ECurve[ECurve["CurveBasis"] = 0] = "CurveBasis";
    ECurve[ECurve["CurveBasisClosed"] = 1] = "CurveBasisClosed";
})(ECurve = exports.ECurve || (exports.ECurve = {}));
