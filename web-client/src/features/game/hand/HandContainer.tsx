import { random } from 'lodash';
import ReactFlow, {Controls, NodeTypes} from 'react-flow-renderer';
import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import {
  gameActions, selectMyHand, selectBag, selectConnected
} from '../../../features/game/gameSlice';
import { TileNode } from '../TileNode';

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

const nodeTypes = { tileNode: TileNode };

export function NewHandContainer() {
  const dispatch = useAppDispatch();
  const hand = useAppSelector(selectMyHand);
  if(!hand) return null;

  return (
    <div className="hand-container">
      <ReactFlow
        
        defaultNodes={hand.map(tile => {
          return {
            ...tile,
            position: {
              x: random(0, 8) * 90,
              y: random(0, 1) * 120
            }
          }
        })}
        // onNodesChange={(changes) => {
        //   throttledSendChanges(changes);
        //   dispatch(gameActions.handleGridTilesChange(changes));
        // }}
        defaultEdges={[]}
        nodeTypes={nodeTypes as any as NodeTypes}
        onNodeClick={(event, node) => {
          dispatch(gameActions.playTile({tileId: node.id}));
        }}
        snapGrid={[90, 120]}
        snapToGrid={true}
      >
        {/* <MiniMap /> */}
        <Controls />
      </ReactFlow>
    </div>
  );
}