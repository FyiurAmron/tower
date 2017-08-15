"use strict";

/* jslint node: true */

//
// top-level constants
//

const APP_SCRIPT_PATH = "js/app/";
const IMPORT_SCRIPTS = [
  "const.js", "util.js", "Data.js", "AudioManager.js", "Vec3.js",
  "Tileset.js", "Inventory.js", "Board.js", "Creature.js",
  "Game.js"
];

const HEAD_TAG = "head";
const SCRIPT_TAG = "script";
const SCRIPT_TYPE = "text/javascript";

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
    configButton: "config-button",
    topPanel: "top-panel",
    mainPanel: "main-panel",
    gamePanel: "game-panel",
    statPanel: "stat-panel",
    inventoryPanel: "inventory-panel",
    boardBackground: "board-background",
    boardForeground: "board-foreground",
    boardOverlay: "board-overlay",
};

const LOADING_PANEL_PROGRESS_BAR_CLASS = "loading-panel-progress-bar";

const QUERY_STR = {
    loadingPanelScriptsProgressBar: "#" + ID.loadingPanel + "-scripts > ." + LOADING_PANEL_PROGRESS_BAR_CLASS,
    loadingPanelDataProgressBar:    "#" + ID.loadingPanel + "-data    > ." + LOADING_PANEL_PROGRESS_BAR_CLASS,
    loadingPanelAudioProgressBar:   "#" + ID.loadingPanel + "-audio   > ." + LOADING_PANEL_PROGRESS_BAR_CLASS,
};