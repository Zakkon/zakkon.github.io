"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Rectf {
    constructor(x, y, width, height) {
        this.width = width; //Assign them just like you would in C#
        this.height = height;
        this.x = x;
        this.y = y;
    }
    get top() { return this.y; }
    get left() { return this.x; }
    get right() { return this.x + this.width; }
    get bottom() { return this.y + this.height; }
}
exports.Rectf = Rectf;
class Vector2f {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static zero() { return new Vector2f(0, 0); }
    get magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    subtract(p) {
        return new Vector2f(this.x - p.x, this.y - p.y);
    }
    static Distance(a, b) { return a.subtract(b).magnitude; }
    toString() { return "(" + this.x.toString() + ", " + this.y.toString() + ")"; }
}
exports.Vector2f = Vector2f;
class BoundsCheck {
    /*
     *
     * @param point
     * @param bounds
     * @return an int with the appropriate bits set if the Point lies on the corresponding bounds lines
     */
    static Check(point, bounds) {
        let value = 0;
        if (point.x == bounds.left) {
            value |= BoundsCheck.LEFT;
        }
        if (point.x == bounds.right) {
            value |= BoundsCheck.RIGHT;
        }
        if (point.y == bounds.top) {
            value |= BoundsCheck.TOP;
        }
        if (point.y == bounds.bottom) {
            value |= BoundsCheck.BOTTOM;
        }
        return value;
    }
}
exports.BoundsCheck = BoundsCheck;
BoundsCheck.TOP = 1;
BoundsCheck.BOTTOM = 2;
BoundsCheck.LEFT = 4;
BoundsCheck.RIGHT = 8;
class List {
    constructor() {
        this.items = [];
    }
    size() {
        return this.items.length;
    }
    add(value) {
        this.items.push(value);
    }
    get(index) {
        return this.items[index];
    }
    insert(index, value) {
        for (let i = this.size() - 1; i >= index - 1; i--) {
            this.items[i + 1] = this.items[i];
        }
        this.items[index] = value;
    }
}
exports.List = List;
exports.roundToInt = (num) => Math.round(num);
exports.toInt = (value) => {
    return Number.parseInt(value);
};
exports.checkIsInt = (num) => num % 1 === 0;
exports.assertAsInt = (num) => {
    try {
        if (exports.checkIsInt(num)) {
            return num;
        }
    }
    catch (err) {
        throw new Error(`Invalid Int value (error): ${num}`);
    }
    throw new Error(`Invalid Int value: ${num}`);
};
