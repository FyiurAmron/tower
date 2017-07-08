'use strict';

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

const DEFAULT_BOARD_CONTENT = 5;

const BOARD_SIZE_X = 16;
const BOARD_SIZE_Y = 24;
const BOARD_SIZE_TOTAL = BOARD_SIZE_X * BOARD_SIZE_Y;

const _board = {
    background: new Array( BOARD_SIZE_TOTAL ),
    tiles: new Array( BOARD_SIZE_TOTAL ),
    content: new Array( BOARD_SIZE_TOTAL ),
};

const INVENTORY_SIZE = BOARD_SIZE_X;

const _hero = {
    x: 0, y: 0, z: 0,
    hp: 100, att: 10, def: 10,
    xp: 0, level: 0, gold: 0,
    inv: new Array( INVENTORY_SIZE ),
};

// DOM-related

const DIV_TAG = "div";

const TILE_CLASS = "tile";
const TILE_BACKGROUND_CLASS = TILE_CLASS + "-bg";
const TILE_FOREGROUND_CLASS = TILE_CLASS + "-fg";
const TYPE_SUFFIX = "-type-";
const TILE_BACKGROUND_TYPE_CLASS_PREFIX = TILE_BACKGROUND_CLASS + TYPE_SUFFIX;
const TILE_FOREGROUND_TYPE_CLASS_PREFIX = TILE_FOREGROUND_CLASS + TYPE_SUFFIX;
const TILE_EMPTY_CLASS_SUFFIX = "empty";

const BOARD_ROW_CLASS = "board-row";
const BOARD_ROW_ID_PREFIX = BOARD_ROW_CLASS + "-";
const BOARD_BACKGROUND_ROW_ID_PREFIX = BOARD_ROW_CLASS + "-bg-";

const id = {
    board: "board",
    boardBackground: "boardBackground",
    statPanel: "statPanel",
    inventoryPanel: "inventoryPanel",
    gamePanel: "gamePanel",
};

const mapCharMapping = [
    ['+', 0],
    ['&', 4],
    ['#', 7],
    ['>', 10],
    ['<', 11],
    ['~', 12],
    ['^', 13],
    ['F', 22],
    ['!', 31],
    ['|', 32],
];

class Game {
  constructor() {
    this.hero = _hero;
    this.board = _board;
    this.dom = {};
    this.mapCharMap = new Map( mapCharMapping );
  }

  createDefaultBackground() {
    var bb = this.board.background;
    var dbb = this.dom.boardBackground;
    var row = document.createElement( DIV_TAG );
    row.classList.add( BOARD_ROW_CLASS );
    row.id = BOARD_BACKGROUND_ROW_ID_PREFIX + "0";
    dbb.appendChild( row );
    for ( var i = 0, x = 0, y = 0; i < BOARD_SIZE_TOTAL; i++, x++ ) {
        var tile = document.createElement( DIV_TAG );
        tile.classList.add( TILE_CLASS );
        bb[i] = tile;
        if ( x === BOARD_SIZE_X ) {
            row = document.createElement( DIV_TAG );
            row.classList.add( BOARD_ROW_CLASS );
            row.id = BOARD_BACKGROUND_ROW_ID_PREFIX + y;
            dbb.appendChild( row );
            x = 0;
            y++;
        }
        row.appendChild( tile ); // use positioning instead?
        this.setBackground( i, DEFAULT_BOARD_CONTENT );
    }
  }

  createEmptyBoard() {
    var bt = this.board.tiles;
    var db = this.dom.board;
    var row = document.createElement( DIV_TAG );
    row.classList.add( BOARD_ROW_CLASS );
    row.id = BOARD_ROW_ID_PREFIX + "0";
    db.appendChild( row );
    for ( var i = 0, x = 0, y = 0; i < BOARD_SIZE_TOTAL; i++, x++ ) {
        var tile = document.createElement( DIV_TAG );
        tile.classList.add( TILE_CLASS );
        bt[i] = tile;
        if ( x === BOARD_SIZE_X ) {
            row = document.createElement( DIV_TAG );
            row.classList.add( BOARD_ROW_CLASS );
            row.id = BOARD_ROW_ID_PREFIX + y;
            db.appendChild( row );
            x = 0;
            y++;
        }
        row.appendChild( tile ); // use positioning instead?
        this.setTile( i, null );
    }
  }

  createInventory() {

  }

  setBackgroundXY( x, y, content ) {
    setBackground( x + y * BOARD_SIZE_X, content );
  }

  setTileXY( x, y, content ) {
    setTile( x + y * BOARD_SIZE_X, content );
  }

  setBackground( index, typeNr ) {
    var tileDom = this.board.background[index];
    var tilesetX = ( ( typeNr % TILESET_WIDTH ) | 0 ) * TILE_SIZE_X;
    var tilesetY = ( ( typeNr / TILESET_WIDTH ) | 0 ) * TILE_SIZE_Y;
    tileDom.style = "background-position: -" + tilesetX + "px -" + tilesetY + "px;";
    tileDom.className = "";
    var cl = tileDom.classList;
    cl.add( TILE_CLASS );
    cl.add( TILE_BACKGROUND_CLASS );
    cl.add( TILE_BACKGROUND_TYPE_CLASS_PREFIX + typeNr );
}

  setTile( index, typeNr ) {
    var tileDom = this.board.tiles[index];
    if ( typeNr == null ) {
        this.board.content[index] = typeNr;

        tileDom.style = "";
        tileDom.className = "";
        var cl = tileDom.classList;
        cl.add( TILE_CLASS );
        cl.add( TILE_FOREGROUND_CLASS );
        cl.add( TILE_FOREGROUND_TYPE_CLASS_PREFIX + TILE_EMPTY_CLASS_SUFFIX );
        return;
    }
    this.board.content[index] = typeNr;

    var tilesetX = ( ( typeNr % TILESET_WIDTH ) | 0 ) * TILE_SIZE_X;
    var tilesetY = ( ( typeNr / TILESET_WIDTH ) | 0 ) * TILE_SIZE_Y;

    tileDom.style = "background-position: -" + tilesetX + "px -" + tilesetY + "px;";
    tileDom.className = "";
    var cl = tileDom.classList;
    cl.add( TILE_CLASS );
    cl.add( TILE_FOREGROUND_CLASS );
    cl.add( TILE_FOREGROUND_TYPE_CLASS_PREFIX + typeNr );

// TODO add proper CSS animation below
/*
if ( typeNr != 22 ) {
return;
}
this.board.tiles[index].animate([
  // keyframes
  { transform: 'rotate(0deg)' }, 
  { transform: 'rotate(360deg)' }
], { 
  // timing options
  duration: 1000,
  iterations: Infinity
});
*/

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

  init() {
    console.log( "game.init();" );
    var dom = this.dom;
    dom.inventoryPanel = document.getElementById( id.inventoryPanel );
    dom.statPanel = document.getElementById( id.statPanel );
    dom.boardBackground = document.getElementById( id.boardBackground );
    dom.board = document.getElementById( id.board );
    dom.gamePanel = document.getElementById( id.gamePanel );

    game.createDefaultBackground();
    game.createEmptyBoard();

    var widthStr = "width: " + TILE_SIZE_X * BOARD_SIZE_X + "px; ";
    dom.statPanel.style = widthStr;
    dom.inventoryPanel.style = widthStr;
    dom.gamePanel.style = widthStr;
    //dom.boardBackground.style = widthStr;
    //dom.board.style = widthStr;

    dom.statPanel.innerHTML = "";
    dom.inventoryPanel.innerHTML = "";

    var thisGame = this;

    readFile( "data/map0.txt", function( mapStr ) {
        for ( var i = 0, pos = -1, len = mapStr.length; i < len; i++ ) {
            var c = mapStr.charAt( i );
            if ( c === '\n' || c === '\r' ) {
                continue;            
            }
            pos++;
            if ( c === '.' ) {
                continue;
            }

            var contentNr = thisGame.mapCharMap.get( c );
            if ( contentNr == null ) {
                console.log( "unknown map char '" + c + "' [0x" + c.charCodeAt( 0 ).toString( 16 ) + "]" );
            }
           
            thisGame.setTile( pos, contentNr );
        }
    } );

    this.update();
  }
}

var game;

//document.addEventListener('DOMContentLoaded', game.init );
window.onload = function() {
    game = new Game()
    game.init();
};
