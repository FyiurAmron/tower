"use strict";

/* jslint bitwise: true */
/* jslint node: true */

class Inventory {
  constructor( size ) {
    this.size = size;
    this.tiles = new Array( size );
    this.content = new Array( size );
  }

  init( dom ) {
    dom.innerHTML = "";
    var ts = this.tiles;
    var row = document.createElement( DIV_TAG );
    row.classList.add( INVENTORY_ROW_CLASS );
    row.id = INVENTORY_ROW_PREFIX + "0";
    dom.appendChild( row );
    for ( var i = 0, x = 0, y = 0; i < INVENTORY_SIZE; i++, x++ ) {
        var tile = document.createElement( DIV_TAG );
        tile.classList.add( TILE_CLASS );
        ts[i] = tile;
        if ( x === BOARD_SIZE_X ) {
            row = document.createElement( DIV_TAG );
            row.classList.add( INVENTORY_ROW_CLASS );
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

  setContent( elemIdx, typeId ) {
      this.content[elemIdx] = typeId;
      updateTile( elemIdx );
  }

  updateTile( elemIdx ) {
    var tileDom = this.tiles[elemIdx];
    var typeId = this.content[elemIdx];

    tileDom.className = "";
    var cl = tileDom.classList;
    cl.add( TILE_CLASS );
    cl.add( INVENTORY_TILE_CLASS );
    cl.add( TILE_TYPE_CLASS_PREFIX + typeId );

    if ( typeId === undefined ) {
        return;
    }

    var tilesetX = ( ( typeId % TILESET_WIDTH ) | 0 ) * TILE_SIZE_X;
    var tilesetY = ( ( typeId / TILESET_WIDTH ) | 0 ) * TILE_SIZE_Y;
    tileDom.style.backgroundPosition = "-" + tilesetX + "px -" + tilesetY + "px";
  }

  update() {
    for( var i = this.size - 1; i >= 0; i-- ) {
        this.updateTile( i );
    }
  }
}
