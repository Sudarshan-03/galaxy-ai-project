import { useNodes, useEdges } from "reactflow";
import { useMemo } from "react";

/**
 * Hook to retrieve data from a node connected to a specific handle.
 */
const getEffectiveValue = (sourceNode: any, handleId: string) => {
  const sourceData = sourceNode.data || {};
  const executionResult = sourceData.executionResult || {};

  // Hierarchy: executionResult (latest flow) -> manual data fields
  switch (handleId) {
    case 'image_url':
      return executionResult.imageUrl || executionResult.croppedImageUrl || executionResult.frameUrl || sourceData.imageUrl;
    case 'video_url':
      return executionResult.videoUrl || sourceData.videoUrl;
    case 'text_output':
      return executionResult.text || sourceData.text;
    case 'output':
      return executionResult.croppedImageUrl || executionResult.frameUrl || executionResult.responseText || executionResult.text || sourceData.responseText || sourceData.text || sourceData.imageUrl || sourceData.videoUrl;
    default:
      // Other specific ones (positions, etc)
      if (handleId.includes('_percent')) {
        return executionResult.text || sourceData.text || sourceData[handleId.replace('_percent', '')];
      }
      return executionResult.text || sourceData.text;
  }
};

/**
 * Hook to retrieve data from a node connected to a specific handle.
 */
export const useConnectedData = (nodeId: string, handleId: string) => {
  const edges = useEdges();
  const nodes = useNodes();

  return useMemo(() => {
    const edge = edges.find(
      (e) => e.target === nodeId && e.targetHandle === handleId
    );
    if (!edge) return null;

    const sourceNode = nodes.find((n) => n.id === edge.source);
    if (!sourceNode) return null;

    return getEffectiveValue(sourceNode, edge.sourceHandle || handleId);
  }, [edges, nodes, nodeId, handleId]);
};

/**
 * Hook to retrieve multiple data points from all nodes connected to a specific handle.
 */
export const useMultiConnectedData = (nodeId: string, handleId: string): string[] => {
  const edges = useEdges();
  const nodes = useNodes();

  return useMemo(() => {
    const matchingEdges = edges.filter(
      (e) => e.target === nodeId && e.targetHandle === handleId
    );
    
    if (matchingEdges.length === 0) return [];

    return matchingEdges.map(edge => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (!sourceNode) return null;
      return getEffectiveValue(sourceNode, edge.sourceHandle || handleId);
    }).filter((val): val is string => val !== null && val !== undefined);
  }, [edges, nodes, nodeId, handleId]);
};
