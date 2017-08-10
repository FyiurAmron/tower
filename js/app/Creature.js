"use strict";

/* jslint node: true */

class Critter {
  constructor( proto, x, y, z ) {
    for( var v in proto ) {
        if ( proto.hasOwnProperty( v ) ) {
            this[v] = proto[v];
        }
    }
    this.x = x;
    this.y = y;
    this.z = z;
  }
}
