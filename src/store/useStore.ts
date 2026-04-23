import { create } from 'zustand';
import { temporal } from 'zundo';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { toast } from 'sonner';
import { isCircularConnection } from '@/lib/dagUtils';

export type ExecutionStatus = 'idle' | 'waiting' | 'running' | 'completed' | 'error';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  duplicateNode: (nodeId: string) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  toggleNodeLock: (nodeId: string) => void;
  isHandleConnected: (nodeId: string, handleId: string, type: 'target' | 'source') => boolean;
  updateNodeData: (nodeId: string, data: any) => void;
  updateNodeStatus: (nodeId: string, status: ExecutionStatus) => void;
  setExecutionResult: (nodeId: string, result: any) => void;
  resetExecution: (nodeIds?: string[]) => void;
  isHistoryOpen: boolean;
  setHistoryOpen: (open: boolean) => void;
  exportSelectedNodes: () => void;
  importWorkflow: (json: string) => void;
}

export const useStore = create<WorkflowState>()(
  temporal((set, get) => ({
    nodes: [],
    edges: [],
    onNodesChange: (changes: NodeChange[]) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection: Connection) => {
      const { nodes, edges } = get();
      
      if (isCircularConnection(connection.source!, connection.target!, nodes, edges)) {
        toast.error("Circular connection detected", {
          description: "This workflow engine requires a Directed Acyclic Graph (DAG) for correct execution flow.",
          duration: 3000,
        });
        return;
      }

      set({
        edges: addEdge(connection, edges),
      });
    },
    addNode: (node: Node) => {
      set({
        nodes: [...get().nodes, node],
      });
    },
    setNodes: (nodes: Node[]) => {
      set({ nodes });
    },
    setEdges: (edges: Edge[]) => {
      set({ edges });
    },
    duplicateNode: (nodeId: string) => {
      const { nodes } = get();
      const nodeToDuplicate = nodes.find((n) => n.id === nodeId);
      if (nodeToDuplicate) {
        const newNode = {
          ...nodeToDuplicate,
          id: `node_${Date.now()}`,
          position: {
            x: nodeToDuplicate.position.x + 40,
            y: nodeToDuplicate.position.y + 40,
          },
          selected: false,
        };
        set({
          nodes: [...nodes, newNode],
        });
      }
    },
    updateNodeLabel: (nodeId: string, label: string) => {
      set({
        nodes: get().nodes.map((node) => 
          node.id === nodeId ? { ...node, data: { ...node.data, label } } : node
        ),
      });
    },
    toggleNodeLock: (nodeId: string) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, draggable: node.draggable === false ? true : false };
          }
          return node;
        }),
      });
    },
    isHandleConnected: (nodeId: string, handleId: string, type: 'target' | 'source') => {
      const { edges } = get();
      return edges.some((edge) => 
        (type === 'target' && edge.target === nodeId && edge.targetHandle === handleId) ||
        (type === 'source' && edge.source === nodeId && edge.sourceHandle === handleId)
      );
    },
    updateNodeData: (nodeId: string, data: any) => {
      set({
        nodes: get().nodes.map((node) => 
          node.id === nodeId ? { ...node, data: { ...node.data, ...data }, // Spread into new data object
            // Increment version or just replace object to force re-render 
          } : node
        ),
      });
    },
    updateNodeStatus: (nodeId: string, status: ExecutionStatus) => {
      set({
        nodes: get().nodes.map((node) => 
          node.id === nodeId ? { ...node, data: { ...node.data, executionStatus: status } } : node
        ),
      });
    },
    setExecutionResult: (nodeId: string, result: any) => {
      set({
        nodes: get().nodes.map((node) => 
          node.id === nodeId ? { ...node, data: { ...node.data, executionResult: result, executionStatus: 'completed' } } : node
        ),
      });
    },
    resetExecution: (nodeIds?: string[]) => {
      set({
        nodes: get().nodes.map((node) => {
          if (!nodeIds || nodeIds.includes(node.id)) {
            return {
              ...node,
              data: { ...node.data, executionStatus: 'idle', executionResult: null }
            };
          }
          return node;
        }),
      });
    },
    isHistoryOpen: false,
    setHistoryOpen: (open: boolean) => set({ isHistoryOpen: open }),
    
    exportSelectedNodes: () => {
      const { nodes, edges } = get();
      const selectedNodes = nodes.filter(n => n.selected);
      if (selectedNodes.length === 0) {
        toast.error("No nodes selected", { description: "Select nodes to export them as JSON." });
        return;
      }

      const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
      const connectedEdges = edges.filter(e => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target));

      const data = {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        nodes: selectedNodes,
        edges: connectedEdges
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `workflow_export_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Nodes exported", { description: `${selectedNodes.length} nodes saved to JSON.` });
    },

    importWorkflow: (jsonString: string) => {
      try {
        const data = JSON.parse(jsonString);
        if (!data.nodes || !Array.isArray(data.nodes)) {
          throw new Error("Invalid format: 'nodes' array missing.");
        }

        const { nodes: currentNodes, edges: currentEdges } = get();
        
        const idMap: Record<string, string> = {};
        const timestamp = Date.now();
        
        const importedNodes = data.nodes.map((n: Node, idx: number) => {
          const newId = `imported_${timestamp}_${idx}`;
          idMap[n.id] = newId;
          return {
            ...n,
            id: newId,
            selected: false,
            position: {
              x: n.position.x + 100,
              y: n.position.y + 100
            }
          };
        });

        const importedEdges = (data.edges || []).map((e: Edge) => ({
          ...e,
          id: `edge_${Date.now()}_${Math.random()}`,
          source: idMap[e.source] || e.source,
          target: idMap[e.target] || e.target
        }));

        set({
          nodes: [...currentNodes, ...importedNodes],
          edges: [...currentEdges, ...importedEdges]
        });

        toast.success("Workflow imported", { description: `Successfully added ${importedNodes.length} nodes.` });
      } catch (error) {
        console.error("[Import] Error:", error);
        toast.error("Import failed", { description: "Could not parse or validate the workflow JSON." });
      }
    }
  }))
)
