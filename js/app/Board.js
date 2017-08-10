"use strict";

/* jslint node: true */

class Board {
  constructor( tileset, sizeX, sizeY, nameId ) {
    this.tileset = tileset;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.size = sizeX * sizeY;
    this.dom = null;
    this.tiles = null;
    this.entity = new Array( this.size );
    this.tileClass = TILE_CLASS + "-" + nameId;
    this.rowIdPrefix = BOARD_ROW_CLASS + "-" + nameId + "-";
  }

  init( dom ) {
    this.dom = dom;
    this.tiles = this.tileset.createMatrix( dom, this.size, this.sizeX, BOARD_ROW_CLASS, this.rowIdPrefix, this.tileClass );
  }

  xyToIdx( x, y ) {
    return x + y * this.sizeX;
  }

  setEntityXY( x, y, entity ) {
    this.setEntity( this.xyToIdx( x, y ), entity );
  }

  setEntity( elemIdx, entity ) {
    this.entity[elemIdx] = entity;
    this.updateTile( elemIdx );
  }

  getEntityXY( x, y ) {
    return this.getEntity( this.xyToIdx( x, y ) );
  }

  getEntity( elemIdx ) {
    return this.entity[elemIdx];
  }

  getTileXY( x, y ) {
    return this.getTile( this.xyToIdx( x, y ) );
  }

  getTile( elemIdx ) {
    return this.tiles[elemIdx];
  }

  updateTile( elemIdx ) {
    var ent = this.entity[elemIdx];
    return this.tileset.updateTile( this.tiles[elemIdx], ( ent === undefined ) ? undefined : ent.typeId, this.tileClass );
  }

  update() {
    // TODO
  }
}
