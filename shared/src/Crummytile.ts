import range from "lodash/range";
import random from "lodash/random";
import shuffle from 'lodash/shuffle';
import times from 'lodash/times';
import findIndex from 'lodash/findIndex';
import { cheapId } from "./utils";

export enum TILE_COLOR {
  RED = 'RED',
  BLACK = 'BLK',
  BLUE = 'BLU',
  YELLOW = 'YLW'
};
const TILE_COPIES = { A: 'A', B: 'B' }

export enum GAME_MODE {
  SETUP = 'SETUP',
  PLAYING = 'PLAYING'
}


export interface GameTileData {
  value: number;
  color: TILE_COLOR;
}
interface GameTile {
  type: "tileNode",
  id: string,
  data: GameTileData
}
interface GameGridTile extends GameTile {
  position: {
    x: number,
    y: number
  }
}
type TileBag = GameTile[];


export interface GameState {
  id: string;
  mode: GAME_MODE;
  bag: TileBag;
  hands: GameTile[][];
  gridTiles: GameGridTile[];
  playerCount: number;
}
export interface GameOptions {
  playerCount?: number;
  id?: string;
}
export class Crummytile {
  options: GameOptions;
  state: GameState;
  constructor(options: GameOptions = {}) { 
    console.log("Welcome to Crummytile!");
    this.options = options;
    const id = (options.id === undefined) ? cheapId() : options.id;
    const playerCount = options.playerCount || 1;
    this.state = {
      id,
      playerCount,
      mode: GAME_MODE.SETUP,
      bag: [],
      hands: times(playerCount, () => ([])),
      gridTiles: []
    }
    this.initBag();
  }

  private initBag () {
    console.log('Initializing bag...');
    const bag: TileBag = [];

    Object.values(TILE_COPIES).forEach(tileCopy => {
      Object.values(TILE_COLOR).forEach(color => {
        range(1, 14).forEach((value: number) => {
          bag.push(makeTile(color, value, tileCopy));
        })
      });
    });
    // jokers
    bag.push(makeTile(TILE_COLOR.BLACK, 999, 'A'));
    bag.push(makeTile(TILE_COLOR.RED, 999, 'B'));
    // shuffle the tiles in random order
    const shuffledBag = shuffle(bag);
    console.log('shuffled', shuffledBag);
    this.state.bag = shuffledBag;
  }
  drawTiles(playerIndex: number, count: number): GameState {
    const {bag, hands} = this.state;
    if(count > bag.length) {
      throw Error("not enough tiles in bag");
    }
    times(count, () => {
      const tile = this.state.bag.pop(); // mutates bag
      if(tile === undefined) return;
      const handTile = {...tile};

      if(playerIndex >= hands.length) {
        throw Error(`invalid player index ${playerIndex}`)
      }
      this.state.hands[playerIndex].push(handTile);
    });
    console.log(`player ${playerIndex} drew ${count} tiles`, hands);
    return this.state;
  }
  playTile(playerIndex: number, tileId: string): GameState {
    const {hands, gridTiles} = this.state;
    if(playerIndex >= hands.length) {
      throw Error(`invalid player index ${playerIndex}`)
    }
    const hand = hands[playerIndex];
    const handTileIndex = findIndex(hand, (tile) => tile.id === tileId);
    if(handTileIndex < 0) throw Error(`couldn't find tile ${tileId} in hand`);

    const handTile = hand[handTileIndex];
    const gridTile: GameGridTile = {
      ...handTile,
      position: {
        x: random(300, 500),
        y: random(300, 400)
      }
    };
    // remove tile from hand
    hand.splice(handTileIndex, 1);
    // add it to the grid
    gridTiles.push(gridTile);
    return this.state;
  }
  getState(): GameState {
    return this.state;
  }
}


function makeTile(color: TILE_COLOR, value: number, tileCopy: string): GameTile {
  return {
    id: `${color}-${value}-${tileCopy}`,
    type: "tileNode",
    data: { value, color }
  }
}