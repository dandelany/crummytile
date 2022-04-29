import React, { ChangeEvent, useCallback } from 'react';

import random from "lodash/random";



import ReactFlow, { MiniMap, Controls, Node as FlowNode, Edge as FlowEdge, NodeTypes } from 'react-flow-renderer';

import { useAppSelector, useAppDispatch } from './app/hooks';
import {
  gameActions, selectHand, selectBag
} from './features/game/gameSlice';
import { GameGrid } from './features/game/GameGrid';

import './App.css';

// const handleStyle = { left: 10 };

// const nodeTypes = { tileNode: TileNode };


// interface FlowProps {
//   nodes: FlowNode[];
//   edges: FlowEdge[];
// }
// function Flow({ nodes, edges }: FlowProps) {
//   return (
//     <ReactFlow 
//       defaultNodes={nodes} 
//       defaultEdges={edges}
//       nodeTypes={nodeTypes as any as NodeTypes}
//     >
//       <MiniMap />
//       <Controls />
//     </ReactFlow>
//   );
// }

// export default class App extends React.Component<{}> {
//   render() {
    
//   }
// }

function ControlPanel() {
  const dispatch = useAppDispatch();
  const hand = useAppSelector(selectHand);
  const bag = useAppSelector(selectBag);

  return (
    <div className="control-panel">
      <button onClick={() => {dispatch(gameActions.initBag())}}>
          Shuffle
      </button>
      <button onClick={() => {
        dispatch(gameActions.drawTiles({player: 0, count: 1}))
      }}>
          Draw
      </button>
      <h4>
        {bag.length} tiles in bag
      </h4>
      <h4>
        Tiles in hand:<br />
        {hand.map(tile => tile.value + " ")}
      </h4>
    </div>
  );
}

function App() {
  const hand = useAppSelector(selectHand);
  const handNodes = hand.map(tile => {
    return {
      id: tile.id,
      position: {
        x: random(0, 800),
        y: random(0, 500)
      },
      data: {
        value: tile.value,
        color: tile.color
      },
      type: 'tileNode'
    }
  });

  return (
    <div className="App">
      <ControlPanel />

      <div style={{position: 'absolute', height: "100%", width: "100%"}}>
      <GameGrid 
        nodes={handNodes}
        edges={[]}
      />
      </div>
    </div>
  );
}

export default App;
