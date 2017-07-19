"use strict";

/* jslint node: true */

class Inventory {
  constructor( tileset, size ) {
    this.tileset = tileset;
    this.size = size;
    this.tiles = new Array( size );
    this.content = new Array( size );
  }

  init( dom ) {
    dom.innerHTML = "";
    this.tiles = this.tileset.createMatrix( dom, this.size, BOARD_SIZE_X, INVENTORY_ROW_CLASS, INVENTORY_ROW_PREFIX );
  }

  getContent( elemIdx ) {
    return this.content[elemIdx];
  }

  getTile( elemIdx ) {
    return this.tiles[elemIdx];
  }

  setContent( elemIdx, typeId ) {
    this.content[elemIdx] = typeId;
    this.updateTile( elemIdx );
  }

  updateTile( elemIdx ) {
    this.tileset.updateTile( this.tiles[elemIdx], this.content[elemIdx], INVENTORY_TILE_CLASS );
  }

  update() {
    for( var i = this.size - 1; i >= 0; i-- ) {
        this.updateTile( i );
    }
  }
}
