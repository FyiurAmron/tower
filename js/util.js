"use strict";

/* jslint node: true */

//
// util functions
//

function readXhr( url, async, callback, responseType ) {
    if ( async === undefined ) {
        async = false;
    }
    var req = new XMLHttpRequest();
    req.open( "GET", url, async );
    if ( responseType !== undefined ) {
        req.responseType = responseType;
    }
    req.onreadystatechange = function( evt ) {
        if ( req.readyState !== 4 ) {
            return;
        }
        if ( req.response !== null ) {
            if ( callback !== undefined ) {
                callback( req.response );
            }
        } else {
            alert( "'" + url + "' could not be loaded from server!" );
            alert( "req.readyState === " + req.readyState + " req.status === " + req.status );
        }
    };
    req.send();
    return req.response;
}

function isAdjacent( x, y, x2, y2 ) { // corners excluded; (+1,0),(-1,0),(0,+1),(0,-1)
    return Math.abs( x - x2 ) + Math.abs( y - y2 ) === 1;
}

function updateProgressBar( progressBarDom, ratio ) {
    if ( progressBarDom !== undefined ) {
        progressBarDom.style.width = ( ( 100 * ratio ) | 0 ) + "%";
    }
}

function scriptLoader( srcs, head, progressBarDom, callback ) {
    var script;
    var cnt = srcs.length;
    var scripts = new Array( cnt );

    for( var i = 0; i < cnt; i++ ) {
        script = document.createElement( SCRIPT_TAG );
        script.type = SCRIPT_TYPE;
        script.src = APP_SCRIPT_PATH + srcs[i];
        scripts[i] = script;
    }

    head.appendChild( scripts[0] );

    for( let i = 1; i < cnt; i++ ) {
        var cb = function() {
            head.appendChild( scripts[i] );
            updateProgressBar( progressBarDom, i / cnt );
        }
        script = scripts[i - 1];
        script.onreadystatechange = cb;
        script.onload = cb;
    }

    script = scripts[cnt - 1];
    if ( progressBarDom !== undefined ) {
        cb = callback;
        callback = function() {
            updateProgressBar( progressBarDom, 1.0 );
            cb();
        };
    }
    script.onreadystatechange = callback;
    script.onload = callback;
}

function findManhattanPathXY( array, sizeX, sizeY, sourceX, sourceY, targetX, targetY ) {
    return findManhattanPath( array, sizeX, sizeY, sourceX + sourceY * sizeX, targetX + targetY * sizeX );
}

function findManhattanPath( array, sizeX, sizeY, sourcePos, targetPos ) {
    // note: undefined in input array => path possible; any other value blocks

    var lastRow = ( sizeY - 1 ) * sizeX;
    var lastCol = sizeX - 1;

    var frontier = new Set( [ sourcePos ] );
    var cameFrom = array.map( function(x) {
        return ( x === undefined ) ? undefined : -1;
    } );

    var ret;
    var processDest = function( pos, dest ) {
        if ( cameFrom[dest] !== undefined ) {
            return false;
        }
        cameFrom[dest] = pos;
        if ( dest !== targetPos ) {
            frontier.add( dest );
            return false;
        }
        var path = [];
        for ( var pos = targetPos; pos !== sourcePos; pos = cameFrom[pos] ) {
            path.push( pos );
        }
        path.push( sourcePos );
        ret = path.reverse();
        return true;
    };
    
    while ( frontier.size !== 0 ) {
        var oldFrontier = new Set( frontier );
        for ( var pos of oldFrontier ) {
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

            frontier.delete( pos );
        }
    }

    //return cameFrom;
    return null; // no path found
}

class Dom {
  constructor( doc ) {
    this.doc = doc;
    this.head = doc.getElementsByTagName( HEAD_TAG )[0];

    this.inventoryPanel = doc.getElementById( ID.inventoryPanel );
    this.statPanel = doc.getElementById( ID.statPanel );
    this.boardBackground = doc.getElementById( ID.boardBackground );
    this.boardForeground = doc.getElementById( ID.boardForeground );
    this.gamePanel = doc.getElementById( ID.gamePanel );
    this.mainPanel = doc.getElementById( ID.mainPanel );
    this.loadingPanel = doc.getElementById( ID.loadingPanel );
    this.loadingPanelWrapper = doc.getElementById( ID.loadingPanelWrapper );
    this.configButton = doc.getElementById( ID.configButton );

    this.loadingPanelScriptProgressBar = doc.querySelector( QUERY_STR.loadingPanelScriptsProgressBar );
    this.loadingPanelDataProgressBar   = doc.querySelector( QUERY_STR.loadingPanelDataProgressBar );
    this.loadingPanelAudioProgressBar  = doc.querySelector( QUERY_STR.loadingPanelAudioProgressBar );
  }
}
