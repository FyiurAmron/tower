"use strict";

/* jslint node: true */
/* jslint laxbreak: true */

class Game {
  constructor() {
    this.hero = null;
    this.heroTile = null;
    this.tileset = new TileSet( TILE_SIZE_X, TILE_SIZE_Y, TILESET_COLUMNS, TILE_CLASS, TILE_TYPE_CLASS_PREFIX );
    this.bg = new Board( this.tileset, BOARD_SIZE_X, BOARD_SIZE_Y, "bg" );
    this.fg = new Board( this.tileset, BOARD_SIZE_X, BOARD_SIZE_Y, "fg" );
    this.inv = new Inventory( this.tileset, INVENTORY_SIZE );
    this.dom = {};
    this.stageBgCharMap = null;
    this.stageFgCharMap = null;
    this.data = new Data();
    this.ready = false;
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
    var d = this.data;
    d.init( function() {
        that.hero = new Hero( d.proto.hero );
        var h = that.hero;

        var cm = d.charMap;
        that.stageBgCharMap = new Map( cm.stageBgCharRaw );
        that.stageFgCharMap = new Map( cm.stageFgCharRaw );
        that.stageNameMap = new Map( d.stageNameMap.raw );
        that.loadMap( that.stageNameMap.get( h.z ), function() {
            that.setFgXY( h.x, h.y, h.typeId );
            var fg = that.fg;
            for( let i = 0, x = 0, y = 0, max = fg.size; i < max; i++, x++ ) {
                if ( x === fg.x ) {
                    x = 0;
                    y++;
                }
                fg.tiles[i].addEventListener( "click", function() {
                    //alert( "i: " + i + " X: " + x + " Y: " + y );
                    if ( fg.content[i] === undefined ) {
                          that.setFgXY( h.x, h.y, undefined );
                          that.setFgXY( x, y, h.typeId );
                          h.x = x;
                          h.y = y;
                    }
                } );
            }
            that.update( false, function() {
                callback();
            } );
        } );
    } );
  }

  setBgXY( x, y, typeId ) {
    this.bg.setContent( x + y * BOARD_SIZE_X, typeId );
  }

  setFgXY( x, y, typeId ) {
    this.fg.setContent( x + y * BOARD_SIZE_X, typeId );
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
    this.ready = true;
  }

  loadMap( mapNr, callback ) {
    var bg = this.bg;
    var fg = this.fg;
    var bgIdMap = this.stageBgCharMap;
    var fgIdMap = this.stageFgCharMap;

    readFile( DATA_PATH + "map" + mapNr + ".txt", true, function( mapStr ) {
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
