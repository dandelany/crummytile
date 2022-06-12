import { useCallback, useContext } from 'react';
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

  const gameClient = useContext(GameClientContext);

  const handleClickDraw = useCallback(() => {
    dispatch(gameActions.drawTiles({count: 1}));
  }, [])

  return (
    <div className="control-panel">
      <h4>
        {connected ? "Connected" : "Disconnected"}
      </h4>
      <button onClick={handleClickDraw}>
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