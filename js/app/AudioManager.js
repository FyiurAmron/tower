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

    this.bgmGain = this.context.createGain();
    this.sfxGain = this.context.createGain();

    this.bgmGain.gain.currentMaxValue = 1.0;
    this.sfxGain.gain.currentMaxValue = 1.0;

    this.bgmGain.connect( this.context.destination );
    this.sfxGain.connect( this.context.destination );
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

  defaultFadeEndTime() {
    return this.context.currentTime + DEFAULT_FADE_TIME;
  }

  toggleMute( fade ) {
    var bgmTarget, sfxTarget;
    var sgg = this.sfxGain.gain;
    var bgg = this.bgmGain.gain;
    var muteState;
    if ( bgg.value !== 0 && sgg.value !== 0 ) { // mute
        bgmTarget = 0;
        sfxTarget = 0;
        muteState = true;
    } else {
        bgmTarget = bgg.currentMaxValue;
        sfxTarget = sgg.currentMaxValue;
        muteState = false;
    }
    if ( fade ) {
        bgg.linearRampToValueAtTime( bgmTarget, this.defaultFadeEndTime() );
        sgg.linearRampToValueAtTime( sfxTarget, this.defaultFadeEndTime() );
    } else {
        bgg.value = bgmTarget;
        sgg.value = sfxTarget;
    }
    return muteState;
  }

  setMaxGains( bgmMaxValue, sfxMaxValue, fade ) {
    var sgg = this.sfxGain.gain;
    var bgg = this.bgmGain.gain;
    sgg.currentMaxValue = sfxMaxValue;
    bgg.currentMaxValue  = bgmMaxValue;
    if ( fade ) {
        if ( sgg.value !== 0 ) {
            sgg.linearRampToValueAtTime( sfxMaxValue, this.defaultFadeEndTime() );
        }
        if ( bgg.value !== 0 ) {
            bgg.linearRampToValueAtTime( bgmMaxValue, this.defaultFadeEndTime() );
        }
    } else {
        sgg.value = sfxMaxValue;
        bgg.value = bgmMaxValue;
    }
  }

  fadeInBgm() {
    this.bgmGain.gain.linearRampToValueAtTime( this.bgmGain.gain.currentMaxValue, this.defaultFadeEndTime() );
  }

  fadeOutBgm() {
    this.bgmGain.gain.linearRampToValueAtTime( 0.0, this.defaultFadeEndTime() );
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
  stopAllLoops() {
    for( var loop of this.activeLoopSources ) {
        loop.stop();
    }
  }
}