import React, {useCallback} from 'react';
import { Node, Handle, NodeProps } from 'react-flow-renderer';

import './TileNode.scss';

interface TileNodeProps extends NodeProps {
  data: {
    value: number,
    color: "black" | "blue" | "red" | "yellow"
  }
}

export function TileNode(props: TileNodeProps) {
  const {value, color} = props.data;
  
  const isJoker = value === 999;
  const displayValue = isJoker ? "😂" : value;

  return (
    <div className={`tile-node tile-node-${color}`}>
      <h1>{displayValue}</h1>
    </div>
  );
}