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
    }
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
    content: new Array( BOARD_SIZE_TOTAL )
};

const _hero = {
    x: 0, y: 0, z: 0,
    hp: 100, att: 10, def: 10,
    xp: 0, level: 0, gold: 0,
    inv: []
};

// DOM-related

const DIV_TAG = "div";
const BR_TAG = "br";
const TILE_CLASS = "tile";

const id = {
    board: "board",
    boardBackground: "boardBackground",
    statPanel: "statPanel",
    inventoryPanel: "inventoryPanel"
}

const _dom = {};

const game = {
    hero: _hero,
    board: _board,
    dom: _dom
}

game.createDefaultBackground = function() {
    var bb = this.board.background;
    var dbb = this.dom.boardBackground;
    for ( var i = 0, x = 0/*, y = 0*/; i < BOARD_SIZE_TOTAL; i++, x++ ) {
        var tile = document.createElement( DIV_TAG );
        tile.classList.add( TILE_CLASS );
        bb[i] = tile;
        if ( x === BOARD_SIZE_X ) {
            dbb.appendChild( document.createElement( BR_TAG ) );
            x = 0;
            //y++;
        }
        dbb.appendChild( tile ); // use positioning instead?
        this.setBackground( i, DEFAULT_BOARD_CONTENT );
    }
}

game.createEmptyBoard = function() {
    var bt = this.board.tiles;
    var db = this.dom.board;
    for ( var i = 0, x = 0/*, y = 0*/; i < BOARD_SIZE_TOTAL; i++, x++ ) {
        var tile = document.createElement( DIV_TAG );
        tile.classList.add( TILE_CLASS );
        bt[i] = tile;
        if ( x === BOARD_SIZE_X ) {
            db.appendChild( document.createElement( BR_TAG ) );
            x = 0;
            //y++;
        }
        db.appendChild( tile ); // use positioning instead?
        this.setTile( i, null );
    }
}

game.createInventory = function() {

}

game.setBackgroundXY = function( x, y, content ) {
    setBackground( x + y * BOARD_SIZE_X, content );
}

game.setTileXY = function( x, y, content ) {
    setTile( x + y * BOARD_SIZE_X, content );
}

game.setBackground = function( index, contentNr ) {
    var tilesetX = ( ( contentNr % TILESET_WIDTH ) | 0 ) * TILE_SIZE_X;
    var tilesetY = ( ( contentNr / TILESET_WIDTH ) | 0 ) * TILE_SIZE_Y;
    this.board.background[index].style = "background-position: -" + tilesetX + "px -" + tilesetY + "px;";
}

game.setTile = function( index, contentNr ) {
    if ( contentNr == null ) {
        this.board.tiles[index].style = "opacity: 0;";
        this.board.content[index] = contentNr;
        return;
    }
    this.board.content[index] = contentNr;
    var tilesetX = ( ( contentNr % TILESET_WIDTH ) | 0 ) * TILE_SIZE_X;
    var tilesetY = ( ( contentNr / TILESET_WIDTH ) | 0 ) * TILE_SIZE_Y;
    this.board.tiles[index].style = "background-position: -" + tilesetX + "px -" + tilesetY + "px;";

if ( contentNr != 22 ) {
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

}

game.mapCharMapping = [
    ['+',0],
    ['&',4],
    ['#',7],
    ['>',10],
    ['<',11],
    ['~',12],
    ['^',13],
    ['|',22],
];

game.mapCharMap = new Map( game.mapCharMapping );

game.updateTitle = function() {
    var hero = this.hero;
    document.title = "X: " + hero.x + "\u2007 Y: " + hero.y + "\u2007 Z: " + hero.z;
}

game.updateStats = function() {
    var hero = this.hero;
    this.dom.statPanel.innerHTML = "HP: " + hero.hp + " ATT: " + hero.att + " DEF: " + hero.def
                               + "<br />XP: " + hero.xp + " LEV: " + hero.level + " $$: " + hero.gold;
}

game.updateInventory = function() {

}

game.updateBoard = function() {

}

game.update = function() {
    this.updateTitle();
    this.updateStats();
    this.updateInventory();
    this.updateBoard();
}

game.init = function() {
    console.log( "game.init();" );
    var dom = this.dom;
    dom.inventoryPanel = document.getElementById( id.inventoryPanel );
    dom.statPanel = document.getElementById( id.statPanel );
    dom.boardBackground = document.getElementById( id.boardBackground );
    dom.board = document.getElementById( id.board );

    game.createDefaultBackground();
    game.createEmptyBoard();

    var widthStr = "width: " + TILE_SIZE_X * BOARD_SIZE_X + "px; ";
    dom.statPanel.style = widthStr;
    dom.inventoryPanel.style = widthStr;
    dom.boardBackground.style = widthStr;
    dom.board.style = widthStr + "top: -" + TILE_SIZE_Y * BOARD_SIZE_Y + "px; ";

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

    this.updateTitle();
    this.updateStats();
}

//document.addEventListener('DOMContentLoaded', game.init );
window.onload = function() {
    game.init();
};
