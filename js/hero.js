"use strict";

/* jslint node: true */

class Hero {
  constructor( proto ) {
    for( var v in proto ) {
        if ( proto.hasOwnProperty( v ) ) {
            this[v] = proto[v];
        }
    }
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }
}
