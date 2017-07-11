"use strict";

/* jslint bitwise: true */
/* jslint node: true */

class Board {
  constructor( tileset, x, y, nameId ) {
    this.tileset = tileset;
    this.x = x;
    this.y = y;
    this.size = x * y;
    this.dom = null;
    this.tiles = null;
    this.content = new Array( this.size );
    this.tileClass = TILE_CLASS + "-" + nameId;
    this.rowIdPrefix = BOARD_ROW_CLASS + "-" + nameId + "-";
  }

  init( dom ) {
    this.dom = dom;
    this.tiles = this.tileset.createMatrix( dom, BOARD_SIZE_TOTAL, BOARD_SIZE_X, BOARD_ROW_CLASS, this.rowIdPrefix );
  }

  setContent( elemIdx, typeId ) {
    this.content[elemIdx] = typeId;
    this.updateCell( elemIdx );
  }

  updateCell( elemIdx ) {
    this.tileset.updateTile( this.tiles[elemIdx], this.content[elemIdx], this.tileClass );
  }

  update() {
    // TODO
  }
}
