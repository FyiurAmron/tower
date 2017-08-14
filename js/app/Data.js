"use strict";

/* jslint node: true */

class Data {
  constructor() {
    this.loadArray = null;
    this.loadSize = null;
    this.loadSet = null;
    this.dataConfig = null;
  }
  
  init( dataConfig, progressBarDom, callback ) {
    var dataFiles = dataConfig.dataFiles;
    var dataPath = dataConfig.dataPath;
    var dataExtension = dataConfig.dataExtension;

    this.dataConfig = dataConfig;

    this.loadArray = dataFiles;
    this.loadSize = dataFiles.length;
    this.loadSet = new Set( dataFiles );

    var cnt = this.loadSize;
    var ls = this.loadSet;
    var la = this.loadArray;
    var that = this;
    for( let i = 0; i < cnt; i++ ) {

        readXhr( dataPath + la[i] + dataExtension, true, function( dataStr ) {
            that[la[i]] = JSON.parse( dataStr );

            ls.delete( la[i] );
            updateProgressBar( progressBarDom, 1.0 - ( ls.size / cnt ) );
            if ( ls.size === 0 ) {
                callback();
            }
        } );
    }
  }
}