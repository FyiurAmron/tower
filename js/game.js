"use strict";

/* jslint node: true */
/* jslint laxbreak: true */

class Game {
  constructor() {
    this.hero = new Hero();
    this.tileset = new TileSet( TILE_SIZE_X, TILE_SIZE_Y, TILESET_COLUMNS, TILE_CLASS, TILE_TYPE_CLASS_PREFIX );
    this.bg = new Board( this.tileset, BOARD_SIZE_TOTAL, "bg" );
    this.fg = new Board( this.tileset, BOARD_SIZE_TOTAL, "fg" );
    this.inv = new Inventory( this.tileset, INVENTORY_SIZE );
    this.dom = {};
    this.mapBgCharMap = null;
    this.mapFgCharMap = null;
    this.jsonData = null;
  }

  init( callback ) {
    console.log( "game.init();" );
    var dom = this.dom;
    dom.inventoryPanel = document.getElementById( id.inventoryPanel );
    dom.statPanel = document.getElementById( id.statPanel );
    dom.boardBackground = document.getElementById( id.boardBackground );
    dom.boardForeground = document.getElementById( id.boardForeground );
    dom.gamePanel = document.getElementById( id.gamePanel );

    this.inv.init( dom.inventoryPanel );
    this.bg.init( dom.boardBackground );
    this.fg.init( dom.boardForeground );

    var widthStr = "width: " + TILE_SIZE_X * BOARD_SIZE_X + "px; ";
    dom.statPanel.style = widthStr;
    dom.inventoryPanel.style = widthStr;
    dom.gamePanel.style = widthStr;
    //dom.boardBackground.style = widthStr;
    //dom.board.style = widthStr;

    var that = this;
    this.loadJsonData( "charMap.json", function() {
        that.mapBgCharMap = new Map( that.jsonData.mapBgCharRaw );
        that.mapFgCharMap = new Map( that.jsonData.mapFgCharRaw );
        that.loadMap( "0", function() {
            that.update( false, function() {
                callback();
            } );
        } );
    } );
  }

  setFgXY( x, y, typeId ) {
    this.bg.setElement( x + y * BOARD_SIZE_X, typeId );
  }

  setBgXY( x, y, typeId ) {
    this.fg.setElement( x + y * BOARD_SIZE_X, typeId );
  }

  updateTitle() {
    var hero = this.hero;
    document.title = "X: " + hero.x + "\u2007 Y: " + hero.y + "\u2007 Z: " + hero.z;
  }

  updateStats() {
    var hero = this.hero;
    this.dom.statPanel.innerHTML = "HP: " + hero.hp + " ATT: " + hero.att + " DEF: " + hero.def + " SPD: " + hero.spd
                           + "<br />XP: " + hero.xp + " LEV: " + hero.level + " $$: " + hero.gold;
  }

  update( quickUpdate, callback ) {
    this.updateTitle();
    this.updateStats();
    this.inv.update();

    if ( !quickUpdate ) {
        this.bg.update();
        this.fg.update();
    }

    callback();
  }

  loadJsonData( dataFilename, callback ) {
      var that = this;
      readFile( DATA_DIR + dataFilename, function( dataStr ) {
          that.jsonData = JSON.parse( dataStr );
          callback();
      } );
  }

  loadMap( mapNr, callback ) {
    var bg = this.bg;
    var fg = this.fg;
    var bgIdMap = this.mapBgCharMap;
    var fgIdMap = this.mapFgCharMap;

    readFile( DATA_DIR + "map" + mapNr + ".txt", function( mapStr ) {
        for ( var i = 0, pos = -1, len = mapStr.length; i < len; i++ ) {
            var c = mapStr.charAt( i );
            if ( c === "\n" || c === "\r" ) {
                continue;
            }
            pos++;

            var typeIdBg = bgIdMap.get( c );
            var typeIdFg = fgIdMap.get( c );

            if ( typeIdBg === undefined ) {
                if ( typeIdFg === undefined ) {
                    console.log( "unknown map char '" + c + "' [0x" + c.charCodeAt( 0 ).toString( 16 ) + "]" );
                }
                typeIdBg = DEFAULT_BACKGROUND_TYPE;
            }

            bg.setContent( pos, typeIdBg );
            fg.setContent( pos, typeIdFg );
        }
        callback();
    } );
  }
}
