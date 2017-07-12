"use strict";

/* jslint node: true */

const AUDIO_PATH = "audio/";
/* const AUDIO_EXTENSION = ".mp3"; */
const AUDIO_FILES = [
  "punch.mp3", "bgm00.mp3",
];

const DEFAULT_FADE_TIME = 2.0;

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

    this.sfxGain = this.context.createGain();
    this.bgmGain = this.context.createGain();

    this.sfxGain.connect( this.context.destination );
    this.bgmGain.connect( this.context.destination );

    // TODO store base gain values (vs fades)
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

  playBgm( name ) {
    return this.playNamed( name, true, this.bgmGain );
  }

  playSfx( name ) {
    return this.playNamed( name, false, this.sfxGain );
  }

  play( buffer, looped, gainNode ) {
    var bs = this.context.createBufferSource();
    bs.buffer = buffer;
    bs.connect( gainNode );
    //bs[bs.start ? 'start' : 'noteOn'](time);
    if ( looped ) {
        bs.loop = true;
        this.activeLoopSources.add( bs );
    }
    bs.start();
    return bs;
  }

  playNamed( name, looped, gainNode ) {
    var bs = this.play( this.bufferMap.get( name ), looped, gainNode );
    if ( looped ) {
        bs.loop = true;
        this.activeLoopNames.set( name, bs );
    }
    return bs;
  }

/*
  stopLoop( name ) {
  }
*/
  fadeOutBgm() {
    this.bgmGain.gain.linearRampToValueAtTime( 0.0, this.context.currentTime + DEFAULT_FADE_TIME );
  }

  stopAllLoops() {
    for( var loop of this.activeLoopSources ) {
        loop.stop();
    }
  }
}