"use strict";

/* jslint node: true */

class AudioManager {
  constructor() {
    this.context = new ( window.AudioContext || window.webkitAudioContext )();
    this.buffer = null;
  }

  loadUrl( url, callback ) {
    var that = this;
    readXhr( url, true, function( data ) {
        that.context.decodeAudioData( data, function( buffer ) {
            that.buffer = buffer;
            if ( callback !== undefined ) {
                callback( buffer );
            }
        } );
    }, "arraybuffer" );
  }

  // TODO preloading init like Data class etc.
  // streaming music also

  play( buffer ) {
      var source = this.context.createBufferSource();
      source.buffer = buffer;
      source.connect( this.context.destination );
      //source[source.start ? 'start' : 'noteOn'](time);
      source.start();
  }
}