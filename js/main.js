"use strict";

const IMPORT_SCRIPTS = [
  "const.js", "helper.js",
  "tileset.js", "inventory.js", "board.js", "hero.js",
  "game.js"
];

// JS loader

const HEAD_TAG = "head";
const SCRIPT_TAG = "script";
const JS_TYPE = "text/javascript";
const JS_PATH = "js/";

function jsLoader( srcs, callback ) {
    var script;
    var head = document.getElementsByTagName( HEAD_TAG )[0];
    var cnt = srcs.length;
    var scripts = new Array( cnt );

    for( var i = 0; i < cnt; i++ ) {
        script = document.createElement( SCRIPT_TAG );
        script.type = JS_TYPE;
        script.src = JS_PATH + srcs[i];
        scripts[i] = script;
    }

    head.appendChild( scripts[0] );

    for( let i = 1; i < cnt; i++ ) {
        var cb = function() {
            head.appendChild( scripts[i] );
        }
        script = scripts[i - 1];
        script.onreadystatechange = cb;
        script.onload = cb;
    }

    script = scripts[cnt - 1];
    script.onreadystatechange = callback;
    script.onload = callback;
}

// end of JS loader

//document.addEventListener('DOMContentLoaded', game.init );
window.onload = function() {
    jsLoader( IMPORT_SCRIPTS, function() {
        var game = new Game();

// init debug here
        game.inv.content[2] = 55;
        game.inv.content[5] = 48;
// end of init debug

        game.init( function() {
          document.getElementById( "mainPanel" ).style.display = "initial";
        } );
    } );
};
