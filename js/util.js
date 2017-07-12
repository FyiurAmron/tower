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