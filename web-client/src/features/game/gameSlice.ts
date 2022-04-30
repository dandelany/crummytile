import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import {current} from "immer";
import range from "lodash/range";
import random from "lodash/random";
import shuffle from 'lodash/shuffle';
import times from 'lodash/times';
import findIndex from 'lodash/findIndex';
import { Node as FlowNode, Edge as FlowEdge, NodeChange, applyNodeChanges } from 'react-flow-renderer';

import { RootState, AppThunk } from '../../app/store';


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
  value: number;
  status: 'idle' | 'loading' | 'failed';
  bag: TileBag;
  // hand: GameTile[];
  hand: HandTile[];
  gridTiles: GridTileNode[];
  connected: boolean;
}
const initialState: GameState = {
  value: 0,
  status: 'idle',
  bag: [],
  hand: [],
  gridTiles: [],
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

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes
  reducers: {
    initBag: (state) => {
      console.log('initializing bag');
      const bag: TileBag = [];
      Object.values(TILE_COPIES).forEach(tileCopy => {
        Object.values(TILE_COLOR).forEach(color => {
          range(1, 14).forEach((value: number) => {
            const tileId = `${color}-${value}-${tileCopy}`;
            // bag[tileId] = true;
            bag.push(tileId);
          })
        });
      });
      // jokers
      bag.push(`${TILE_COLOR.BLACK}-999-A`);
      bag.push(`${TILE_COLOR.RED}-999-B`);

      // shuffle the tiles in random order
      const shuffledBag = shuffle(bag);
      console.log(shuffledBag);
      
      state.bag = shuffledBag;
    },

    drawTiles: (state, action: PayloadAction<{player: number, count: number}>) => {
      const {payload} = action;
      const {player, count} = payload;
      
      if(count > state.bag.length) {
        throw Error("not enough tiles in bag");
      }
      times(count, () => {
        const tileId = state.bag.pop();
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
        state.hand.push(handTile);
        
        // add to grid
        // const tileNode: GridTileNode = {
        //   id: tileId,
        //   position: {
        //     x: random(0, 800),
        //     y: random(0, 400)
        //   },
        //   data: {
        //     color: color as TILE_COLOR,
        //     value
        //   },
        //   type: 'tileNode'
        // };
        // state.gridTiles.push(tileNode);
      })

      console.log(current(state));
    },
    playTile: (state, action: PayloadAction<{tileId: string}>) => {
      const {tileId} = action.payload;
      const handTileIndex = findIndex(state.hand, (tile) => tile.id === tileId)
      if(handTileIndex < 0) throw Error(`couldn't find tile ${tileId} in hand`);
      const handTile = state.hand[handTileIndex];

      const gridTile: GridTileNode = {
        ...handTile,
        position: {
          x: random(0, 800),
          y: random(0, 400)
        }
      };
      // remove tile from hand
      state.hand.splice(handTileIndex, 1);
      // add it to the grid
      state.gridTiles.push(gridTile);
    },
    updateGridTiles: (state, action: PayloadAction<GridTileNode[]>) => {
      state.gridTiles = action.payload;
    },
    
    handleGridTilesChange: (state, action: PayloadAction<NodeChange[]>) => {
      const changes = action.payload;
      const newTiles = applyNodeChanges(changes, state.gridTiles);
      state.gridTiles = newTiles;
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

export const selectBag = (state: RootState) => state.game.bag;
export const selectHand = (state: RootState) => state.game.hand;
export const selectGridTiles = (state: RootState) => state.game.gridTiles;
export const selectConnected = (state: RootState) => state.game.connected;

export default gameSlice.reducer;
