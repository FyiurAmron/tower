"use strict";

/* jslint node: true */
/* jslint laxbreak: true */

class Game {
  constructor( dom ) {
    this.dom = dom;

    this.hero = null;
    this.heroTile = null;
    this.tileset = new TileSet( TILE_SIZE_X, TILE_SIZE_Y, TILESET_COLUMNS, TILE_CLASS, TILE_TYPE_CLASS_PREFIX );
    this.bg = new Board( this.tileset, BOARD_SIZE_X, BOARD_SIZE_Y, "bg" );
    this.fg = new Board( this.tileset, BOARD_SIZE_X, BOARD_SIZE_Y, "fg" );
    this.inv = new Inventory( this.tileset, INVENTORY_SIZE );
    this.stageBgCharMap = null;
    this.stageFgCharMap = null;
    this.data = null;
    this.protoMap = new Map();
    this.ready = false;
    this.audio = new AudioManager( AUDIO_FILES );
  }

  init( callback ) {
    console.log( "game.init();" );

    var dom = this.dom;
    var that = this;
    var audio = this.audio;

    audio.setMaxGains( 0.2, 1.0 );

    var cb = dom.configButton;
    cb.addEventListener( "mousedown" /* "click" */, function() {
        if ( evt.button !== 0 ) {
            return;
        }
        if ( cb.style.animation !== "" ) {
            return;
        }

        var muteState = audio.toggleMute( true );
        cb.style.animation = ( muteState ? "rotateLeft " : "rotateRight " ) + DEFAULT_FADE_TIME + "s linear";
        cb.addEventListener("animationend", function() {
            cb.style.animation = "";
        } );
    } );

    this.inv.init( dom.inventoryPanel );
    this.bg.init( dom.boardBackground );
    this.fg.init( dom.boardForeground );

    var widthStr = "width: " + TILE_SIZE_X * BOARD_SIZE_X + "px; ";
    dom.statPanel.style = widthStr;
    dom.inventoryPanel.style = widthStr;
    dom.gamePanel.style = widthStr;
    //dom.boardBackground.style = widthStr;
    //dom.board.style = widthStr;

    var d = new Data( DATA_FILES );
    this.data = d;
    d.init( dom.loadingPanelDataProgressBar, function() {
        var dp = d.proto;
        for( var protoName in dp ) {
            that.protoMap.set( dp[protoName].typeId, protoName );
        }
        that.hero = new Hero( d.proto.hero );
        var h = that.hero;

        var cm = d.charMap;
        that.stageBgCharMap = new Map( cm.stageBgCharRaw );
        that.stageFgCharMap = new Map( cm.stageFgCharRaw );
        that.stageNameMap = new Map( d.stageNameMap.raw );
        var andThen = function() {
            that.fg.setContentXY( h.x, h.y, h.typeId );
            var fg = that.fg;
            for( let i = 0, x = 0, y = 0, max = fg.size; i < max; i++, x++ ) {
                if ( x === fg.sizeX ) {
                    x = 0;
                    y++;
                }
                fg.tiles[i].addEventListener( "mousedown" /* "click" */, function(evt) {
                    //alert( "i: " + i + " X: " + x + " Y: " + y );
                    if ( evt.button !== 0 ) {
                        return;
                    }
                    that.tryToMoveHeroTo( x, y );
                } );
            }
            that.update( false );
            var lpws = dom.loadingPanelWrapper.style;
            lpws.opacity = 0.0;
            // lpws.zIndex = -1000;
        };
        that.audio.init( dom.loadingPanelAudioProgressBar, function() {
            that.loadMap( that.stageNameMap.get( h.z ), andThen );
        } );
    } );
  }

  tryToMoveHeroTo( x, y ) {
    var h = this.hero;
    var con = this.fg.getContentXY( x, y );
    if ( isAdjacent( x, y, h.x, h.y ) ) {
        // alert( "actor event @ [" + x + "," + y + "]" ); // TODO handle actor events
        // TODO properly handle actor events
        switch ( con ) {
            case 76:
                //this.audio.fadeOutBgm();
                var t = this.data.proto[this.protoMap.get( con )];
                var dam;
                dam = h.att - t.def;
                if ( dam > 0 ) {
                    t.hp -= dam;
                }
                dam = t.att - h.def;
                if ( dam > 0 ) {
                    h.hp -= dam;
                }
                this.updateStats();
                break;
            case 7:
                this.audio.playSfx( "punch.mp3" );
                break;
            case undefined:
                this.fg.setContentXY( h.x, h.y, undefined );
                this.fg.setContentXY( x, y, h.typeId );
                h.x = x;
                h.y = y;
                break;
        }
    } else if ( con === undefined ) {
        var fg = this.fg;
        var path = findManhattanPathXY( fg.content, fg.sizeX, fg.sizeY, h.x, h.y, x, y );
        //console.log( path );

        // TEMP show path visually
        var tiles = this.bg.tiles;
        for( var tile of tiles ) {
            tile.style.transform = "scale( 1.0 )";
        }
        if ( path !== null ) {
            for( var tileIdx of path ) {
                tiles[tileIdx].style.transform = "scale( 0.7 )";
            }
        }

        // TODO proper path steering
/*
        this.fg.setContentXY( h.x, h.y, undefined );
        this.fg.setContentXY( x, y, h.typeId );
        h.x = x;
        h.y = y;
*/
    }
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

  update( quickUpdate ) {
    this.updateTitle();
    this.updateStats();
    this.inv.update();

    if ( !quickUpdate ) {
        this.bg.update();
        this.fg.update();
    }
    this.ready = true;
  }

  loadMap( mapNr, callback ) {
    var bg = this.bg;
    var fg = this.fg;
    var bgIdMap = this.stageBgCharMap;
    var fgIdMap = this.stageFgCharMap;
    var that = this;

    readXhr( DATA_PATH + "map" + mapNr + ".txt", true, function( mapStr ) {
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
        that.audio.playBgm( "bgm0" + mapNr + ".mp3" );
        callback();
    } );
  }
}
