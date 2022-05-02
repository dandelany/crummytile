import { useCallback, useContext, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
  gameActions, selectMyHand, selectBag, selectConnected, selectErrMsg
} from './gameSlice';
import "./MainMenu.scss";
import { GameClientContext } from './GameClientProvider';

export function MainMenu() {
  const dispatch = useAppDispatch();
  const connected = useAppSelector(selectConnected);
  const errMsg = useAppSelector(selectErrMsg);

  const gameClient = useContext(GameClientContext);

  const hostGame = useCallback(async () => {
    if(gameClient) {
      try {
        const gameInfo = await gameClient.hostGame();
        console.log('host game', gameInfo);
        dispatch(gameActions.handleHostGameSuccess(gameInfo));
      } catch(err) {
        console.error('F', err);
      }
    }
  }, [gameClient]);

  const joinGame = useCallback(async () => {
    if(gameClient) {
      try {
        const gameInfo = await gameClient.joinGame();
        console.log('join game', gameInfo);
        dispatch(gameActions.handleJoinGameSuccess(gameInfo));
      } catch(err) {
        console.error(err);
        dispatch(gameActions.handleJoinGameError(err as string));
      }
    }
  }, [gameClient]);

  const disableButtons = !connected || !gameClient;

  return (
    <div className="main-menu">
      <div className="logo">🤔</div>
      <h1>Crummytile</h1>
      
      <div className='button-container'>
        <button 
          onClick={hostGame}
          disabled={disableButtons}
        >
          Host Game
        </button>
      </div>
      <div className='button-container'>
        <button onClick={joinGame} disabled={disableButtons}>
          Join Game
        </button>
      </div>
      {connected ? 
        (errMsg ? 
          <p className='warning'>{errMsg}</p>
          : <p>Dan ❤️ B</p>
        ) :
        <p className='warning'>Not connected to game server</p>
      }
      
    </div>
  );
}