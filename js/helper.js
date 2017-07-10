"use strict";

/* jslint node: true */

//
// helper functions
//

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
