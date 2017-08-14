"use strict";

/* jslint node: true */
/* jslint laxbreak: true */

class Game {
  constructor( gameConfig ) {
    this.dom = null;
    
    this.tileset = null;

    this.bg = null;
    this.fg = null;
    this.ovl = null;

    this.inv = null;

    this.stageBgCharMap = null;
    this.stageFgCharMap = null;

    this.audio = new AudioManager();

    this.data = null;
    this.protoMap = new Map();
    this.isIdItem = new Set();
    this.isIdCreature = new Set();

    this.lootTable = [ "xp", "gold" ]; // TEMP

    this.hero = null;
    //this.heroTile = null;

    this.ready = false;
  }

  init( dataConfig, dom, callback ) {
    logInfo( "game.init() started..." );
    
    this.dom = dom;

    var that = this;
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

        var muteState = audio.toggleMute( true, true, false ); // ( fade, bgm, sfx )
        animateOneShot( cb, ( muteState ? "rotateLeft " : "rotateRight " ) + that.data.audioConfig.defaultFadeTime + "s linear" );
    } );

    var d = new Data();
    this.data = d;
    d.init( dataConfig, dom.loadingPanelDataProgressBar, function() {
        var gameConfig = d.gameConfig;
        var x = gameConfig.boardSizeX;
        var y = gameConfig.boardSizeY;

        var widthStr = "width: " + TILE_SIZE_X * x + "px; ";
        //dom.statPanel.style = widthStr;
        dom.inventoryPanel.style = widthStr;
        dom.gamePanel.style = widthStr;
        dom.topPanel.style = widthStr;

        that.tileset = new TileSet( TILE_SIZE_X, TILE_SIZE_Y, gameConfig.tilesetColumns, TILE_CLASS, TILE_TYPE_CLASS_PREFIX );
        var ts = that.tileset;

        that.bg = new Board( ts, x, y, "bg" );
        that.fg = new Board( ts, x, y, "fg" );
        that.ovl = new Board( ts, x, y, "ovl" );

        that.inv = new Inventory( ts, gameConfig.inventorySize );

        that.inv.init( gameConfig.inventorySize /* * 2 */, dom.inventoryPanel );

        that.bg.init( dom.boardBackground );
        that.fg.init( dom.boardForeground );
        that.ovl.init( dom.boardOverlay );

        var prot = d.creatureProto;
        var proto;
        for( var protoName in prot ) {
            proto = prot[protoName];
            proto.protoName = protoName;
            proto.isCreature = true;
            var id = proto.typeId;
            that.protoMap.set( id, proto );
            that.isIdCreature.add( id );
        }

        prot = d.itemProto;
        for( var protoName in prot ) {
            proto = prot[protoName];
            proto.protoName = protoName;
            proto.isItem = true;
            var id = proto.typeId;
            that.protoMap.set( id, proto );
            that.isIdItem.add( id );
        }

        var cm = d.charMap;
        that.stageBgCharMap = new Map( cm.stageBgCharRaw );
        that.stageFgCharMap = new Map( cm.stageFgCharRaw );
        that.stageNameMap = new Map( d.stageNameMap.raw );

        that.audio.init( d.audioConfig, dom.loadingPanelAudioProgressBar, function() {
            var lpws = dom.loadingPanelWrapper.style;
            lpws.opacity = 0.0;

/* move this to external function */
            that.hero = new Critter( d.creatureProto.hero, 0, 0, 0 );
            var h = that.hero;
            that.loadMap( that.stageNameMap.get( h.z ), function() {
              that.fg.setEntityXY( h.x, h.y, that.entityFromTypeId( h.typeId ) );
              that.update( false );
            } );
/* */
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
    /*
    if ( !game.ready ) {
        logError( "game already !ready" );
    }
    */
    game.ready = false;
  }

  waitForAnimationEnd( domElem ) {
    this.setNotReady();
    domElem.addEventListener( "animationend", this.setReady );
  }

  removeTransition( x, y ) {
    var fg = this.fg;
    var that = this;

    this.setNotReady();
    var domElem = fg.getTileXY( x, y );
    domElem.style.opacity = 0.0;
    domElem.addEventListener( "transitionend", function() {
        fg.setEntityXY( x, y, undefined );
        domElem.style.opacity = null;
        that.setReady();
    } );
  }

  heroActionAt( x, y ) {
    var h = this.hero;
    //var fg = this.fg;
    var ent = this.fg.getEntityXY( x, y );
    var typeId = ( ent === undefined ) ? undefined : ent.typeId;
    //var that = this;

    if ( isAdjacent( x, y, h.x, h.y ) ) {
        // logInfo( "actor event @ [" + x + "," + y + "]" );
        // TODO properly handle actor events
        if ( this.isIdItem.has( typeId ) ) {
            var invCell = 0; // TEMP
            this.inv.setEntity( invCell, this.entityFromTypeId( typeId ) );
            this.removeTransition( x, y );
            this.audio.playSfx( "blub.mp3" );
            return;
        } else if ( this.isIdCreature.has( typeId ) ) {
            this.doAttack( h.x, h.y, x, y, h, ent );
            if ( h.hp <= 0 ) {
                this.gameOver();
            }
            if ( ent.hp <= 0 ) {
                this.doLoot( h, ent );
                this.removeTransition( x, y );
                this.audio.playSfx( "skel_death.mp3" );
            }
            this.updateStats();
        } else {
          switch ( typeId ) {
            case 7:
                this.audio.playSfx( "punch.mp3" );
                break;
            case undefined:
                return this.moveHeroTo( x, y, true );
          }
        }
    } else if ( typeId === undefined ) {
        return this.moveHeroTo( x, y );
    } else {
        // occupied && !adjacent => do nothing
    }
  }

  doLoot( victEntity, deadEntity ) {
    for( var loot of this.lootTable ) {
        victEntity[loot] += deadEntity[loot];
    }
    // TEMP
  }

  doAttack( attX, attY, defX, defY, attEntity, defEntity ) {
    if ( attEntity === undefined ) {
        attEntity = fg.getEntityXY( attX, attY );
    }
    if ( defEntity === undefined ) {
        defEntity = fg.getEntityXY( defX, defY );
    }

    var fg = this.fg;
    var ovl = this.ovl;

    var ht = fg.getTileXY( attX, attY );
    var ot = fg.getTileXY( defX, defY );

    var dir, animBase;

    dir = descriptionFromDirection( defX, defY, attX, attY, true );
    animBase = dir + this.data.gameConfig.attackAnimStr;
    animateOneShot( ht, "attack" + animBase );
    animateOneShot( ot, "defend" + animBase );
    this.waitForAnimationEnd( ht ); // FIXME removeTransition
    // FIXME can move into non-empty cell on death, hero disappears after moving into a previously occupied cell
    this.audio.playSfx( "skel_slash_n_growl.mp3" );

    //this.audio.fadeOutBgm();

    var dam;
    dam = attEntity.att - defEntity.def;
    if ( dam > 0 ) {
        defEntity.hp -= dam;
    }
    dam = defEntity.att - attEntity.def;
    if ( dam > 0 ) {
        attEntity.hp -= dam;
    }
  }

  moveHeroTo( x, y, adjacent ) {
    var h = this.hero;
    var fg = this.fg;

    if ( adjacent ) {
        fg.setEntityXY( h.x, h.y, undefined );
        fg.setEntityXY( x, y, h );
        h.x = x;
        h.y = y;

        this.audio.playSfx( "footsteps.mp3" );
        return true;
    }
    
    var path = findManhattanPathXY( fg.entity, fg.sizeX, fg.sizeY, h.x, h.y, x, y );
    if ( path === null ) {
        return false;
    }
    //logInfo( path );

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
    this.fg.setEntityXY( h.x, h.y, undefined );
    this.fg.setEntityXY( x, y, h );
    h.x = x;
    h.y = y;

    this.audio.playSfx( "footsteps.mp3" );
    return true;
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

    readXhr( "data/maps/map" + padZero( mapNr, 2 ) + ".txt", true, function( mapStr ) {
        for ( let i = 0, x = -1, y = 0, pos = -1, len = mapStr.length; i < len; i++ ) {
            var c = mapStr.charAt( i );
            if ( c === "\n" || c === "\r" ) {
                continue;
            }
            pos++;
            x++;

            var typeIdBg = bgIdMap.get( c );
            var typeIdFg = fgIdMap.get( c );

            if ( typeIdBg === undefined ) {
                if ( typeIdFg === undefined ) {
                    logError( "unknown map char '" + c + "' [0x" + c.charCodeAt( 0 ).toString( 16 ) + "]" );
                }
                typeIdBg = that.data.gameConfig.defaultBackgroundType;
            }

            bg.setEntity( pos, that.entityFromTypeId( typeIdBg ) );
            fg.setEntity( pos, that.entityFromTypeId( typeIdFg ) );

            if ( x === fg.sizeX ) {
                x = 0;
                y++;
            }

            fg.tiles[pos].addEventListener( "mousedown" /* "click" */, function( evt ) {
                //logInfo( "pos: " + pos + " X: " + x + " Y: " + y );
                if ( evt.button !== 0 ) {
                    return;
                }
                if ( !that.ready ) {
                    return;
                }
                that.heroActionAt( x, y );
            } );
        }

        that.audio.playBgm( "bgm0" + mapNr + ".mp3" );
        if ( callback !== undefined ) {
            callback();
        }
    } );
  }

  entityFromTypeId( typeId ) {
    if ( typeId === undefined ) {
        return undefined;
    }
    var proto = this.protoMap.get( typeId );
    return ( proto !== undefined ) ? Object.assign( {}, proto ) : { "typeId" : typeId };
  }

  gameOver() {
    this.audio.playSfx( "scream.mp3" );
    alert( "debug: GAME OVER" ); // TEMP
  }
}
