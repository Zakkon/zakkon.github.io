import Rand, {PRNG} from 'rand-seed';
import { roundToInt } from './utils';

export class Random
{
    root: Rand;
    private static globalInstance: Random = new Random(2019);
    public static get global() { return Random.globalInstance; }

    //You can create an object version of this class, to keep seperate seeds
    constructor(seed: number)
    {
        this.root = new Rand(seed.toString());
    }

    //You can also just call these static methods if youre feeling lazy
    public static Range(min: number, max: number) : number
    {
      return Random.globalInstance.range(min, max);
    }
    public range(min: number, max: number): number
    {
        return min + (this.root.next() * (max-min));
    }
    public rangeint(min: number, max: number): number
    {
        return roundToInt(this.range(min, max));
    }
}