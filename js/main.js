"use strict";

/* jslint node: true */

function afterPreload() {
    document.fonts.ready.then( main );
}

function main() {
    var dom = new Dom( document );

    for( var child of dom.loadingPanel.children ) {
        child.style.opacity = 1.0;
    }

    scriptLoader( IMPORT_SCRIPTS, dom.head, dom.loadingPanelScriptsProgressBar, function() {
        appInit( dom );
    } );
}

//document.addEventListener( 'DOMContentLoaded', afterPreload );
window.onload = afterPreload;
