"use strict";

/* jslint bitwise: true */
/* jslint node: true */

class TileSet {
  constructor( tileSizeX, tileSizeY, tilesetColumns, tileClass, tileTypeClassPrefix ) {
    this.tileSizeX = tileSizeX;
    this.tileSizeY = tileSizeY;
    this.tilesetColumns = tilesetColumns;
    this.tileClass = tileClass;
    this.tileTypeClassPrefix = tileTypeClassPrefix;
  }

  createMatrix( dom, size, rowSize, rowClass, rowIdPrefix ) {
    var row = document.createElement( DIV_TAG );
    var tiles = new Array( size );
    row.classList.add( rowClass );
    row.id = rowIdPrefix + "0";
    dom.appendChild( row );
    for ( var i = 0, x = 0, y = 0; i < size; i++, x++ ) {
        var tile = document.createElement( DIV_TAG );
        tile.classList.add( this.tileClass );
        tiles[i] = tile;
        if ( x === rowSize ) {
            row = document.createElement( DIV_TAG );
            row.classList.add( rowClass );
            y++;
            row.id = rowIdPrefix + y;
            dom.appendChild( row );
            x = 0;
        }
        var inner = document.createElement( DIV_TAG );
        tile.appendChild( inner );
        tile.style.left = x * this.tileSizeX + "px";
        tile.style.top = y * this.tileSizeY + "px";
        row.appendChild( tile );
    }
    return tiles;
  }

  updateTile( tileDom, typeId, additionalTileClass ) {
    tileDom.className = "";
    var cl = tileDom.classList;
    cl.add( this.tileClass );
    cl.add( additionalTileClass );
    cl.add( this.tileTypeClassPrefix + typeId );

    if ( typeId === undefined ) {
        return;
    }

    tileDom = tileDom.firstChild;
    var posX = ( ( typeId % this.tilesetColumns ) | 0 ) * this.tileSizeX;
    var posY = ( ( typeId / this.tilesetColumns ) | 0 ) * this.tileSizeY;
    tileDom.style.backgroundPosition = "-" + posX + "px -" + posY + "px";
  }
}