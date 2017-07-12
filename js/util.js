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
