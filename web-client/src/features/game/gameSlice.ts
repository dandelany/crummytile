import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {current} from "immer";
import { Node as FlowNode, Edge as FlowEdge, NodeChange, applyNodeChanges } from 'react-flow-renderer';

import { RootState, AppThunk } from '../../app/store';
import { DrawTilesMessage, GameClient, GameResponseSuccess, GridTileChangesMessage, PlayTileMessage } from './GameClient';
import { cloneDeep, find, pullAllBy } from 'lodash';

import { Crummytile } from 'crummytile-shared';
import { GameGridTile, GameState } from 'crummytile-shared/lib/Crummytile';


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


export interface GameSliceState {
  // status: 'idle' | 'loading' | 'failed';
  connected: boolean;
  errMsg?: string;
  game?: GameState;
  playerIndex?: number;
}
const initialState: GameSliceState = {
  // status: 'idle',
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
    drawTiles: (state, action: PayloadAction<{count: number}>) => {
      if(!gameInstance || state.playerIndex === undefined) throw Error("no game exists");
      const {count} = action.payload;
      const {playerIndex} = state;
      const newState = cloneDeep(gameInstance.drawTiles(playerIndex, count));
      Object.assign(state.game, {
        bag: newState.bag,
        hands: newState.hands
      });
    },
    
    playTile: (state, action: PayloadAction<{tileId: string}>) => {
      if(!state.game) throw Error("no game exists");
      if(!gameInstance || state.playerIndex === undefined) throw Error("no game exists");
      const {tileId} = action.payload;
      const newState = cloneDeep(gameInstance.playTile(state.playerIndex, tileId));
      Object.assign(state.game, {
        hands: newState.hands,
        gridTiles: newState.gridTiles
      });
    },
    
    handleSocketDrawTiles: (state, action: PayloadAction<DrawTilesMessage>) => {
      // todo improve
      const {payload} = action;
      console.log("socket draw tiles", payload);
      console.log(state.playerIndex);
      if(state.game && gameInstance && state.playerIndex !== payload.playerIndex) {
        console.log("handling other player draw tiles", payload);
        let playerHand = payload.hand;
        gameInstance.removeTilesFromBag(playerHand.map(tile => tile.id));
        gameInstance.state.hands[payload.playerIndex] = payload.hand;
        const gameState = gameInstance.getState()
        state.game.bag = cloneDeep(gameState.bag);
      }
      
    },
    handleSocketPlayTile: (state, action: PayloadAction<PlayTileMessage>) => {
      // todo improve
      const {payload} = action;
      console.log("socket play tile", action.payload);
      if(state.game && gameInstance && state.playerIndex !== payload.playerIndex) {
        gameInstance.playTile(payload.playerIndex, payload.tileId);
        state.game.gridTiles = cloneDeep(gameInstance.getState().gridTiles);
      }
    },


    handleHostGameSuccess: (state, action: PayloadAction<GameResponseSuccess>) => {
      const {payload} = action;

      gameInstance = new Crummytile({playerCount: 2, id: payload.id});
      state.playerIndex = payload.playerIndex;

      state.game = cloneDeep(gameInstance.getState());
      // state.game = {
      //   bag: [],
      //   // todo how to decide how many players?
      //   hands: [[], []],
      //   gridTiles: [],
      //   playerIndex: payload.playerIndex,
      //   id: payload.id
      // }
    },
    handleJoinGameSuccess: (state, action: PayloadAction<GameResponseSuccess>) => {
      const {payload} = action;

      gameInstance = new Crummytile({playerCount: 2, id: payload.id});

      state.playerIndex = payload.playerIndex;
      state.game = cloneDeep(gameInstance.getState());
    },
    handleJoinGameError: (state, action: PayloadAction<string>) => {
      const errMsg = action.payload;
      state.errMsg = errMsg;
    },

    handleSocketGridTilesChange: (state, action: PayloadAction<GridTileChangesMessage>) => {
      if(!state.game || !gameInstance) return;
      const {playerIndex, changes} = action.payload;

      if(playerIndex !== state.playerIndex) {
        console.log('got grid tile changes from another player');
        const newTiles = applyNodeChanges(changes, state.game.gridTiles);
        // todo fix this hack!!
        gameInstance.state.gridTiles = JSON.parse(JSON.stringify(newTiles)) as GameGridTile[];
        state.game.gridTiles = newTiles as GameGridTile[]; // todo ??
      }
    },
    handleGridTilesChange: (state, action: PayloadAction<NodeChange[]>) => {
      if(!state.game || !gameInstance) return;
      const changes = action.payload;
      const newTiles = applyNodeChanges(changes, state.game.gridTiles);
      // todo fix this hack!!
      gameInstance.state.gridTiles = JSON.parse(JSON.stringify(newTiles)) as GameGridTile[];
      state.game.gridTiles = newTiles as GameGridTile[]; // todo ??
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
export const selectPlayerIndex =  (state: RootState) => state.game.playerIndex;
export const selectMyHand = (state: RootState) => {
  const game = state.game.game;
  const playerIndex = state.game.playerIndex;
  if(!game || playerIndex === undefined) return undefined;
  return game.hands[playerIndex];
};
export const selectGridTiles = (state: RootState) => state.game.game?.gridTiles;
export const selectConnected = (state: RootState) => state.game.connected;
export const selectErrMsg = (state: RootState) => state.game.errMsg;

export default gameSlice.reducer;
