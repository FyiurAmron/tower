'use strict';

// business logic

const TILE_SIZE_X = 32;
const TILE_SIZE_Y = 32;
const TILESET_WIDTH = 11;

const DEFAULT_BOARD_CONTENT = 5;

const BOARD_SIZE_X = 16;
const BOARD_SIZE_Y = 24;
const BOARD_SIZE_TOTAL = BOARD_SIZE_X * BOARD_SIZE_Y;

const board = {
    background: new Array( BOARD_SIZE_TOTAL ),
    tiles: new Array( BOARD_SIZE_TOTAL ),
    content: new Array( BOARD_SIZE_TOTAL )
};

var hero = {
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

const dom = {};

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

function createDefaultBackground( boardBackgroundDom ) {
    for ( var i = 0, x = 0/*, y = 0*/; i < BOARD_SIZE_TOTAL; i++, x++ ) {
        var tile = document.createElement( DIV_TAG );
        tile.classList.add( TILE_CLASS );
        board.background[i] = tile;
        if ( x === BOARD_SIZE_X ) {
            dom.boardBackground.appendChild( document.createElement( BR_TAG ) );
            x = 0;
            //y++;
        }
        dom.boardBackground.appendChild( tile ); // use positioning instead?
        setBackground( i, DEFAULT_BOARD_CONTENT );
    }
}

function createEmptyBoard( boardDom ) {
    for ( var i = 0, x = 0/*, y = 0*/; i < BOARD_SIZE_TOTAL; i++, x++ ) {
        var tile = document.createElement( DIV_TAG );
        tile.classList.add( TILE_CLASS );
        board.tiles[i] = tile;
        if ( x === BOARD_SIZE_X ) {
            dom.board.appendChild( document.createElement( BR_TAG ) );
            x = 0;
            //y++;
        }
        dom.board.appendChild( tile ); // use positioning instead?
        setTile( i, null );
    }
}

function setBackground( x, y, content ) {
    setBackground( x + y * BOARD_SIZE_X, content );
}

function setTile( x, y, content ) {
    setTile( x + y * BOARD_SIZE_X, content );
}

function setBackground( index, contentNr ) {
    var tilesetX = ( ( contentNr % TILESET_WIDTH ) | 0 ) * TILE_SIZE_X;
    var tilesetY = ( ( contentNr / TILESET_WIDTH ) | 0 ) * TILE_SIZE_Y;
    board.background[index].style = "background-position: -" + tilesetX + "px -" + tilesetY + "px;";
}

function setTile( index, contentNr ) {
    if ( contentNr == null ) {
        board.tiles[index].style = "opacity: 0;";
        board.content[index] = contentNr;
        return;
    }
    board.content[index] = contentNr;
    var tilesetX = ( ( contentNr % TILESET_WIDTH ) | 0 ) * TILE_SIZE_X;
    var tilesetY = ( ( contentNr / TILESET_WIDTH ) | 0 ) * TILE_SIZE_Y;
    board.tiles[index].style = "background-position: -" + tilesetX + "px -" + tilesetY + "px;";

if ( contentNr != 22 ) {
return;
}
board.tiles[index].animate([
  // keyframes
  { transform: 'rotate(0deg)' }, 
  { transform: 'rotate(360deg)' }
], { 
  // timing options
  duration: 1000,
  iterations: Infinity
});

}

var mapCharMapping = [
    ['+',0],
    ['&',4],
    ['#',7],
    ['>',10],
    ['<',11],
    ['~',12],
    ['^',13],
    ['|',22],
];

var mapCharMap = new Map( mapCharMapping );

function updateTitle() {
    document.title = "X: " + hero.x + "\u2007 Y: " + hero.y + "\u2007 Z: " + hero.z;
}

function updateStats() {
    dom.statPanel.innerHTML = "HP: " + hero.hp + " ATT: " + hero.att + " DEF: " + hero.def
                               + "<br />XP: " + hero.xp + " LEV: " + hero.level + " $$: " + hero.gold;
}

function updateInventory() {

}

function updateBoard() {

}

function update() {
    updateTitle();
    updateStats();
    updateInventory();
    updateBoard();
}

//document.addEventListener('DOMContentLoaded', function() {
window.onload = function() {
    dom.inventoryPanel = document.getElementById( id.inventoryPanel );
    dom.statPanel = document.getElementById( id.statPanel );
    dom.boardBackground = document.getElementById( id.boardBackground );
    dom.board = document.getElementById( id.board );

    createDefaultBackground( dom.boardBackground );
    createEmptyBoard( dom.board );

    var widthStr = "width: " + TILE_SIZE_X * BOARD_SIZE_X + "px; ";
    dom.statPanel.style = widthStr;
    dom.inventoryPanel.style = widthStr;
    dom.boardBackground.style = widthStr;
    dom.board.style = widthStr + "top: -" + TILE_SIZE_Y * BOARD_SIZE_Y + "px; ";

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
            var contentNr = DEFAULT_BOARD_CONTENT;
            //alert( pos + " " + c );
            
            setTile( pos, mapCharMap.get( c ) );
        }
    } );

    updateTitle();
    updateStats();
}
;
//);