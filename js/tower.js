"use strict";

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

const DATA_DIR = "data/";

const TILE_SIZE_X = 32;
const TILE_SIZE_Y = 32;
const TILESET_WIDTH = 11;

const DEFAULT_BACKGROUND_TYPE = 5;

const BOARD_SIZE_X = 16;
const BOARD_SIZE_Y = 24;
const BOARD_SIZE_TOTAL = BOARD_SIZE_X * BOARD_SIZE_Y;

const INVENTORY_SIZE = BOARD_SIZE_X;

// DOM-related

const DIV_TAG = "div";

const TILE_CLASS = "tile";
/* const TYPE_SUFFIX = "-type-"; */
const BOARD_ROW_CLASS = "board-row";
const INVENTORY_TILE_CLASS = "inventory-tile";
const INVENTORY_ROW_CLASS = "inventory-row";
const INVENTORY_ROW_PREFIX = INVENTORY_ROW_CLASS + "-";
const TILE_TYPE_CLASS_PREFIX = TILE_CLASS + "-type-";

const id = {
    boardBackground: "boardBackground",
    boardForeground: "boardForeground",
    statPanel: "statPanel",
    inventoryPanel: "inventoryPanel",
    gamePanel: "gamePanel",
};

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

class Hero {
  constructor() {
    var proto = Hero.heroProto;
    for( var v in proto ) {
        if ( proto.hasOwnProperty( v ) ) {
            this[v] = proto[v];
        }
    }
  }

  init( dom ) {
    this.inv.init( dom );
  }
}

Hero.heroProto = {
    x: 0, y: 0, z: 0,
    hp: 100, att: 10, def: 10, spd: 10,
    xp: 0, level: 0, gold: 0,
    inv: new Inventory( INVENTORY_SIZE ),
};

class Game {
  constructor() {
    this.hero = new Hero();
    this.bg = new Board( BOARD_SIZE_TOTAL, "bg" );
    this.fg = new Board( BOARD_SIZE_TOTAL, "fg" );
    this.dom = {};
    this.mapBgCharMap = null;
    this.mapFgCharMap = null;
    this.jsonData = null;
  }

  setFgXY( x, y, typeId ) {
    this.bg.setElement( x + y * BOARD_SIZE_X, typeId );
  }

  setBgXY( x, y, typeId ) {
    this.fg.setElement( x + y * BOARD_SIZE_X, typeId );
  }

  updateTitle() {
    var hero = this.hero;
    document.title = "X: " + hero.x + "\u2007 Y: " + hero.y + "\u2007 Z: " + hero.z;
  }

  updateStats() {
    var hero = this.hero;
    this.dom.statPanel.innerHTML = "HP: " + hero.hp + " ATT: " + hero.att + " DEF: " + hero.def + " SPD: " + hero.spd
                           + "<br />XP: " + hero.xp + " LEV: " + hero.level + " $$: " + hero.gold;
  }

  update( quickUpdate ) {
    this.updateTitle();
    this.updateStats();
    this.hero.inv.update();

    if ( !quickUpdate ) {
        this.bg.update();
        this.fg.update();
    }
  }

  loadJsonData( dataFilename, callback ) {
      var that = this;
      readFile( DATA_DIR + dataFilename, function( dataStr ) {
          that.jsonData = JSON.parse( dataStr );
          callback();
      } );
  }

  loadMap( mapNr, callback ) {
    var bg = this.bg;
    var fg = this.fg;
    var bgIdMap = this.mapBgCharMap;
    var fgIdMap = this.mapFgCharMap;

    readFile( DATA_DIR + "map" + mapNr + ".txt", function( mapStr ) {
        for ( var i = 0, pos = -1, len = mapStr.length; i < len; i++ ) {
            var c = mapStr.charAt( i );
            if ( c === "\n" || c === "\r" ) {
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
        callback();
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

    this.hero.init( dom.inventoryPanel );
    this.bg.init( dom.boardBackground );
    this.fg.init( dom.boardForeground );

    var widthStr = "width: " + TILE_SIZE_X * BOARD_SIZE_X + "px; ";
    dom.statPanel.style = widthStr;
    dom.inventoryPanel.style = widthStr;
    dom.gamePanel.style = widthStr;
    //dom.boardBackground.style = widthStr;
    //dom.board.style = widthStr;

    var that = this;
    this.loadJsonData( "charMap.json", function() {
        that.mapBgCharMap = new Map( that.jsonData.mapBgCharRaw );
        that.mapFgCharMap = new Map( that.jsonData.mapFgCharRaw );
        that.loadMap( "0", function() {
            that.update( false );
        } );
    } );
  }
}

var game;

//document.addEventListener('DOMContentLoaded', game.init );
window.onload = function() {
    game = new Game();
    game.init();
    game.hero.inv.content[2] = 55;
    game.hero.inv.content[5] = 48;
    game.hero.inv.update();
};
