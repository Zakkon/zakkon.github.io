"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var unique = require('uniq');
var Counter = /** @class */ (function () {
    function Counter() {
        this.data = [1, 2, 2, 3, 4, 5, 5, 5, 6];
    }
    Counter.prototype.log = function () { console.log(unique(this.data)); };
    return Counter;
}());
exports.Counter = Counter;
