import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {current} from "immer";
import range from "lodash/range";
import random from "lodash/random";
import shuffle from 'lodash/shuffle';
import times from 'lodash/times';
import findIndex from 'lodash/findIndex';
import { Node as FlowNode, Edge as FlowEdge, NodeChange, applyNodeChanges } from 'react-flow-renderer';

import { RootState, AppThunk } from '../../app/store';
import { GameClient, GameResponseSuccess, GridTileChangesMessage } from './GameClient';
import { cloneDeep, find } from 'lodash';

import { Crummytile } from 'crummytile-shared';


enum TILE_COLOR {
  RED = 'RED',
  BLACK = 'BLK',
  BLUE = 'BLU',
  YELLOW = 'YLW'
};
const TILE_COPIES = {
  A: 'A',
  B: 'B'
}

type TileId = string;
// type TileBag = { [id: TileId]: boolean };
type TileBag = TileId[];

export interface GameTile {
  id: string;
  value: number;
  color: TILE_COLOR,
}

export interface GridTileNodeData {
  value: number;
  color: TILE_COLOR;
}
// export interface GridTileNode extends FlowNode<GameTileNodeData> {}
export type GridTileNode = FlowNode<GridTileNodeData>;

export type HandTile = Omit<GridTileNode, 'position'>


export interface GameState {
  bag: TileBag;
  // hand: GameTile[];
  hands: HandTile[][];
  gridTiles: GridTileNode[];
  playerIndex: number;
  id: string;
}

export interface GameSliceState {
  // status: 'idle' | 'loading' | 'failed';
  // bag: TileBag;
  // hand: HandTile[];
  // gridTiles: GridTileNode[];
  connected: boolean;
  errMsg?: string;
  game?: GameState;
}
const initialState: GameSliceState = {
  // status: 'idle',
  // bag: [],
  // hand: [],
  // gridTiles: [],
  connected: false
};


export function fetchCount(amount = 1) {
  return new Promise<{ data: number }>((resolve) =>
    setTimeout(() => resolve({ data: amount }), 500)
  );
}
  
// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
// export const incrementAsync = createAsyncThunk(
//   'game/fetchCount',
//   async (amount: number) => {
//     const response = await fetchCount(amount);
//     // The value we return becomes the `fulfilled` action payload
//     return response.data;
//   }
// );

// export const hostGame = createAsyncThunk(
//   'game/host',
//   async (client: GameClient) => {
//     return 4;
//   }
// )

let gameInstance: Crummytile | null = null;

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes
  reducers: {
    // initBag: (state) => {
    //   if(!state.game) throw Error("no game exists");

    //   console.log('initializing bag');
    //   const bag: TileBag = [];
    //   Object.values(TILE_COPIES).forEach(tileCopy => {
    //     Object.values(TILE_COLOR).forEach(color => {
    //       range(1, 14).forEach((value: number) => {
    //         const tileId = `${color}-${value}-${tileCopy}`;
    //         // bag[tileId] = true;
    //         bag.push(tileId);
    //       })
    //     });
    //   });
    //   // jokers
    //   bag.push(`${TILE_COLOR.BLACK}-999-A`);
    //   bag.push(`${TILE_COLOR.RED}-999-B`);

    //   // shuffle the tiles in random order
    //   const shuffledBag = shuffle(bag);
    //   console.log(shuffledBag);
      
    //   state.game.bag = shuffledBag;
    // },

    drawTiles: (state, action: PayloadAction<{player: number, count: number}>) => {
      if(!gameInstance) throw Error("no game exists");
      const {player, count} = action.payload;
      const newState = cloneDeep(gameInstance.drawTiles(player, count));
      Object.assign(state.game, {
        bag: newState.bag,
        hands: newState.hands
      });
    },
    drawTilesOld: (state, action: PayloadAction<{player: number, count: number}>) => {
      if(!state.game) throw Error("no game exists");
      const game = state.game;

      const {payload} = action;
      const {player, count} = payload;
      // const {bag, hands}
      
      if(count > state.game.bag.length) {
        throw Error("not enough tiles in bag");
      }
      times(count, () => {
        const tileId = game.bag.pop();
        console.log(tileId);
        if(tileId === undefined) return;
        const [color, valueStr] = tileId.split('-');
        const value = parseInt(valueStr);

        const handTile: HandTile = {
          id: tileId,
          data: {
            color: color as TILE_COLOR,
            value
          },
          type: 'tileNode'
        };
        const {playerIndex} = game;
        if(playerIndex >= game.hands.length) {
          throw Error(`invalid player index ${playerIndex}`)
        }

        game.hands[playerIndex].push(handTile);
      })

      console.log(current(state));
    },
    playTile: (state, action: PayloadAction<{tileId: string}>) => {
      if(!state.game) throw Error("no game exists");
      const {game} = state;
      const {tileId} = action.payload;

      const myHand = game.hands[game.playerIndex];
      const handTileIndex = findIndex(myHand, (tile) => tile.id === tileId)
      if(handTileIndex < 0) throw Error(`couldn't find tile ${tileId} in hand`);
      const handTile = myHand[handTileIndex];

      const gridTile: GridTileNode = {
        ...handTile,
        position: {
          x: random(0, 800),
          y: random(0, 400)
        }
      };
      // remove tile from hand
      myHand.splice(handTileIndex, 1);
      // add it to the grid
      game.gridTiles.push(gridTile);
    },
    updateGridTiles: (state, action: PayloadAction<GridTileNode[]>) => {
      if(!state.game) return;
      state.game.gridTiles = action.payload;
    },
    
    handleHostGameSuccess: (state, action: PayloadAction<GameResponseSuccess>) => {
      const {payload} = action;

      gameInstance = new Crummytile({playerCount: 2, id: payload.id});

      state.game = {
        bag: [],
        // todo how to decide how many players?
        hands: [[], []],
        gridTiles: [],
        playerIndex: payload.playerIndex,
        id: payload.id
      }
    },
    handleJoinGameSuccess: (state, action: PayloadAction<GameResponseSuccess>) => {
      const {payload} = action;

      gameInstance = new Crummytile({playerCount: 2, id: payload.id});

      state.game = {
        bag: [],
        // todo how to decide how many players?
        hands: [[], []],
        gridTiles: [],
        playerIndex: payload.playerIndex,
        id: payload.id
      }
    },
    handleJoinGameError: (state, action: PayloadAction<string>) => {
      const errMsg = action.payload;
      state.errMsg = errMsg;
    },

    handleSocketGridTilesChange: (state, action: PayloadAction<GridTileChangesMessage>) => {
      if(!state.game) return;
      const {playerIndex, changes} = action.payload;

      if(playerIndex !== state.game.playerIndex) {
        console.log('got changes from someone else!!');
        
        // TEMP HACK TO HACK IN TILES THAT DON'T EXIST - TODO FIX ME!!
        changes.forEach((change) => {
          const tileId = (change as {id: string}).id;
          const {gridTiles} = state.game as GameState;
          const gridTile = find(gridTiles, tile => tile.id === tileId);

          if(!gridTile) {
            console.log('hacking in the tile', tileId);
            if(tileId === undefined) return;
            const [color, valueStr] = tileId.split('-');
            const value = parseInt(valueStr);

            const newGridTile: GridTileNode = {
              id: tileId,
              data: {
                color: color as TILE_COLOR,
                value
              },
              position: {x: 0, y: 0},
              type: 'tileNode'
            };
            gridTiles.push(newGridTile);
          }
        })

        const newTiles = applyNodeChanges(changes, state.game.gridTiles);
        state.game.gridTiles = newTiles;
      }
    },
    handleGridTilesChange: (state, action: PayloadAction<NodeChange[]>) => {
      if(!state.game) return;
      const changes = action.payload;
      const newTiles = applyNodeChanges(changes, state.game.gridTiles);
      state.game.gridTiles = newTiles;
  //     // console.log('newTiles', JSON.stringify(newTiles));
    },
    handleConnect: (state) => {
      state.connected = true;
    },
    handleDisconnect: (state) => {
      state.connected = false;
    }
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(incrementAsync.pending, (state) => {
  //       state.status = 'loading';
  //     })
  //     .addCase(incrementAsync.fulfilled, (state, action) => {
  //       state.status = 'idle';
  //       state.value += action.payload;
  //     })
  //     .addCase(incrementAsync.rejected, (state) => {
  //       state.status = 'failed';
  //     });
  // },
});

export const gameActions = gameSlice.actions;

export const selectGame = (state: RootState) => state.game.game;
export const selectBag = (state: RootState) => state.game.game?.bag;
export const selectMyHand = (state: RootState) => {
  const game = state.game.game;
  if(!game) return undefined;
  return game.hands[game.playerIndex];
};
export const selectGridTiles = (state: RootState) => state.game.game?.gridTiles;
export const selectConnected = (state: RootState) => state.game.connected;
export const selectErrMsg = (state: RootState) => state.game.errMsg;

export default gameSlice.reducer;
