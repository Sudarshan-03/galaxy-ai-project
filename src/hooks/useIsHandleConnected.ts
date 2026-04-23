import { useEdges } from "reactflow";
import { useMemo } from "react";

/**
 * A reactive hook that checks if a specific handle on a node has an active connection.
 * It selects the 'edges' state from ReactFlow, ensuring the component re-renders
 * whenever a connection is added or removed, either on the main canvas or in history.
 */
export const useIsHandleConnected = (
  nodeId: string, 
  handleId: string, 
  handleType: 'source' | 'target'
) => {
  const edges = useEdges();
  
  return useMemo(() => 
    edges.some((edge) => 
      (handleType === 'target' && edge.target === nodeId && edge.targetHandle === handleId) ||
      (handleType === 'source' && edge.source === nodeId && edge.sourceHandle === handleId)
    ),
  [edges, nodeId, handleId, handleType]);
};
