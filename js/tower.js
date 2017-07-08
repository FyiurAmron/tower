'use strict';

/* jslint bitwise: true */
/* jslint node: true */
/* jslint laxbreak: true */

// helpers

function readFile( filename, callback ) {
    var req = new XMLHttpRequest();
    req.open( "GET", filename, true );
    req.onreadystatechange = function( evt ) {
        if ( req.readyState !== 4 ) {
            return;
        }
        if ( req.responseText !== null ) {
            callback( req.responseText );
        } else {
            alert( "'" + filename + "' could not be loaded from server!" );
            alert( "req.readyState === " + req.readyState + " req.status === " + req.status );
        }
    };
    req.send( null );
}

// business logic

const TILE_SIZE_X = 32;
const TILE_SIZE_Y = 32;
const TILESET_WIDTH = 11;

const DEFAULT_BACKGROUND_TYPE = 5;

const BOARD_SIZE_X = 16;
const BOARD_SIZE_Y = 24;
const BOARD_SIZE_TOTAL = BOARD_SIZE_X * BOARD_SIZE_Y;

class Board {
  constructor( size, nameId ) {
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
        //this.setElement( i, undefined );
    }
  }

  setElement( elemIdx, typeId ) {
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
}

const INVENTORY_SIZE = BOARD_SIZE_X;

// DOM-related

const DIV_TAG = "div";

const TILE_CLASS = "tile";
/* const TYPE_SUFFIX = "-type-"; */
const BOARD_ROW_CLASS = "board-row";
/* const TILE_EMPTY_CLASS_SUFFIX = "empty"; */
const TILE_TYPE_CLASS_PREFIX = TILE_CLASS + "-type-";

const id = {
    boardBackground: "boardBackground",
    boardForeground: "boardForeground",
    statPanel: "statPanel",
    inventoryPanel: "inventoryPanel",
    gamePanel: "gamePanel",
};

const mapBgCharRaw = [
    [ '#', 7 ],
    [ '~', 12 ],
    [ '^', 13 ],
    [ 'B', 13 ],
];

const mapFgCharRaw = [
    [ '+', 0 ],
    [ '&', 4 ],
    [ '>', 10 ],
    [ '<', 11 ],
    [ 'B', 22 ],
    [ '!', 31 ],
    [ '|', 32 ],
    [ 'z', 76 ],
    [ 'Z', 78 ],
];

class Game {
  constructor() {
    this.hero = {
      x: 0, y: 0, z: 0,
      hp: 100, att: 10, def: 10,
      xp: 0, level: 0, gold: 0,
      inv: new Array( INVENTORY_SIZE ),
    };
    this.bg = new Board( BOARD_SIZE_TOTAL, "bg" );
    this.fg = new Board( BOARD_SIZE_TOTAL, "fg" );
    this.dom = {};
    this.mapBgCharMap = new Map( mapBgCharRaw );
    this.mapFgCharMap = new Map( mapFgCharRaw );
  }

  setFgXY( x, y, typeId ) {
    this.bg.setElement( x + y * BOARD_SIZE_X, typeId );
  }

  setBgXY( x, y, typeId ) {
    this.fg.setElement( x + y * BOARD_SIZE_X, typeId );
  }

  createInventory() {

  }

  updateTitle() {
    var hero = this.hero;
    document.title = "X: " + hero.x + "\u2007 Y: " + hero.y + "\u2007 Z: " + hero.z;
  }

  updateStats() {
    var hero = this.hero;
    this.dom.statPanel.innerHTML = "HP: " + hero.hp + " ATT: " + hero.att + " DEF: " + hero.def
                           + "<br />XP: " + hero.xp + " LEV: " + hero.level + " $$: " + hero.gold;
  }

  updateInventory() {

  }

  updateBoard() {

  }

  update() {
    this.updateTitle();
    this.updateStats();
    this.updateInventory();
    this.updateBoard();
  }

  loadMap( mapNr ) {
    var bg = this.bg;
    var fg = this.fg;
    var bgIdMap = this.mapBgCharMap;
    var fgIdMap = this.mapFgCharMap;

    readFile( "data/map" + mapNr + ".txt", function( mapStr ) {
        for ( var i = 0, pos = -1, len = mapStr.length; i < len; i++ ) {
            var c = mapStr.charAt( i );
            if ( c === '\n' || c === '\r' ) {
                continue;            
            }
            pos++;

            var typeIdBg = bgIdMap.get( c );
            var typeIdFg = fgIdMap.get( c );
            
            if ( typeIdBg === undefined ) {
                if ( typeIdFg === undefined ) {
                    console.log( "unknown map char '" + c + "' [0x" + c.charCodeAt( 0 ).toString( 16 ) + "]" );
                }
                typeIdBg = DEFAULT_BACKGROUND_TYPE;
            }
           
            bg.setElement( pos, typeIdBg );
            fg.setElement( pos, typeIdFg );
        }
    } );
  }

  init() {
    console.log( "game.init();" );
    var dom = this.dom;
    dom.inventoryPanel = document.getElementById( id.inventoryPanel );
    dom.statPanel = document.getElementById( id.statPanel );
    dom.boardBackground = document.getElementById( id.boardBackground );
    dom.boardForeground = document.getElementById( id.boardForeground );
    dom.gamePanel = document.getElementById( id.gamePanel );

    this.bg.init( dom.boardBackground );
    this.fg.init( dom.boardForeground );

    var widthStr = "width: " + TILE_SIZE_X * BOARD_SIZE_X + "px; ";
    dom.statPanel.style = widthStr;
    dom.inventoryPanel.style = widthStr;
    dom.gamePanel.style = widthStr;
    //dom.boardBackground.style = widthStr;
    //dom.board.style = widthStr;

    dom.statPanel.innerHTML = "";
    dom.inventoryPanel.innerHTML = "";

    this.loadMap( "0" );
    this.update();
  }
}

var game;

//document.addEventListener('DOMContentLoaded', game.init );
window.onload = function() {
    game = new Game();
    game.init();
};
