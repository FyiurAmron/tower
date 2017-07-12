"use strict";

/* jslint node: true */

const AUDIO_PATH = "audio/";
/* const AUDIO_EXTENSION = ".mp3"; */
const AUDIO_FILES = [
  "punch.mp3", "bgm00.mp3",
];

class AudioManager {
  constructor( loadArray ) {
    this.loadArray = loadArray;
    this.loadSize = loadArray.length;
    this.loadSet = new Set( loadArray );

    this.context = new ( window.AudioContext || window.webkitAudioContext )();
    this.lastBuffer = null;
    this.bufferMap = new Map();
    this.activeLoopSources = new Set();
    this.activeLoopNames = new Map();
  }

  init( progressBarDom, callback ) {
    var cnt = this.loadSize;
    var ls = this.loadSet;
    var la = this.loadArray;
    var that = this;
    for( let i = 0; i < cnt; i++ ) {

        this.loadUrl( AUDIO_PATH + la[i] /* + AUDIO_EXTENSION */, function( buf ) {
            that.bufferMap.set( la[i], buf );

            ls.delete( la[i] );
            updateProgressBar( progressBarDom, 1.0 - ( ls.size / cnt ) );
            if ( ls.size === 0 ) {
                callback();
            }
        } );
    }
  }

  loadUrl( url, callback ) {
    var that = this;
    readXhr( url, true, function( data ) {
        that.context.decodeAudioData( data, function( buf ) {
            that.lastBuffer = buf;
            if ( callback !== undefined ) {
                callback( buf );
            }
        } );
    }, "arraybuffer" );
  }

  // TODO streaming music

  play( buffer, looped ) {
    var bs = this.context.createBufferSource();
    bs.buffer = buffer;
    bs.connect( this.context.destination );
    //bs[bs.start ? 'start' : 'noteOn'](time);
    if ( looped ) {
        bs.loop = true;
        this.activeLoopSources.add( buffer );
    }
    bs.start();
    return bs;
  }

  playNamed( name, looped ) {
    var bs = this.play( this.bufferMap.get( name ), looped );
    if ( looped ) {
        bs.loop = true;
        this.activeLoopNames.set( name, bs );
    }
  }

/*
  stopLoop( name ) {
  }
*/

  stopAllLoops() {
    for( var loop of this.activeLoops ) {
        loop.stop();
    }
  }
}