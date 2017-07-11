"use strict";

// scriptLoader

const SCRIPT_PATH = "js/";
const IMPORT_SCRIPTS = [
  "const.js", "util.js", "data.js",
  "tileset.js", "inventory.js", "board.js", "hero.js",
  "game.js"
];

const HEAD_TAG = "head";
const SCRIPT_TAG = "script";
const SCRIPT_TYPE = "text/javascript";

function scriptLoader( srcs, callback ) {
    var script;
    var head = document.getElementsByTagName( HEAD_TAG )[0];
    var cnt = srcs.length;
    var scripts = new Array( cnt );

    for( var i = 0; i < cnt; i++ ) {
        script = document.createElement( SCRIPT_TAG );
        script.type = SCRIPT_TYPE;
        script.src = SCRIPT_PATH + srcs[i];
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

// end of scriptLoader

//document.addEventListener('DOMContentLoaded', game.init );
window.onload = function() {
    scriptLoader( IMPORT_SCRIPTS, function() {
      readFile( "css/tower.template.css", true, function( cssStr ) {
        var css = document.createElement( "style" );
        css.innerHTML = cssStr
          .replace( /%%tileSizeX%%/g, TILE_SIZE_X )
          .replace( /%%tileSizeY%%/g, TILE_SIZE_Y );
        document.head.appendChild( css );

        var game = new Game();

// init debug here
        game.inv.content[2] = 55;
        game.inv.content[5] = 48;
// end of init debug

        game.init( function() {
          document.getElementById( "main-panel" ).style.display = "initial";
        } );
      } );
    } );
};
