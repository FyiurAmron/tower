"use strict";

/* jslint node: true */

//
// util functions
//

function readFile( filename, async, callback ) {
    if ( async === undefined ) {
        async = false;
    }
    var req = new XMLHttpRequest();
    req.open( "GET", filename, async );
    req.onreadystatechange = function( evt ) {
        if ( req.readyState !== 4 ) {
            return;
        }
        if ( req.responseText !== null ) {
            if ( callback !== undefined ) {
                callback( req.responseText );
            }
        } else {
            alert( "'" + filename + "' could not be loaded from server!" );
            alert( "req.readyState === " + req.readyState + " req.status === " + req.status );
        }
    };
    req.send( null );
    return req.responseText;
}
