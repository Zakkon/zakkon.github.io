"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rand_seed_1 = __importDefault(require("rand-seed"));
const utils_1 = require("./utils");
class Random {
    //You can create an object version of this class, to keep seperate seeds
    constructor(seed) {
        this.root = new rand_seed_1.default(seed.toString());
    }
    static get global() { return Random.globalInstance; }
    //You can also just call these static methods if youre feeling lazy
    static Range(min, max) {
        return Random.globalInstance.range(min, max);
    }
    range(min, max) {
        return min + (this.root.next() * (max - min));
    }
    rangeint(min, max) {
        return utils_1.roundToInt(this.range(min, max));
    }
}
exports.Random = Random;
Random.globalInstance = new Random(2019);
