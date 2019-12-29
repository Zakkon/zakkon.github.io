declare var require: any
var unique = require('uniq')

export class Counter{
  data: number[];
constructor(){
  this.data = [1, 2, 2, 3, 4, 5, 5, 5, 6];
}
public log(){console.log(unique(this.data));}
}
