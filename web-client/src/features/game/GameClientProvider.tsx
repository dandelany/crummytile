import React, { useMemo } from "react";
import { GameClient, getGameClient } from "./GameClient";
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {gameActions} from '../../features/game/gameSlice';

export const GameClientContext = React.createContext<GameClient | null>(null);
GameClientContext.displayName = 'GameClientContext';

type GameClientProviderProps = React.PropsWithChildren<{}>;

export function GameClientProvider(props: GameClientProviderProps) {
  const dispatch = useAppDispatch();

  const gameClient = useMemo(
    () => { 
      const client = getGameClient();
      if(!Object.keys(client.callbacks).length) {
        client.attachCallbacks({
          onConnect: () => dispatch(gameActions.handleConnect()),
          onDisconnect: () => dispatch(gameActions.handleDisconnect()),
          onGridTileChanges: (changeMsg) => {
            dispatch(gameActions.handleSocketGridTilesChange(changeMsg))
          },
          onDrawTiles: (drawMsg) => {
            dispatch(gameActions.handleSocketDrawTiles(drawMsg))
          },
          onPlayTile: (playMsg) => {
            dispatch(gameActions.handleSocketPlayTile(playMsg))
          }
        })
      }
      return client;
    },
    [] // only once on mount
  );
  
  return (
    <GameClientContext.Provider value={gameClient}>
      {props.children}
    </GameClientContext.Provider>
  )
}