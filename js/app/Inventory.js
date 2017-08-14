"use strict";

/* jslint node: true */

/* TODO: this should handle DOM inventory view (InventoryBoard) only */

class Inventory {
  constructor( tileset, size ) {
    this.tileset = tileset;
    this.size = size;
    this.tiles = new Array( size );
    this.entity = new Array( size );
  }

  init( rowSize, dom ) {
    dom.innerHTML = "";
    this.tiles = this.tileset.createMatrix( dom, this.size, rowSize, INVENTORY_ROW_CLASS, INVENTORY_ROW_PREFIX );
  }

  getEntity( elemIdx ) {
    return this.entity[elemIdx];
  }

  getTile( elemIdx ) {
    return this.tiles[elemIdx];
  }

  setEntity( elemIdx, typeId ) {
    this.entity[elemIdx] = typeId;
    this.updateTile( elemIdx );
  }

  updateTile( elemIdx ) {
    var ent = this.entity[elemIdx];
    this.tileset.updateTile( this.tiles[elemIdx], ( ent === undefined ) ? undefined : ent.typeId, INVENTORY_TILE_CLASS );
  }

  update() {
    for( var i = this.size - 1; i >= 0; i-- ) {
        this.updateTile( i );
    }
  }
}
