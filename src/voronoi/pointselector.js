"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
class PointSelector {
    /// <summary>
    /// Generates completely random points within a rectangle. May generate less points then required due to culling of points within minSpacing of eachother
    /// </summary>
    generateRandom(mapW, mapH, r, numPoints, minSpacing = 3.0, mapEdgePadding = 10) {
        var points = [];
        for (let i = 0; i < numPoints; i++) {
            var p = new utils_1.Vector2f(r.range(mapEdgePadding, mapW - mapEdgePadding), r.range(mapEdgePadding, mapH - mapEdgePadding));
            //Check that it isnt too close to any other point
            let tooClose = false;
            for (let op of points) {
                if (utils_1.Vector2f.Distance(p, op) < minSpacing) {
                    tooClose = true;
                    break;
                }
            }
            if (!tooClose) {
                points.push(p);
            } //If not too close, add to list
        }
        return points;
    }
    // Generate points on a square grid
    generateSquare(mapW, mapH, r, numPoints) {
        let points = [];
        let N = Math.sqrt(numPoints);
        for (let x = 0; x < N; ++x) {
            for (let y = 0; y < N; ++y) {
                points.push(new utils_1.Vector2f((0.5 + x) / N * mapW, (0.5 + y) / N * mapH));
                //new Point((0.5 + x)/N* size, (0.5 + y)/N* size));
            }
        }
        return points;
    }
    // Generate points on a hexagon grid
    generateHexagon(size, r, numPoints) {
        let points = [];
        let N = Math.sqrt(numPoints);
        for (var x = 0; x < N; x++) {
            for (var y = 0; y < N; y++) {
                points.push(new utils_1.Vector2f((0.5 + x) / N * size, (0.25 + 0.5 * x % 2 + y) / N * size));
                //new Point());
            }
        }
        return points;
    }
    GetBounds(mapW, mapH) { return new utils_1.Rectf(0, 0, mapW, mapH); }
    static GeneratePointsJittered(numCells, mapWidth, mapHeight, r) {
        //float spacing = (float)rn((double)Math.Sqrt((float)mapWidth * (float)mapHeight / (float)numCells), 2f); // spacing between points before jirrering
        let spacing = PointSelector.rn(Math.sqrt(mapWidth * mapHeight / numCells), 2);
        //Do we actually use boundarypoints + jitteredgrid?
        var boundary = PointSelector.getBoundaryPoints(mapWidth, mapHeight, spacing);
        var points = PointSelector.getJitteredGrid(mapWidth, mapHeight, spacing, r); // jittered square grid
        //points.AddRange(boundary); //Not sure if i want these tbh, al they seem to do i threy supposed to fix beighbour issues at the edges, but we got no issues with that so
        let cellsX = Math.floor((mapWidth + 0.5 * spacing) / spacing);
        let cellsY = Math.floor((mapHeight + 0.5 * spacing) / spacing);
        return points;
    }
    // add boundary points to pseudo-clip voronoi cells
    static getBoundaryPoints(width, height, spacing) {
        var offset = PointSelector.rn(-1 * spacing);
        var bSpacing = spacing * 2;
        var w = width - offset * 2;
        var h = height - offset * 2;
        let numberX = Math.ceil(w / bSpacing) - 1;
        let numberY = Math.ceil(h / bSpacing) - 1;
        let points = [];
        for (let i = 0.5; i < numberX; i++) {
            var x = Math.ceil(w * i / numberX + offset);
            points.push(new utils_1.Vector2f(x, offset));
            points.push(new utils_1.Vector2f(x, h + offset));
        }
        for (let i = 0.5; i < numberY; i++) {
            var y = Math.ceil(h * i / numberY + offset);
            points.push(new utils_1.Vector2f(offset, y));
            points.push(new utils_1.Vector2f(w + offset, y));
        }
        return points;
    }
    // get points on a regular square grid and jitter them a bit
    static getJitteredGrid(width, height, spacing, r) {
        let radius = spacing / 2.0; // square radius
        let jittering = radius * 0.9; // max deviation
        //const jitter = function() { return Math.random() * 2 * jittering - jittering; };
        let points = [];
        for (var y = radius; y < height; y += spacing) {
            for (var x = radius; x < width; x += spacing) {
                var xj = PointSelector.rn(x + r.range(-jittering, jittering), 2);
                var yj = PointSelector.rn(y + r.range(-jittering, jittering), 2);
                points.push(new utils_1.Vector2f(xj, yj));
            }
        }
        return points;
    }
    // round value to d decimals (same as Math.Round)
    static rn(v, d = 0) {
        var m = Math.pow(10, d);
        return Math.round(v * m) / m;
    }
}
exports.PointSelector = PointSelector;
PointSelector.NUM_LLOYD_RELAXATIONS = 2;
