"use strict";

/* jslint node: true */

//
// constants
//

const APP_SCRIPT_PATH = "js/app/";
const IMPORT_SCRIPTS = [
  /* "const.js", "util.js", */ "Data.js", "AudioManager.js",
  "Tileset.js", "Inventory.js", "Board.js", "Hero.js",
  "Game.js"
];

const HEAD_TAG = "head";
const SCRIPT_TAG = "script";
const SCRIPT_TYPE = "text/javascript";

//

const TILE_SIZE_X = 32;
const TILE_SIZE_Y = 32;
const TILESET_COLUMNS = 11;

const DEFAULT_BACKGROUND_TYPE = 5;

const BOARD_SIZE_X = 16;
const BOARD_SIZE_Y = 22;
const BOARD_SIZE_TOTAL = BOARD_SIZE_X * BOARD_SIZE_Y;

const INVENTORY_SIZE = BOARD_SIZE_X;

// DOM-related

const DIV_TAG = "div";

const TILE_CLASS = "tile";
/* const TYPE_SUFFIX = "-type-"; */
const BOARD_ROW_CLASS = "board-row";
const INVENTORY_TILE_CLASS = "inventory-tile";
const INVENTORY_ROW_CLASS = "inventory-row";
const INVENTORY_ROW_PREFIX = INVENTORY_ROW_CLASS + "-";
const TILE_TYPE_CLASS_PREFIX = TILE_CLASS + "-type-";

const ID = {
    loadingPanel: "loading-panel",
    loadingPanelWrapper: "loading-panel-wrapper",
    mainPanel: "main-panel",
    gamePanel: "game-panel",
    statPanel: "stat-panel",
    inventoryPanel: "inventory-panel",
    boardBackground: "board-background",
    boardForeground: "board-foreground",
};

const LOADING_PANEL_PROGRESS_BAR_CLASS = "loading-panel-progress-bar";

const QUERY_STR = {
    loadingPanelScriptsProgressBar: "#" + ID.loadingPanel + "-scripts > ." + LOADING_PANEL_PROGRESS_BAR_CLASS,
    loadingPanelDataProgressBar:    "#" + ID.loadingPanel + "-data    > ." + LOADING_PANEL_PROGRESS_BAR_CLASS,
    loadingPanelAudioProgressBar:   "#" + ID.loadingPanel + "-audio   > ." + LOADING_PANEL_PROGRESS_BAR_CLASS,
}