"use strict";

/* jslint node: true */

//
// app-level util functions
//

var game = null;

var cssReplacements = [
    [ /%%tileSizeX%%/g, TILE_SIZE_X ],
    [ /%%tileSizeY%%/g, TILE_SIZE_Y ],
];

function appInit( dom ) {
    readXhr( "css/tower.template.css", true, function( cssStr ) {

        for( var repl of cssReplacements ) {
            cssStr = cssStr.replace( repl[0], repl[1] );
        }

        var css = document.createElement( "style" );
        css.innerHTML = cssStr;
        document.head.appendChild( css );

        game = new Game( dom );

// init debug here
//        game.inv.content[2] = 55;
//        game.inv.content[5] = 48;
// end of init debug

        game.init();

        logInfo( "game.init() completed." );
    } );
}

const DIR_NAMES     = [ "up", "right", "down", "left" ];
const DIR_NAMES_CAP = [ "Up", "Right", "Down", "Left" ];

// note: the Y direction is in screen coordinates (reversed vs Carthesian)
function descriptionFromDirection( x, y, x2, y2, capitalize ) {
    var distX = x - x2;
    var distY = y - y2;
    var idx = ( Math.abs( distX ) > Math.abs( distY ) )
        ? ( ( distX > 0 ) ? 1 : 3 )
        : ( ( distY > 0 ) ? 2 : 0 );
    return ( capitalize ? DIR_NAMES_CAP : DIR_NAMES )[idx];
}

function isAdjacent( x, y, x2, y2 ) { // corners excluded; (+1,0),(-1,0),(0,+1),(0,-1)
    return Math.abs( x - x2 ) + Math.abs( y - y2 ) === 1;
}

//function calcManhattanDistance( sourcePos, targetPos

function findManhattanPathXY( array, sizeX, sizeY, sourceX, sourceY, targetX, targetY ) {
    return findManhattanPath( array, sizeX, sizeY, sourceX + sourceY * sizeX, targetX + targetY * sizeX );
}

function findManhattanPath( array, sizeX, sizeY, sourcePos, targetPos ) {
return findManhattanPathNew( array, sizeX, sizeY, sourcePos, targetPos ); // DEBUG
    // note: undefined in input array => path possible; any other value blocks

    var lastRow = ( sizeY - 1 ) * sizeX;
    var lastCol = sizeX - 1;

    var fringe = new Fifo();
    fringe.push( sourcePos );

    var cameFrom = array.map( function(x) {
        return ( x === undefined ) ? undefined : -1;
    } );

    var ret;
var it = 0; // DEBUG
    var processDest = function( pos, dest ) {
it++; // DEBUG
        if ( cameFrom[dest] !== undefined ) {
            return false;
        }
        cameFrom[dest] = pos;
        if ( dest !== targetPos ) {
            fringe.push( dest );
            return false;
        }
        var path = [];
        for ( var pos = targetPos; pos !== sourcePos; pos = cameFrom[pos] ) {
            path.push( pos );
        }
        path.push( sourcePos );
        ret = path.reverse();
logInfo( "fMP iterations: " + it ); // DEBUG
// 425/613 it for lower/upper left arena corners
        return true;
    };
    
    while ( fringe.size() > 0 ) {
        var pos = fringe.pop();

        if ( pos >= sizeX ) { // not 1st row; can go up
            if ( processDest( pos, pos - sizeX ) ) {
                return ret;
            }
        }
        if ( pos < lastRow ) { // not last row; can go down
            if ( processDest( pos, pos + sizeX ) ) {
                return ret;
            }
        }
        var x = pos % sizeX;
        if ( x !== 0 ) { // not 1st col; can go left
            if ( processDest( pos, pos - 1 ) ) {
                return ret;
            }
        }
        if ( x !== lastCol ) { // not last col; can go right
            if ( processDest( pos, pos + 1 ) ) {
                return ret;
            }
        }

    }

    return null; // no path found
}
/*
class WeightedNode {
    constructor( weight, node ) {
        this.weight = weight;
        this.node = node;
    }
}
*/
/*
class BinaryHeap {
    constructor() {
        this.root = null;
    }

    insert( weight, node ) {
        while( parent !== undefined ) {
            
        }
        last = this.root;
        if ( last.left
    }
}
*/

function findManhattanPathNew( array, sizeX, sizeY, sourcePos, targetPos ) {
    // note: undefined in input array => path possible; any other value blocks

    var lastRow = ( sizeY - 1 ) * sizeX;
    var lastCol = sizeX - 1;
    var targetX = targetPos % sizeX;
    var targetY = ( targetPos / sizeX ) | 0;

    var fringe = new Fifo();
    fringe.push( sourcePos );
    var miniQ = new Fifo();

    var cameFrom = array.map( function(x) {
        return ( x === undefined ) ? undefined : -1;
    } );

    var ret;
var it = 0; // DEBUG
    var processDest = function( pos, dest ) {
it++; // DEBUG
        if ( cameFrom[dest] !== undefined ) {
            return false;
        }
        cameFrom[dest] = pos;
        if ( dest !== targetPos ) {
            fringe.push( dest );
            return false;
        }
        var path = [];
        for ( var pos = targetPos; pos !== sourcePos; pos = cameFrom[pos] ) {
            path.push( pos );
        }
        path.push( sourcePos );
        ret = path.reverse();
logInfo( "fMPN iterations: " + it ); // DEBUG
        return true;
    };
    
    while ( fringe.size() > 0 ) {
        var pos = fringe.pop();

        var posX = pos % sizeX;
        var posY = ( pos / sizeX ) | 0;
        
        if ( pos >= sizeX ) { // not 1st row; can go up
            miniQ.push( pos - sizeX );
        }
        if ( pos < lastRow ) { // not last row; can go down
            miniQ.push( pos + sizeX );
        }
        if ( posX !== 0 ) { // not 1st col; can go left
            miniQ.push( pos - 1 );
        }
        if ( posX !== lastCol ) { // not last col; can go right
            miniQ.push( pos + 1 );
        }

        while( miniQ.size() > 0 ) {
            if ( processDest( pos, miniQ.pop() ) ) {
                return ret;
            }
        }
    }

    return null; // no path found
}
