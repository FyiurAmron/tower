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
    this.tileUndefinedClass = tileTypeClassPrefix + undefined;
  }

  createTile() {
    var tile = document.createElement( DIV_TAG );
    tile.classList.add( this.tileClass );
    var inner = document.createElement( DIV_TAG );
    tile.appendChild( inner );
    return tile;
  }

  setTilePos( tileDom, x, y ) {
    tileDom.style.left = x * this.tileSizeX + "px";
    tileDom.style.top = y * this.tileSizeY + "px";
  }

  createMatrix( dom, size, rowSize, rowClass, rowIdPrefix, additionalTileClass ) {
    var row = document.createElement( DIV_TAG );
    var tiles = new Array( size );
    var cl;

    row.classList.add( rowClass );
    row.id = rowIdPrefix + "0";
    dom.appendChild( row );

    for ( var i = 0, x = 0, y = 0; i < size; i++, x++ ) {
        if ( x === rowSize ) {
            row = document.createElement( DIV_TAG );
            cl = row.classList;
            cl.add( rowClass );
            y++;
            row.id = rowIdPrefix + y;
            dom.appendChild( row );
            x = 0;
        }

        var tile = this.createTile();
        cl = tile.classList;
        cl.add( this.tileClass );
        if ( additionalTileClass !== undefined ) {
            cl.add( additionalTileClass );
        }
        cl.add( this.tileUndefinedClass  );
        tiles[i] = tile;
        this.setTilePos( tile, x, y );
        row.appendChild( tile );
    }

    return tiles;
  }

  updateTile( tileDom, typeId, additionalTileClass ) {
    if ( typeId !== undefined ) {
        var posX = ( ( typeId % this.tilesetColumns ) | 0 ) * this.tileSizeX;
        var posY = ( ( typeId / this.tilesetColumns ) | 0 ) * this.tileSizeY;
        tileDom.firstChild.style.backgroundPosition = "-" + posX + "px -" + posY + "px";
    }

    tileDom.className = "";
    var cl = tileDom.classList;
    cl.add( this.tileClass );
    if ( additionalTileClass !== undefined ) {
        cl.add( additionalTileClass );
    }
    cl.add( this.tileTypeClassPrefix + typeId );
  }
}