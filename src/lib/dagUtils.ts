import { Edge, Node, getOutgoers } from 'reactflow';

/**
 * Checks if adding an edge between source and target would create a circular loop.
 * Uses Depth-First Search (DFS) to find if source is reachable from target.
 */
export const isCircularConnection = (
  sourceId: string,
  targetId: string,
  nodes: Node[],
  edges: Edge[]
): boolean => {
  // If source and target are the same, it's an immediate cycle
  if (sourceId === targetId) return true;

  const targetNode = nodes.find((n) => n.id === targetId);
  if (!targetNode) return false;

  const visited = new Set<string>();

  const checkCycle = (node: Node): boolean => {
    if (node.id === sourceId) return true;
    if (visited.has(node.id)) return false;

    visited.add(node.id);
    const outgoers = getOutgoers(node, nodes, edges);

    for (const outgoer of outgoers) {
      if (checkCycle(outgoer)) return true;
    }

    return false;
  };

  return checkCycle(targetNode);
};
