"use strict";

/* jslint node: true */

//
// constants
//

const DATA_DIR = "data/";

const TILE_SIZE_X = 32;
const TILE_SIZE_Y = 32;
const TILESET_WIDTH = 11;

const DEFAULT_BACKGROUND_TYPE = 5;

const BOARD_SIZE_X = 16;
const BOARD_SIZE_Y = 24;
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

const id = {
    boardBackground: "boardBackground",
    boardForeground: "boardForeground",
    statPanel: "statPanel",
    inventoryPanel: "inventoryPanel",
    gamePanel: "gamePanel",
};
