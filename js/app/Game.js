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

    this.waitId = 0;
    this.waitForSet = new Set();
  }

  waitFor() {
    var wid = this.waitId;
    this.waitForSet.add( wid );
    this.waitId++;
    logDebug( "waitFor( " + wid + " );" );
    return wid;
  }

  waitCompleted( wid ) {
    this.waitForSet.delete( wid );
    logDebug( "waitCompleted( " + wid + " );" );
  }

  isWaiting() {
    return this.waitForSet.size !== 0;
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
            that.initHero( new Vec3( 0, 0, 0 ) ); // TEMP implement this as new game behaviour
        } );
    } );
  }

  initHero( pos ) {
    this.hero = new Creature( this.data.creatureProto.hero, pos );
    var hpos = this.hero.pos;
    var that = this;
    this.loadMap( this.stageNameMap.get( hpos.z ), function() {
        that.fg.setEntityXY( hpos.x, hpos.y, that.entityFromTypeId( that.hero.typeId ) );
        that.update( false );
    } );
  }

  waitForEvent( domElem, eventName, callback ) {
    var wid = this.waitFor();
    var that = this;
    var eventListener = function( evt ) { 
        if ( callback !== undefined ) {
            callback( evt );
        }
        domElem.removeEventListener( eventName, eventListener );
        that.waitCompleted( wid );
    };
    domElem.addEventListener( eventName, eventListener );
  }

  waitForAnimationEnd( domElem ) {
    this.waitForEvent( domElem, "animationend" );
  }

  removeWithTransition( x, y ) {
    var fg = this.fg;
    var that = this;
    var domElem = fg.getTileXY( x, y );
    domElem.style.opacity = 0.0;

    this.waitForEvent( domElem, "transitionend", function() {
        fg.setEntityXY( x, y, undefined );
        domElem.style.opacity = null;
    } );
  }

  heroActionAt( x, y ) {
    var h = this.hero;
    var hpos = h.pos;
    //var fg = this.fg;
    var ent = this.fg.getEntityXY( x, y );
    var typeId = ( ent === undefined ) ? undefined : ent.typeId;
    //var that = this;

    if ( isAdjacent( x, y, hpos.x, hpos.y ) ) {
        logDebug( "actor event @ [" + x + "," + y + "]" );
        // TODO properly handle actor events
        if ( this.isIdItem.has( typeId ) ) {
            var invCell = 0; // TEMP
            this.inv.setEntity( invCell, this.entityFromTypeId( typeId ) );
            this.removeWithTransition( x, y );
            this.audio.playSfx( "blub.mp3" );
            return;
        } else if ( this.isIdCreature.has( typeId ) ) {
            this.doAttack( hpos.x, hpos.y, x, y, h, ent );
            if ( h.hp <= 0 ) {
                this.gameOver();
            }
            if ( ent.hp <= 0 ) {
                this.doLoot( h, ent );
                this.removeWithTransition( x, y );
                this.audio.playSfx( "skel_death.mp3" );
            }
            this.updateStats();
        } else {
          switch ( typeId ) {
            case 0:
                this.audio.playSfx( "hmm.mp3" ); // TEMP
                break;
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
    this.waitForAnimationEnd( ht ); // FIXME removeWithTransition
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
    var hpos = h.pos;
    var fg = this.fg;

    if ( adjacent ) {
        this.removeWithTransition( hpos.x, hpos.y );
        fg.setEntityXY( x, y, h );
        hpos.x = x;
        hpos.y = y;

        this.audio.playSfx( "footsteps.mp3" );
        return true;
    }
    
    var path = findManhattanPathXY( fg.entity, fg.sizeX, fg.sizeY, hpos.x, hpos.y, x, y );
    if ( path === null ) {
        return false;
    }
    // logDebug( path );

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
    this.removeWithTransition( hpos.x, hpos.y );
    this.fg.setEntityXY( x, y, h );
    hpos.x = x;
    hpos.y = y;

    this.audio.playSfx( "footsteps.mp3" );
    return true;
  }

  updateTitle() { // synchronous
    var hpos = this.hero.pos;
    document.title = "X: " + hpos.x + "\u2007 Y: " + hpos.y + "\u2007 Z: " + hpos.z; // TEMP
  }

  updateStats() { // synchronous
    var h = this.hero;
    this.dom.statPanel.innerHTML = "HP: " + h.hp + " ATT: " + h.att   + " DEF: " + h.def + " SPD: " + h.spd
                           + "<br />XP: " + h.xp + " LEV: " + h.level + " $$$: " + h.gold;
  }

  // note: all the calls here are/should be synchronous, yet we block events anyway just in case
  update( quickUpdate ) {
    var wid = this.waitFor();

    this.updateTitle();
    this.updateStats();
    this.inv.update();

    if ( !quickUpdate ) {
        this.bg.update();
        this.fg.update();
    }
    
    this.waitCompleted( wid );
  }

  loadMap( mapNr, callback ) {
    var bg = this.bg;
    var fg = this.fg;
    var bgIdMap = this.stageBgCharMap;
    var fgIdMap = this.stageFgCharMap;
    var that = this;
    var defaultBackgroundType = this.data.gameConfig.defaultBackgroundType;
    var audio = this.audio;

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
                typeIdBg = defaultBackgroundType;
            }

            bg.setEntity( pos, that.entityFromTypeId( typeIdBg ) );
            fg.setEntity( pos, that.entityFromTypeId( typeIdFg ) );

            if ( x === fg.sizeX ) {
                x = 0;
                y++;
            }

            fg.tiles[pos].addEventListener( "mousedown" /* "click" */, function( evt ) {
                logDebug( "mousedown: " + pos + " X: " + x + " Y: " + y );
                if ( evt.button !== 0 ) {
                    return;
                }
                if ( that.isWaiting() ) {
                    logDebug( "NOT READY YET" );
                    return;
                }
                that.heroActionAt( x, y );
            } );
        }

        audio.playBgm( "bgm0" + mapNr + ".mp3" );
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
    logInfo( "GAME OVER" );
    alert( "debug: GAME OVER" ); // TEMP
  }
}
