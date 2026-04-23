"use client";

import React, { useCallback, useRef, useMemo, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  SelectionMode,
  Connection,
  useReactFlow,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "@/store/useStore";
import { 
  Undo2, 
  Redo2, 
  MousePointer2, 
  Hand,
  PanelLeftOpen,
  History,
  Download,
  Upload,
} from "lucide-react";
import { nodeTypes, edgeTypes } from "./nodeTypes";
import { ZoomDropdown } from "./ZoomDropdown";
import { isCircularConnection } from "@/lib/dagUtils";
import { isValidHandleConnection } from "@/lib/validationUtils";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

let id = 0;
const getId = () => `node_${id++}`;

function WorkflowCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { getNodes, getEdges, deleteElements } = useReactFlow();
  const [interactMode, setInteractMode] = useState<'select' | 'pan'>('select');
  const { toggleSidebar, open } = useSidebar();
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    duplicateNode,
    isHistoryOpen,
    setHistoryOpen,
  } = useStore();
  
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (!type) return;

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const nodeLabelMap: Record<string, string> = {
        textNode: "Text",
        imageNode: "Upload Image",
        videoNode: "Upload Video",
        llmNode: "LLM",
        imageGenNode: "Image Gen",
        cropNode: "Crop Image",
        frameNode: "Extract Frame",
      };

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: nodeLabelMap[type] || type },
      };

      addNode(newNode);
    },
    [addNode]
  );

  // Edge cleanup on node deletion
  const onNodesDelete = useCallback((deleted: Node[]) => {
    const { edges, setEdges } = useStore.getState();
    const deletedIds = new Set(deleted.map(n => n.id));
    const newEdges = edges.filter(
      (edge) => !deletedIds.has(edge.source) && !deletedIds.has(edge.target)
    );
    setEdges(newEdges);
  }, []);

  // Connection validation (DAG + Type-Safety)
  const isValidConnection = useCallback((connection: Connection) => {
    const nodes = getNodes();
    const edges = getEdges();

    // 1. Cycle Detection
    if (isCircularConnection(connection.source!, connection.target!, nodes, edges)) {
      toast.error("Circular loops are not allowed", {
        description: "Connecting these nodes would create a cycle which violates the DAG structure.",
        duration: 3000,
        position: 'top-right'
      });
      return false;
    }

    // 2. Unified Type-Safety & Structural Validation
    const isValid = isValidHandleConnection(connection, nodes, edges);

    if (!isValid) {
      toast.error("Invalid Connection", {
        description: "These handles are incompatible or would create an invalid data flow.",
        duration: 3000,
      });
    }

    return isValid;
  }, [getNodes, getEdges]);

  // Handle Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Duplicate: Ctrl + D
      if (modifier && e.key === 'd') {
        const selectedNodes = getNodes().filter(n => n.selected);
        if (selectedNodes.length > 0) {
          e.preventDefault();
          selectedNodes.forEach(node => duplicateNode(node.id));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [getNodes, duplicateNode]);

  const nodeTypesMemo = useMemo(() => nodeTypes, []);
  const edgeTypesMemo = useMemo(() => edgeTypes, []);

  return (
    <div className="flex-1 h-full relative bg-background" ref={reactFlowWrapper}>
      {/* Floating Sidebar Trigger */}
      {!open && (
        <button
          onClick={() => toggleSidebar()}
          className="absolute top-4 left-4 z-50 p-2 bg-[#1a1a1f]/90 border border-white/10 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-all shadow-xl backdrop-blur-sm"
          title="Open Sidebar"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>
      )}

      {/* History Sidebar Toggle */}
      <button
        onClick={() => setHistoryOpen(!isHistoryOpen)}
        className={cn(
          "absolute top-4 right-4 z-50 p-2 border rounded-md transition-all flex items-center gap-2",
          isHistoryOpen 
            ? "bg-white text-black border-white" 
            : "bg-[#0a0a0a] border-white/10 text-white/60 hover:text-white hover:bg-[#1a1a1a]"
        )}
        title="View Audit Log"
      >
        <History className="w-5 h-5" />
        {isHistoryOpen && <span className="text-[10px] font-medium tracking-wide mr-1">History</span>}
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#a855f7', strokeWidth: 2 },
        }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypesMemo}
        edgeTypes={edgeTypesMemo}
        isValidConnection={isValidConnection}
        onNodesDelete={onNodesDelete}
        selectionMode={SelectionMode.Partial}
        selectionOnDrag={interactMode === 'select'}
        panOnDrag={interactMode === 'pan'}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={["Control", "Meta"]}
        panOnScroll={true}
        zoomOnScroll={true}
        fitView
        proOptions={{ hideAttribution: true }}
        className="workflow-canvas-hover"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          color="rgba(255, 255, 255, 0.15)" 
          gap={16} 
          size={1}
        />
        
        {/* Custom Premium Control Bar */}
        <Panel position="bottom-center" className="mb-6">
          <div className="bg-[#0a0a0a] px-2.5 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 shadow-xl">
            {/* Interaction Modes */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setInteractMode('select')}
                className={`p-2 rounded-full transition-all ${
                  interactMode === 'select' 
                  ? "bg-white text-black" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
                title="Select Mode"
              >
                <MousePointer2 className="w-4 h-4 fill-current" />
              </button>
              <button 
                onClick={() => setInteractMode('pan')}
                className={`p-2 rounded-full transition-all ${
                  interactMode === 'pan' 
                  ? "bg-white text-black" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
                title="Pan Mode"
              >
                <Hand className="w-4 h-4 fill-current" />
              </button>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => useStore.temporal.getState().undo()}
                className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-md transition-all"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => useStore.temporal.getState().redo()}
                className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-md transition-all"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Data Portability */}
            <div className="flex items-center gap-1">
               <button 
                 onClick={() => useStore.getState().exportSelectedNodes()}
                 className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all"
                 title="Export Selected"
               >
                 <Download className="w-4 h-4" />
               </button>
               <div className="relative">
                 <button 
                   onClick={() => document.getElementById('workflow-import-input')?.click()}
                   className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all"
                   title="Import Workflow"
                 >
                   <Upload className="w-4 h-4" />
                 </button>
                 <input 
                   id="workflow-import-input"
                   type="file"
                   accept=".json"
                   className="hidden"
                   onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (file) {
                       const reader = new FileReader();
                       reader.onload = (event) => {
                         const content = event.target?.result;
                         if (typeof content === 'string') {
                           useStore.getState().importWorkflow(content);
                         }
                         // Reset input
                         e.target.value = '';
                       };
                       reader.readAsText(file);
                     }
                   }}
                 />
               </div>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Zoom Dropdown */}
            <ZoomDropdown />
          </div>
        </Panel>

        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'textNode': return '#aaaaaa';
              case 'llmNode': return '#ffffff';
              case 'imageGenNode': return '#a78bfa';
              default: return '#555555';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.8)"
          className="!bg-[#0a0a0a] !border-white/10 rounded-xl !m-4 shadow-xl"
        />
      </ReactFlow>
      <Toaster position="top-right" />
    </div>
  );
}

export function WorkflowCanvas() {
  return <WorkflowCanvasInner />;
}
