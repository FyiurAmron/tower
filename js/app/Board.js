"use strict";

/* jslint bitwise: true */
/* jslint node: true */

class Board {
  constructor( tileset, sizeX, sizeY, nameId ) {
    this.tileset = tileset;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.size = sizeX * sizeY;
    this.dom = null;
    this.tiles = null;
    this.content = new Array( this.size );
    this.tileClass = TILE_CLASS + "-" + nameId;
    this.rowIdPrefix = BOARD_ROW_CLASS + "-" + nameId + "-";
  }

  init( dom ) {
    this.dom = dom;
    this.tiles = this.tileset.createMatrix( dom, this.size, this.sizeX, BOARD_ROW_CLASS, this.rowIdPrefix );
  }

  setContentXY( x, y, typeId ) {
    this.setContent( x + y * this.sizeX, typeId );
  }

  setContent( elemIdx, typeId ) {
    this.content[elemIdx] = typeId;
    this.updateCell( elemIdx );
  }

  getContentXY( x, y ) {
    return this.getContent( x + y * this.sizeX );
  }

  getContent( elemIdx ) {
    return this.content[elemIdx];
  }

  updateCell( elemIdx ) {
    this.tileset.updateTile( this.tiles[elemIdx], this.content[elemIdx], this.tileClass );
  }

  update() {
    // TODO
  }
}
