import React, { useMemo } from "react";
import { GameClient, getGameClient } from "./GameClient";
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {gameActions} from '../../features/game/gameSlice';

const GameClientContext = React.createContext<GameClient | null>(null);
GameClientContext.displayName = 'GameClientContext';

type GameClientProviderProps = React.PropsWithChildren<{}>;

export function GameClientProvider(props: GameClientProviderProps) {
  const dispatch = useAppDispatch();

  const gameClient = useMemo(
    () => getGameClient({
      onConnect: () => dispatch(gameActions.handleConnect()),
      onDisconnect: () => dispatch(gameActions.handleDisconnect())
    }),
    // only once on mount
    []
  );

  return (
    <GameClientContext.Provider value={gameClient}>
      {props.children}
    </GameClientContext.Provider>
  )
}