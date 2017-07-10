"use strict";

/* jslint node: true */

class Hero {
  constructor() {
    var proto = Hero.heroProto;
    for( var v in proto ) {
        if ( proto.hasOwnProperty( v ) ) {
            this[v] = proto[v];
        }
    }
  }

  init( dom ) {
    this.inv.init( dom );
  }
}

Hero.heroProto = {
    x: 0, y: 0, z: 0,
    hp: 100, att: 10, def: 10, spd: 10,
    xp: 0, level: 0, gold: 0,
    inv: new Inventory( INVENTORY_SIZE ),
};
