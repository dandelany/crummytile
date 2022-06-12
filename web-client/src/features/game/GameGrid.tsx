import { useCallback, useContext } from 'react';
import ReactFlow, { MiniMap, Controls, Node as FlowNode, Edge as FlowEdge, NodeTypes, applyNodeChanges, NodeChange, Background, BackgroundVariant, useStore, ReactFlowState } from 'react-flow-renderer';

// import { useCallback } from 'react';
// import { Handle, Position } from 'react-flow-renderer';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { gameActions, selectGame, selectGridTiles, selectPlayerIndex } from '../../features/game/gameSlice';
import { TileNode } from './TileNode';
import './GameGrid.scss'
import { GameClientContext } from './GameClientProvider';
import { throttle } from 'lodash';

const nodeTypes = { tileNode: TileNode };

const transformSelector = (s: ReactFlowState) => s.transform;

function FlowBackgroundImage() {
  const [x, y, scale] = useStore(transformSelector);

  const bgClasses = ['react-flow__background', 'react-flow__container', 'react-flow__background-image'].join(' ');

  return (
    <div
      className={bgClasses}
      style={{
          position: 'fixed',
          width: '100%',
          height: '100%',
          top: '0',
          left: '0',
          backgroundImage: "url('/plaid_small.jpg')",
          backgroundSize: `${scale*100 * 0.5}%`,
          backgroundPositionX: `${x}px`,
          backgroundPositionY: `${y}px`,
      }}
    />
  )

}

export interface GameGridProps { }
export function GameGrid({}: GameGridProps) {
  const dispatch = useAppDispatch();
  const gridTiles = useAppSelector(selectGridTiles);
  const game = useAppSelector(selectGame);
  const playerIndex = useAppSelector(selectPlayerIndex);
  const gameClient = useContext(GameClientContext);

  const throttledSendChanges = useCallback(
    throttle((changes) => {
      if(gameClient && game && playerIndex !== undefined) 
        gameClient.sendGridTileChanges({playerIndex: playerIndex, changes});
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
        {/* <Background variant={BackgroundVariant.Dots} /> */}
        <FlowBackgroundImage />
        <Controls style={{top: '15px', }} />
      </ReactFlow>
    </div>
  );
}