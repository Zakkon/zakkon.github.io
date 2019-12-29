"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
class BaseCell {
    constructor() {
        this.IsBorder = false;
    }
}
exports.BaseCell = BaseCell;
class PolygonCell extends BaseCell {
    constructor() { super(); }
    get Rectangle() { return this.quadTreeRect; }
    ;
    SetVerts(verts) {
        this.Verts = verts;
        let lowestX = Number.MAX_VALUE;
        let lowestY = Number.MAX_VALUE;
        let highestX = Number.MIN_VALUE;
        let highestY = Number.MIN_VALUE;
        for (let v of verts) {
            if (v.x < lowestX) {
                lowestX = v.x;
            }
            if (v.x > highestX) {
                highestX = v.x;
            }
            if (v.y < lowestY) {
                lowestY = v.y;
            }
            if (v.y > highestY) {
                highestY = v.y;
            }
        }
        this.quadTreeRect = new utils_1.Rectf(lowestX, lowestY, highestX - lowestX, highestY - lowestY);
    }
}
exports.PolygonCell = PolygonCell;
class VoroCell extends PolygonCell {
    constructor(id, s) {
        super();
        this.ID = id;
        this.Site = s;
        this.Coord = s.Coord;
        //Calculate if we are an edge cell
        for (var i = 0; i < this.Site.Edges.length; ++i) {
            if (!this.Site.Edges[i].Visible()) {
                this.IsBorder = true;
                break;
            }
        }
    }
    AssignVerts() {
        super.SetVerts(this.Site.region);
    }
}
exports.VoroCell = VoroCell;
