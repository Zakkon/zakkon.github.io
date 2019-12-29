export class Rectf {
  x: number;
  y: number;
  width: number;
  height: number;
  get top() { return this.y; }
  get left() { return this.x; }
  get right() { return this.x + this.width; }
  get bottom() { return this.y + this.height; }

  constructor(x: number, y: number, width: number, height: number) { //Take a DOM as a parameter (interesting!)
      this.width = width; //Assign them just like you would in C#
      this.height = height;
      this.x = x; this.y = y;
  }
}

export class Vector2f {
  public x: number;
  public y: number;
  public static zero<Vector2f>() { return new Vector2f(0, 0); }

  constructor(x: number, y: number) { //Take a DOM as a parameter (interesting!)
      this.x = x; this.y = y;
  }

  public get magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }

  public subtract(p: Vector2f) {
      return new Vector2f(this.x - p.x, this.y - p.y);
  }
  public static Distance(a: Vector2f, b: Vector2f){return a.subtract(b).magnitude;}
  public toString(){return "(" + this.x.toString() + ", " + this.y.toString() + ")";}
}

export class BoundsCheck {
  public static readonly TOP: number = 1;
  public static readonly BOTTOM: number = 2;
  public static readonly LEFT: number = 4;
  public static readonly RIGHT: number = 8;

  /*
   * 
   * @param point
   * @param bounds
   * @return an int with the appropriate bits set if the Point lies on the corresponding bounds lines
   */
  public static Check(point: Vector2f, bounds: Rectf) {
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

export class List<T> {
  private items: Array<T>;

  constructor() {
      this.items = [];
  }

  size(): number {
      return this.items.length;
  }

  add(value: T): void {
      this.items.push(value);
  }

  get(index: number): T {
      return this.items[index];
  }

  insert(index: number, value: T): void {
      for (let i = this.size() - 1; i >= index - 1; i--)
      { this.items[i + 1] = this.items[i]; }
      this.items[index] = value;  
  }
}

export type Int = number & { __int__: void };

export const roundToInt = (num: number): Int => Math.round(num) as Int;

export const toInt = (value: string): Int => {
  return Number.parseInt(value) as Int;
};

export const checkIsInt = (num: number): num is Int => num % 1 === 0;

export const assertAsInt = (num: number): Int => {
  try {
      if (checkIsInt(num)) {
          return num;
      }
  } catch (err) {
      throw new Error(`Invalid Int value (error): ${num}`);
  }

  throw new Error(`Invalid Int value: ${num}`);
};