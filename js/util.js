"use strict";

/* jslint node: true */

//
// top-level util functions
//

var logToConsole = true;
var logToAlert = false;

var debug = true;

function logDebug( str ) {
    if ( debug ) {
        console.log( "debug: " + str );
    }
}

function logInfo( str ) {
    if ( logToConsole ) {
        console.info( "Info: " + str );
    }
}

function logError( str ) {
    if ( logToConsole ) {
        console.warn( "ERROR: " + str );
    }
    if ( logToAlert ) {
        alert( "ERROR: " + str );
    }
}

function padZero( str, zeroes ) {
    return ( "0".repeat( zeroes ) + str ).slice( -zeroes );
}

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
            logError( "'" + url + "' could not be loaded from server!" );
            logError( "req.readyState === " + req.readyState + " req.status === " + req.status );
        }
    };
    req.send();
    return req.response;
}

function updateProgressBar( progressBarDom, ratio ) {
    if ( progressBarDom !== undefined ) {
        progressBarDom.style.width = ( ( 100 * ratio ) | 0 ) + "%";
    }
}

function reflow( domElem ) {
    if ( domElem === undefined ) {
        domElem = document.documentElement;
    }
    void( domElem.offsetHeight );
}

function endAnimation( evt ) {
    evt.target.style.animation = "";
}

function animateOneShot( domElem, animStr, force ) {
    if ( force || domElem.style.animation !== animStr ) {
        domElem.style.animation = animStr;
    }
    domElem.addEventListener( "animationend", endAnimation );
}

function scriptLoader( srcs, head, progressBarDom, callback ) {
    var script, cb;
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
        cb = function() {
            head.appendChild( scripts[i] );
            updateProgressBar( progressBarDom, i / cnt );
        };
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

class Fifo {
    constructor( srcArr ) {
        this.data = ( srcArr !== undefined ) ? srcArr.slice() : [];
        this.idx = 0;
    }

    push( value ) {
        this.data.push( value );
    }

    pop() {
        // return this.data[this.idx++];
        var ret = this.data[this.idx];
        this.idx++;
        return ret;
    }

    size() {
        return this.data.length - this.idx;
    }
}

class Dom {
  constructor( doc ) {
    this.doc = doc;
    this.head = doc.getElementsByTagName( HEAD_TAG )[0];

    for( var id in ID ) {
        this[id] = doc.getElementById( ID[id] );
    }

    for( var sel in QUERY_STR ) {
        this[sel] = doc.querySelector( QUERY_STR[sel] );
    }
  }
}
