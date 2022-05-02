import { useCallback, useContext } from 'react';
import ReactFlow, { MiniMap, Controls, Node as FlowNode, Edge as FlowEdge, NodeTypes, applyNodeChanges, NodeChange } from 'react-flow-renderer';

// import { useCallback } from 'react';
// import { Handle, Position } from 'react-flow-renderer';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { gameActions, selectGame, selectGridTiles } from '../../features/game/gameSlice';
import { TileNode } from './TileNode';
import './GameGrid.scss'
import { GameClientContext } from './GameClientProvider';
import { throttle } from 'lodash';

const nodeTypes = { tileNode: TileNode };

export interface GameGridProps { }
export function GameGrid({}: GameGridProps) {
  const dispatch = useAppDispatch();
  const gridTiles = useAppSelector(selectGridTiles);
  const game = useAppSelector(selectGame);
  const gameClient = useContext(GameClientContext);

  const throttledSendChanges = useCallback(
    throttle((changes) => {
      if(gameClient && game) 
        gameClient.sendGridTileChanges({playerIndex: game.playerIndex, changes});
    }, 33, {trailing: true, leading: true}),
    [gameClient]
  );

  return (
    <div id="game-grid">
      <ReactFlow 
        
        nodes={gridTiles}
        onNodesChange={(changes) => {
          throttledSendChanges(changes);
          dispatch(gameActions.handleGridTilesChange(changes));
        }}
        defaultEdges={[]}
        nodeTypes={nodeTypes as any as NodeTypes}
      >
        {/* <MiniMap /> */}
        <Controls />
      </ReactFlow>
    </div>
  );
}