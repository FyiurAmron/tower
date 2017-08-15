"use strict";

/* jslint node: true */

class Creature {
  constructor( proto, pos ) {
    for( var v in proto ) {
        if ( proto.hasOwnProperty( v ) ) {
            this[v] = proto[v];
        }
    }
    this.pos = pos;
  }
}
