"use strict";

/* jslint node: true */

class AudioManager {
  constructor() {
    this.loadArray = null;
    this.loadSize = null;
    this.loadSet = null;

    this.audioConfig = null;

    var AudioContext = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContext();
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

  init( audioConfig, progressBarDom, callback ) {
    this.audioConfig = audioConfig;

    var loadArray = audioConfig.audioFiles;
    var audioPath = audioConfig.audioPath;

    this.loadArray = loadArray;
    this.loadSize = loadArray.length;
    this.loadSet = new Set( loadArray );

    var cnt = this.loadSize;
    var ls = this.loadSet;
    var la = this.loadArray;
    var that = this;
    for( let i = 0; i < cnt; i++ ) {

        this.loadUrl( audioPath + la[i] /* + AUDIO_EXTENSION */, function( buf ) {
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
    return this.context.currentTime + this.audioConfig.defaultFadeTime;
  }

  toggleMute( fade, bgm, sfx ) {
    var bgmTarget, sfxTarget;
    var sgg = this.sfxGain.gain;
    var bgg = this.bgmGain.gain;
    var muteState;

    if ( ( !bgm || bgg.value !== 0 ) && ( !sfx || sgg.value !== 0 ) ) { // mute
        if ( bgm ) {
            bgmTarget = 0;
        }
        if ( sfx ) {
           sfxTarget = 0;
        }
        muteState = true;
    } else {
        if ( bgm ) {
            bgmTarget = bgg.currentMaxValue;
        }
        if ( bgm ) {
            sfxTarget = sgg.currentMaxValue;
        }
        muteState = false;
    }
    if ( fade ) {
        if ( bgm ) {
            bgg.linearRampToValueAtTime( bgmTarget, this.defaultFadeEndTime() );
        }
        if ( sfx ) {
            sgg.linearRampToValueAtTime( sfxTarget, this.defaultFadeEndTime() );
        }
    } else {
        if ( bgm ) {
            bgg.value = bgmTarget;
        }
        if ( sfx ) {
            sgg.value = sfxTarget;
        }
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
    var buffer = this.bufferMap.get( name );
    if ( buffer === undefined ) {
        return logError( "audio '" + name + "' is not loaded and can't be played" );
    }
    var bs = this.play( buffer, looped, gainNode );
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