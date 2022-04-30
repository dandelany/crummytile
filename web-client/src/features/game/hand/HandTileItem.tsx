import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import {
  gameActions, selectHand, selectBag, selectConnected, GridTileNode, HandTile
} from '../gameSlice';

import "./HandTileItem.scss";

export interface HandTileItemProps {
  tile: HandTile;
}
export function HandTileItem(props: HandTileItemProps) {
  const dispatch = useAppDispatch();

  const {tile} = props;
  const {value} = tile.data;
  const isJoker = value === 999;
  const displayValue = isJoker ? "😂" : value;

  return (
    <div className="hand-tile" onClick={() => {
      dispatch(gameActions.playTile({tileId: tile.id}))
    }}>
      <h1 className={`tile-value tile-value-${tile.data.color}`}>
        {displayValue}
      </h1>
    </div>
  );
}