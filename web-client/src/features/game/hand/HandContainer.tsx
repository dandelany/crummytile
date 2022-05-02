import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import {
  gameActions, selectMyHand, selectBag, selectConnected
} from '../../../features/game/gameSlice';

import "./HandContainer.scss";
import { HandTileItem } from './HandTileItem';

export function HandContainer() {
  // container for the tiles you have in your hand
  const dispatch = useAppDispatch();
  const hand = useAppSelector(selectMyHand);

  if(!hand) return null;
  return (
    <div className="hand-container">
        {hand.map(tile => <HandTileItem tile={tile} key={tile.id} />)}
    </div>
  );
}