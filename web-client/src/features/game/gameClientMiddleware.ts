import { Middleware } from "@reduxjs/toolkit";
import { getGameClient } from "./GameClient";
import { gameActions, GameSliceState } from "./gameSlice";

const gameClient = getGameClient();
  
export const gameClientMiddleware: Middleware = store => next => action => {
  if(gameActions.drawTiles.match(action))  {
    next(action);
    const gameSlice = store.getState().game as GameSliceState;
    if(gameSlice && gameSlice.game && gameSlice.playerIndex !== undefined) {
      const {playerIndex, game} = gameSlice;
      const hand = game.hands[playerIndex];
      gameClient.sendDrawTile({playerIndex, hand});
    }
  } else if(gameActions.playTile.match(action)) {
    next(action);
    const gameSlice = store.getState().game as GameSliceState;
    if(gameSlice && gameSlice.game && gameSlice.playerIndex !== undefined) {
      const {playerIndex, game} = gameSlice;
      const {tileId} = action.payload;
      gameClient.sendPlayTile({playerIndex: playerIndex, tileId, gridTiles: game.gridTiles});
    }

  } else {
    next(action);
  }
}

function hasGame(gameSlice: GameSliceState | undefined) {
  return (gameSlice && gameSlice.game && gameSlice.playerIndex !== undefined);
}