import React, { ChangeEvent, useCallback } from 'react';
import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import random from "lodash/random";
import './App.css';


import ReactFlow, { MiniMap, Controls, Node as FlowNode, Edge as FlowEdge, NodeTypes } from 'react-flow-renderer';

// import { useCallback } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { TileNode } from './features/game/TileNode';

import { useAppSelector, useAppDispatch } from './app/hooks';
import {
  gameActions, selectHand, selectBag
} from './features/game/gameSlice';

const handleStyle = { left: 10 };


const nodeTypes = { tileNode: TileNode };


interface FlowProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
}
function Flow({ nodes, edges }: FlowProps) {
  return (
    <ReactFlow 
      defaultNodes={nodes} 
      defaultEdges={edges}
      nodeTypes={nodeTypes as any as NodeTypes}
    >
      <MiniMap />
      <Controls />
    </ReactFlow>
  );
}

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
  const handNodes: FlowNode<any>[] = hand.map(tile => {
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
      <Flow 
        nodes={handNodes}
        // nodes={[
        //   {
        //     id: '1',
        //     position: {x: 100, y: 100}, 
        //     data: {value: 10, color: 'black'},
        //     type: 'tileNode'
        //   },
        //   {
        //     id: '2',
        //     position: {x: 180, y: 100}, 
        //     data: {value: 4, color: 'red'},
        //     type: 'tileNode'
        //   },
        //   {
        //     id: '3',
        //     position: {x: 260, y: 100}, 
        //     data: {value: 5, color: 'blue'},
        //     type: 'tileNode'
        //   },
        //   {
        //     id: '4',
        //     position: {x: 340, y: 100}, 
        //     data: {value: 6, color: 'yellow'},
        //     type: 'tileNode'
        //   }
        // ]} 
        edges={[]}
      />
      </div>
    </div>
  );
}

export default App;
