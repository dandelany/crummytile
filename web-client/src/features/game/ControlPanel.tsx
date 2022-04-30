import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
  gameActions, selectHand, selectBag, selectConnected
} from '../../features/game/gameSlice';
import "./ControlPanel.scss";

export function ControlPanel() {
  const dispatch = useAppDispatch();
  const hand = useAppSelector(selectHand);
  const bag = useAppSelector(selectBag);
  const connected = useAppSelector(selectConnected);

  useEffect(() => {
    dispatch(gameActions.initBag());
  }, [])

  return (
    <div className="control-panel">
      {/* <button onClick={() => {dispatch(gameActions.initBag())}}>
          Shuffle
      </button> */}
      <h4>
        {connected ? "Connected" : "Disconnected"}
      </h4>
      <button onClick={() => {
        dispatch(gameActions.drawTiles({player: 0, count: 1}))
      }}>
          Draw Tile
      </button>
      <h4>
        {bag.length} tiles in bag
      </h4>
    </div>
  );
}