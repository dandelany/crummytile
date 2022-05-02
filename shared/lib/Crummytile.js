"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crummytile = exports.GAME_MODE = exports.TILE_COLOR = void 0;
const range_1 = __importDefault(require("lodash/range"));
const random_1 = __importDefault(require("lodash/random"));
const shuffle_1 = __importDefault(require("lodash/shuffle"));
const times_1 = __importDefault(require("lodash/times"));
const findIndex_1 = __importDefault(require("lodash/findIndex"));
const utils_1 = require("./utils");
var TILE_COLOR;
(function (TILE_COLOR) {
    TILE_COLOR["RED"] = "RED";
    TILE_COLOR["BLACK"] = "BLK";
    TILE_COLOR["BLUE"] = "BLU";
    TILE_COLOR["YELLOW"] = "YLW";
})(TILE_COLOR = exports.TILE_COLOR || (exports.TILE_COLOR = {}));
;
const TILE_COPIES = { A: 'A', B: 'B' };
var GAME_MODE;
(function (GAME_MODE) {
    GAME_MODE["SETUP"] = "SETUP";
    GAME_MODE["PLAYING"] = "PLAYING";
})(GAME_MODE = exports.GAME_MODE || (exports.GAME_MODE = {}));
class Crummytile {
    constructor(options = {}) {
        console.log("Welcome to Crummytile!");
        this.options = options;
        const id = (options.id === undefined) ? (0, utils_1.cheapId)() : options.id;
        const playerCount = options.playerCount || 1;
        this.state = {
            id,
            playerCount,
            mode: GAME_MODE.SETUP,
            bag: [],
            hands: (0, times_1.default)(playerCount, () => ([])),
            gridTiles: []
        };
        this.initBag();
    }
    initBag() {
        console.log('Initializing bag...');
        const bag = [];
        Object.values(TILE_COPIES).forEach(tileCopy => {
            Object.values(TILE_COLOR).forEach(color => {
                (0, range_1.default)(1, 14).forEach((value) => {
                    bag.push(makeTile(color, value, tileCopy));
                });
            });
        });
        // jokers
        bag.push(makeTile(TILE_COLOR.BLACK, 999, 'A'));
        bag.push(makeTile(TILE_COLOR.RED, 999, 'B'));
        // shuffle the tiles in random order
        const shuffledBag = (0, shuffle_1.default)(bag);
        console.log('shuffled', shuffledBag);
        this.state.bag = shuffledBag;
    }
    drawTiles(playerIndex, count) {
        const { bag, hands } = this.state;
        if (count > bag.length) {
            throw Error("not enough tiles in bag");
        }
        (0, times_1.default)(count, () => {
            const tile = this.state.bag.pop(); // mutates bag
            if (tile === undefined)
                return;
            const handTile = Object.assign({}, tile);
            if (playerIndex >= hands.length) {
                throw Error(`invalid player index ${playerIndex}`);
            }
            this.state.hands[playerIndex].push(handTile);
        });
        console.log(`player ${playerIndex} drew ${count} tiles`, hands);
        return this.state;
    }
    playTile(playerIndex, tileId) {
        const { hands, gridTiles } = this.state;
        if (playerIndex >= hands.length) {
            throw Error(`invalid player index ${playerIndex}`);
        }
        const hand = hands[playerIndex];
        const handTileIndex = (0, findIndex_1.default)(hand, (tile) => tile.id === tileId);
        if (handTileIndex < 0)
            throw Error(`couldn't find tile ${tileId} in hand`);
        const handTile = hand[handTileIndex];
        const gridTile = Object.assign(Object.assign({}, handTile), { position: {
                x: (0, random_1.default)(300, 500),
                y: (0, random_1.default)(300, 400)
            } });
        // remove tile from hand
        hand.splice(handTileIndex, 1);
        // add it to the grid
        gridTiles.push(gridTile);
        return this.state;
    }
    getState() {
        return this.state;
    }
}
exports.Crummytile = Crummytile;
function makeTile(color, value, tileCopy) {
    return {
        id: `${color}-${value}-${tileCopy}`,
        type: "tileNode",
        data: { value, color }
    };
}
