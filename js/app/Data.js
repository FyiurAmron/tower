"use strict";

/* jslint node: true */

const DATA_PATH = "data/";
const DATA_EXTENSION = ".json";
const DATA_FILES = [
  "charMap", "proto", "stageNameMap",
];

class Data {
  constructor( loadArray ) {
    this.loadArray = loadArray;
    this.loadSize = loadArray.length;
    this.loadSet = new Set( loadArray );
  }
  
  init( progressBarDom, callback ) {
    var cnt = this.loadSize;
    var ls = this.loadSet;
    var la = this.loadArray;
    var that = this;
    for( let i = 0; i < cnt; i++ ) {

        readXhr( DATA_PATH + la[i] + DATA_EXTENSION, true, function( dataStr ) {
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