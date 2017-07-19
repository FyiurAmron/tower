"use strict";

/* jslint node: true */
/* jslint laxbreak: true */

class Game {
  constructor( dom ) {
    this.dom = dom;

    this.tileset = new TileSet( TILE_SIZE_X, TILE_SIZE_Y, TILESET_COLUMNS, TILE_CLASS, TILE_TYPE_CLASS_PREFIX );

    this.bg = new Board( this.tileset, BOARD_SIZE_X, BOARD_SIZE_Y, "bg" );
    this.fg = new Board( this.tileset, BOARD_SIZE_X, BOARD_SIZE_Y, "fg" );
    this.ovl = new Board( this.tileset, BOARD_SIZE_X, BOARD_SIZE_Y, "ovl" );

    this.inv = new Inventory( this.tileset, INVENTORY_SIZE );

    this.stageBgCharMap = null;
    this.stageFgCharMap = null;

    this.audio = new AudioManager( AUDIO_FILES );

    this.data = null;
    this.protoMap = new Map();
    this.isInventory = new Set();
    this.isCreature = new Set();

    this.hero = null;
    this.heroTile = null;

    this.ready = false;
  }

  init( callback ) {
    console.log( "game.init();" );

    var that = this;
    var dom = this.dom;
    var audio = this.audio;

    audio.setMaxGains( 0.2, 1.0 );

    var cb = dom.configButton;
    cb.addEventListener( "mousedown", function( evt ) {
        if ( evt.button !== 0 ) {
            return;
        }
        if ( cb.style.animation !== "" ) {
            return;
        }

        var muteState = audio.toggleMute( true );
        animateOneShot( cb, ( muteState ? "rotateLeft " : "rotateRight " ) + DEFAULT_FADE_TIME + "s linear" );
    } );

    this.inv.init( dom.inventoryPanel );

    this.bg.init( dom.boardBackground );
    this.fg.init( dom.boardForeground );
    this.ovl.init( dom.boardOverlay );

    var widthStr = "width: " + TILE_SIZE_X * BOARD_SIZE_X + "px; ";
    //dom.statPanel.style = widthStr;
    dom.inventoryPanel.style = widthStr;
    dom.gamePanel.style = widthStr;
    dom.topPanel.style = widthStr;

    var d = new Data( DATA_FILES );
    this.data = d;
    d.init( dom.loadingPanelDataProgressBar, function() {
        var prot = d.creatureProto;
        for( var protoName in prot ) {
            var id = prot[protoName].typeId;
            that.protoMap.set( id, protoName );
            that.isCreature.add( id );
        }
        that.hero = new Hero( prot.hero );
        var h = that.hero;

        prot = d.itemProto;
        for( var protoName in prot ) {
            var id = prot[protoName].typeId;
            that.protoMap.set( id, protoName );
            that.isInventory.add( id );
        }

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
                fg.tiles[i].addEventListener( "mousedown" /* "click" */, function( evt ) {
                    //console.log( "i: " + i + " X: " + x + " Y: " + y );
                    if ( evt.button !== 0 ) {
                        return;
                    }
                    if ( !that.ready ) {
                        return;
                    }
                    that.heroActionAt( x, y );
                } );
            }
            that.update( false );
            var lpws = dom.loadingPanelWrapper.style;
            lpws.opacity = 0.0;
        };
        that.audio.init( dom.loadingPanelAudioProgressBar, function() {
            that.loadMap( that.stageNameMap.get( h.z ), andThen );
        } );
    } );
  }

  setReady() {
    if ( game.ready ) {
        logError( "game already ready" );
    }
    game.ready = true;
  }

  setNotReady() {
    if ( !game.ready ) {
        logError( "game already !ready" );
    }
    game.ready = false;
  }

  waitForAnimationEnd( domElem ) {
    this.setNotReady();
    domElem.addEventListener( "animationend", this.setReady );
  }

  heroActionAt( x, y ) {
    var h = this.hero;
    var fg = this.fg;
    var con = fg.getContentXY( x, y );
    var that = this;

    if ( isAdjacent( x, y, h.x, h.y ) ) {
        // console.log( "actor event @ [" + x + "," + y + "]" );
        // TODO properly handle actor events
        if ( this.isInventory.has( con ) ) {
            this.setNotReady();
            var domElem = fg.getTileXY( x, y );
            domElem.style.opacity = 0;
            game.inv.setContent( 0, con );
            domElem.addEventListener( "transitionend", function() {
                fg.setContentXY( x, y, undefined );
                that.setReady();
            } );
            return;
        }
        switch ( con ) {
            case 76:
                var ovl = this.ovl;
                var ht = fg.getTileXY( h.x, h.y );
                var ot = fg.getTileXY( x, y );

                var dir = descriptionFromDirection( x, y, h.x, h.y, true );
                var animBase = dir + "Anim 0.2s cubic-bezier( 0.0, 0.0, 0.0, 1.0 ) 2 alternate";

                animateOneShot( ht, "slide" + animBase );
                animateOneShot( ot, "halfSlide" + animBase );
                this.waitForAnimationEnd( ht );

                //this.audio.fadeOutBgm();
                var t = this.data.creatureProto[this.protoMap.get( con )];
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
                return this.moveHeroTo( x, y );
        }
    } else if ( con === undefined ) {
        return this.moveHeroTo( x, y );
    } else {
        // occupied && !adjacent => do nothing
    }
  }

  moveHeroTo( x, y, adjacent ) {
    var h = this.hero;
    var fg = this.fg;

    if ( adjacent ) {
        fg.setContentXY( h.x, h.y, undefined );
        fg.setContentXY( x, y, h.typeId );
        h.x = x;
        h.y = y;
        return;
    }
    
    var fg = this.fg;
    var path = findManhattanPathXY( fg.content, fg.sizeX, fg.sizeY, h.x, h.y, x, y );
    //console.log( path );

    // TEMP shows the path visually
    var tiles = this.bg.tiles;
    for( var tile of tiles ) {
        tile.style.transform = "";
    }
    if ( path !== null ) {
        for( var tileIdx of path ) {
            tiles[tileIdx].style.transform = "scale( 0.7 )";
        }
    }

    // TODO proper path steering instead
    this.fg.setContentXY( h.x, h.y, undefined );
    this.fg.setContentXY( x, y, h.typeId );
    h.x = x;
    h.y = y;
  }

  updateTitle() { // synchronous
    var hero = this.hero;
    document.title = "X: " + hero.x + "\u2007 Y: " + hero.y + "\u2007 Z: " + hero.z;
  }

  updateStats() { // synchronous
    var hero = this.hero;
    this.dom.statPanel.innerHTML = "HP: " + hero.hp + " ATT: " + hero.att + " DEF: " + hero.def + " SPD: " + hero.spd
                           + "<br />XP: " + hero.xp + " LEV: " + hero.level + " $$: " + hero.gold;
  }

  update( quickUpdate ) {
    this.setNotReady();

    this.updateTitle();
    this.updateStats();
    this.inv.update();

    if ( !quickUpdate ) {
        this.bg.update();
        this.fg.update();
    }
    this.setReady();
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
