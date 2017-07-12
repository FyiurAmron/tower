"use strict";

/* jslint node: true */

const DATA_PATH = "data/";
const DATA_EXTENSION = ".json";
const DATA_FILES = [
  "charMap", "proto", "stageNameMap",
];

class Data {
  constructor() {
    this.loadSet = new Set( DATA_FILES );
  }
  
  init( callback ) {
    var cnt = DATA_FILES.length;

    var ls = this.loadSet;
    var that = this;
    for( let i = 0; i < cnt; i++ ) {
        readXhr( DATA_PATH + DATA_FILES[i] + DATA_EXTENSION, true, function( dataStr ) {
            that[DATA_FILES[i]] = JSON.parse( dataStr );
            ls.delete( DATA_FILES[i] );
            if ( ls.size === 0 ) {
                callback();
            }
        } );
    }
  }
}