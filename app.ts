declare var require: any
import { Car } from './car';
import {Counter} from './counter';

var car: Car = new Car();
car.go();

var ct = new Counter();
ct.log();

