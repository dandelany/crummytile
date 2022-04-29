import { useCallback } from 'react';
import ReactFlow, { MiniMap, Controls, Node as FlowNode, Edge as FlowEdge, NodeTypes, applyNodeChanges, NodeChange } from 'react-flow-renderer';

// import { useCallback } from 'react';
// import { Handle, Position } from 'react-flow-renderer';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { gameActions, selectGridTiles } from '../../features/game/gameSlice';
import { TileNode } from './TileNode';


const nodeTypes = { tileNode: TileNode };

export interface GameGridProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
}
export function GameGrid({}: GameGridProps) {
  const dispatch = useAppDispatch();
  const gridTiles = useAppSelector(selectGridTiles);

  return (
    <ReactFlow 
      nodes={gridTiles}
      onNodesChange={(changes) => {
        dispatch(gameActions.handleGridTilesChange(changes));
      }}
      defaultEdges={[]}
      nodeTypes={nodeTypes as any as NodeTypes}
    >
      <MiniMap />
      <Controls />
    </ReactFlow>
  );
}