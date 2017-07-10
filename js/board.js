"use strict";

/* jslint bitwise: true */
/* jslint node: true */

class Board {
  constructor( size, nameId ) {
    this.size = size;
    this.dom = null;
    this.tiles = new Array( size );
    this.content = new Array( size );
    this.tileClass = TILE_CLASS + "-" + nameId;
    this.rowIdPrefix = BOARD_ROW_CLASS + "-" + nameId + "-";
  }

  init( dom ) {
    this.dom = dom;
    var t = this.tiles;
    var row = document.createElement( DIV_TAG );
    row.classList.add( BOARD_ROW_CLASS );
    row.id = this.rowIdPrefix + "0";
    dom.appendChild( row );
    for ( var i = 0, x = 0, y = 0; i < BOARD_SIZE_TOTAL; i++, x++ ) {
        var tile = document.createElement( DIV_TAG );
        tile.classList.add( TILE_CLASS );
        t[i] = tile;
        if ( x === BOARD_SIZE_X ) {
            row = document.createElement( DIV_TAG );
            row.classList.add( BOARD_ROW_CLASS );
            y++;
            row.id = this.rowIdPrefix + y;
            dom.appendChild( row );
            x = 0;
        }
        tile.style.left = x * TILE_SIZE_X + "px";
        tile.style.top = y * TILE_SIZE_Y + "px";
        row.appendChild( tile );
    }
  }

  setElement( elemIdx, typeId ) { // TODO setContent/updateCell
    var tileDom = this.tiles[elemIdx];

    this.content[elemIdx] = typeId;

    tileDom.className = "";
    var cl = tileDom.classList;
    cl.add( TILE_CLASS );
    cl.add( this.tileClass );
    cl.add( TILE_TYPE_CLASS_PREFIX + typeId );

    if ( typeId === undefined ) {
        return;
    }

    var tilesetX = ( ( typeId % TILESET_WIDTH ) | 0 ) * TILE_SIZE_X;
    var tilesetY = ( ( typeId / TILESET_WIDTH ) | 0 ) * TILE_SIZE_Y;
    tileDom.style.backgroundPosition = "-" + tilesetX + "px -" + tilesetY + "px";
  }

  update() {
    // TODO
  }
}
