import { useContext, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
  gameActions, selectMyHand, selectBag, selectConnected
} from '../../features/game/gameSlice';
import "./ControlPanel.scss";
import { GameClientContext } from './GameClientProvider';

export function ControlPanel() {
  const dispatch = useAppDispatch();
  const hand = useAppSelector(selectMyHand);
  const bag = useAppSelector(selectBag);
  const connected = useAppSelector(selectConnected);

  // useEffect(() => {
  //   dispatch(gameActions.initBag());
  // }, [])

  const gameClient = useContext(GameClientContext);

  return (
    <div className="control-panel">
      {/* <button onClick={() => {dispatch(gameActions.initBag())}}>
          Shuffle
      </button> */}
      <div>
        <button onClick={() => {
          if(gameClient) {
            gameClient.hostGame();
          }
        }}>Host Game</button>
      </div>
      <h4>
        {connected ? "Connected" : "Disconnected"}
      </h4>
      <button onClick={() => {
        dispatch(gameActions.drawTiles({player: 0, count: 1}))
      }}>
          Draw Tile
      </button>
      {bag ? 
        <h4>
          {bag.length} tiles in bag
        </h4>
        : null
      }
      
    </div>
  );
}