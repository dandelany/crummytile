import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import {
  gameActions, selectHand, selectBag, selectConnected
} from '../../../features/game/gameSlice';

import "./HandContainer.scss";
import { HandTileItem } from './HandTileItem';

export function HandContainer() {
  // container for the tiles you have in your hand
  const dispatch = useAppDispatch();
  const hand = useAppSelector(selectHand);
  const bag = useAppSelector(selectBag);

  return (
    <div className="hand-container">
        {hand.map(tile => <HandTileItem tile={tile} />)}
    </div>
  );
}