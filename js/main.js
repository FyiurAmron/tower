"use strict";

/* jslint node: true */

//document.addEventListener('DOMContentLoaded', game.init );
window.onload = function() {
  document.fonts.ready.then( function() {
    var dom = new Dom( document );
    var cn = dom.loadingPanel.children;
    for( var child of cn ) {
        child.style.opacity = 1.0;
    }

    scriptLoader( IMPORT_SCRIPTS, dom.head, dom.loadingPanelScriptProgressBar, function() {
      readXhr( "css/tower.template.css", true, function( cssStr ) {
        var css = document.createElement( "style" );
        css.innerHTML = cssStr
          .replace( /%%tileSizeX%%/g, TILE_SIZE_X )
          .replace( /%%tileSizeY%%/g, TILE_SIZE_Y );
        document.head.appendChild( css );

        var game = new Game( dom );

// init debug here
        game.inv.content[2] = 55;
        game.inv.content[5] = 48;
// end of init debug

        game.init();
      } );
    } );
  } );
};
