"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  History,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Layers,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ReactFlow, { 
  Background, 
  BackgroundVariant, 
  ReactFlowProvider,
  Node,
  Edge
} from "reactflow";
import "reactflow/dist/style.css";
// React Flow node types must be defined outside of any component to prevent re-render warnings
import { nodeTypes as historyNodeTypes, edgeTypes as historyEdgeTypes } from "./nodeTypes";
import { useStore } from "@/store/useStore";

const stableNodeTypes = historyNodeTypes;
const stableEdgeTypes = historyEdgeTypes;

interface NodeExecution {
  id: string;
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  status: string;
  inputs: any;
  outputs: any;
  error?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
}

interface WorkflowRun {
  id: string;
  createdAt: string;
  status: string;
  scope: string;
  duration: number;
  executions: NodeExecution[];
  nodesSnapshot?: any;
  edges?: any;
}

export function HistorySidebar() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { isHistoryOpen, setHistoryOpen } = useStore();

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history/list");
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRuns(data);
      }
    } catch (error) {
      console.error("[History] Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Poll every 10s for a more "live" feeling as requested by user
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "running":
        return <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />;
      default:
        return <History className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredRuns = runs.filter((run) =>
    run.scope.toLowerCase().includes(searchQuery.toLowerCase()) ||
    run.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <aside 
        className={cn(
          "fixed top-0 right-0 bottom-0 z-40 w-80 bg-sidebar border-l border-border transition-transform duration-300 ease-in-out transform flex flex-col shadow-2xl overflow-hidden",
          isHistoryOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 border-b border-white/5 bg-[#0a0a0a] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium tracking-wide text-zinc-400">History</span>
            <div className="flex items-center gap-2">
               <button 
                 onClick={() => fetchHistory()} 
                 className="p-1.5 hover:bg-white/5 rounded-md text-zinc-400 hover:text-white transition-all"
                 title="Refresh Logs"
               >
                 <History className={cn("w-4 h-4", isLoading && "animate-spin")} />
               </button>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
            <Input
              placeholder="Filter history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#111] border-white/10 text-sm h-9 rounded-lg"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto wea-no-scrollbar p-2 pb-24">
          <div className="px-2 py-4 text-xs font-medium text-zinc-500">
            Execution History
          </div>
          
          <div className="space-y-2 px-2">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-white/20 italic">Loading logs...</div>
            ) : filteredRuns.length === 0 ? (
              <div className="p-4 text-center text-xs text-white/20 italic">No runs recorded yet</div>
            ) : (
              filteredRuns.map((run) => (
                <button
                  key={run.id}
                  onClick={() => setSelectedRun(run)}
                  className="w-full text-left p-3 rounded-xl bg-[#111] border border-white/5 hover:bg-[#1a1a1a] transition-all group flex flex-col gap-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(run.status)}
                      <span className="text-xs font-medium text-white/80 capitalize">
                        {run.scope} Run
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40">{run.duration?.toFixed(1) || "0.0"}s</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5 text-white/40">
                      <Clock className="w-3 h-3" />
                      {format(new Date(run.createdAt), "HH:mm:ss")}
                    </div>
                    <div className="flex items-center gap-1 text-white/40">
                       <Calendar className="w-3 h-3" />
                       {format(new Date(run.createdAt), "MMM d")}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Fixed "Node History" Bottom Right Corner functionality inside the sidebar */}
        {runs.length > 0 && (
          <div className="absolute bottom-6 right-6 z-50">
             <button
               onClick={() => setSelectedRun(runs[0])}
               className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-full font-medium text-xs shadow-xl hover:bg-zinc-200 transition-all"
             >
               <History className="w-4 h-4" />
               Latest Execution
             </button>
          </div>
        )}
      </aside>

      <RunDetailModal run={selectedRun} isOpen={!!selectedRun} onOpenChange={(open) => !open && setSelectedRun(null)} />
    </>
  );
}

function RunDetailModal({ run, isOpen, onOpenChange }: { run: any | null; isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Reconstruct nodes from snapshot and merge with execution results
  const historyNodes = useMemo(() => {
    if (!run) return [];
    let snapshot = run.nodesSnapshot;
    if (typeof snapshot === 'string') {
      try { snapshot = JSON.parse(snapshot); } catch (e) { snapshot = []; }
    }
    if (!Array.isArray(snapshot)) return [];
    
    return (snapshot as Node[]).map(node => {
      const execution = run.executions?.find((e: any) => e.nodeId === node.id);
      return {
        ...node,
        draggable: false, 
        selectable: true,
        data: {
          ...node.data,
          executionStatus: execution?.status || 'idle',
          executionResult: execution?.outputs || null,
          executionError: execution?.error || null,
          executionDuration: execution?.duration || 0,
          isReadOnly: true,
          // Store raw execution for the inspector
          executionRaw: execution 
        }
      };
    });
  }, [run]);

  const historyEdges = useMemo(() => {
    if (!run) return [];
    let edges = run.edges;
    if (typeof edges === 'string') {
      try { edges = JSON.parse(edges); } catch (e) { edges = []; }
    }
    return (edges || []) as Edge[];
  }, [run]);

  const selectedNode = useMemo(() => 
    historyNodes.find(n => n.id === selectedNodeId),
  [historyNodes, selectedNodeId]);

  if (!run) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="fixed inset-0 !top-0 !left-0 w-screen h-screen max-w-none max-h-none m-0 rounded-none border-none bg-[#0a0a0a] p-0 flex flex-col z-[1000] gap-0 overflow-hidden outline-none sm:!max-w-none sm:!max-h-none"
        aria-describedby={undefined}
      >
        <DialogDescription className="sr-only">
          Execution trace and node-level details for this workflow run.
        </DialogDescription>
        <DialogHeader className="p-4 px-6 border-b border-white/5 bg-[#0a0a0a] shrink-0 z-50 flex flex-row items-center justify-between gap-8 h-20">
           {/* Left Zone: Title & Context */}
           <div className="flex flex-col gap-1 min-w-0 flex-1">
              <DialogTitle className="text-xl font-medium tracking-tight whitespace-nowrap leading-none text-white">
                Execution Trace
              </DialogTitle>
              <div className="flex items-center gap-2 text-xs text-zinc-500 whitespace-nowrap mt-1">
                <div className="px-1.5 py-0.5 bg-white/5 rounded-md border border-white/5 shrink-0">
                  <span className="text-white/40">#{run.id.slice(-8)}</span>
                </div>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {format(new Date(run.createdAt), "HH:mm:ss")}
                </span>
                <span className="text-white px-2 py-0.5 bg-white/10 rounded-md">
                   {run.scope}
                </span>
              </div>
           </div>
           
           {/* Center Zone: Legend Pod */}
           <div className="hidden xl:flex items-center gap-5 px-6 py-2 bg-[#111] border border-white/5 rounded-full shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-300" />
                <span className="text-xs font-medium text-zinc-400">Success</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs font-medium text-red-400">Failed</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                <span className="text-xs font-medium text-white">Partial</span>
              </div>
           </div>

           {/* Right Zone: Actions */}
           <div className="flex items-center gap-4 shrink-0 flex-1 justify-end">
              <div className="hidden md:flex flex-col items-end gap-0 pr-4 border-r border-white/10">
                 <span className="text-[10px] text-zinc-500 font-medium">Duration</span>
                 <span className="text-sm text-white font-medium">{run.duration?.toFixed(2)}s</span>
              </div>
              <button 
                onClick={() => onOpenChange(false)}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-white/60 hover:text-white"
                aria-label="Close trace"
              >
                <span className="text-xl">✕</span>
              </button>
           </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Graph View */}
          <div className="flex-1 relative bg-[#0e0e13]/50 border-r border-white/5">
            <ReactFlowProvider>
                <ReactFlow
                  nodes={historyNodes}
                  edges={historyEdges}
                  nodeTypes={stableNodeTypes}
                  edgeTypes={stableEdgeTypes}
                 onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                 onPaneClick={() => setSelectedNodeId(null)}
                 onInit={(instance) => {
                   setTimeout(() => instance.fitView({ padding: 0.5, duration: 400 }), 100);
                 }}
                 fitView
                 fitViewOptions={{ padding: 0.5 }}
                 panOnScroll={true}
                 zoomOnScroll={true}
                 proOptions={{ hideAttribution: true }}
                 nodesConnectable={false}
                 nodesDraggable={false}
                 elementsSelectable={true}
                 className="history-graph-canvas"
               >
                 <Background 
                   variant={BackgroundVariant.Lines} 
                   color="rgba(255, 255, 255, 0.05)" 
                   gap={40} 
                   size={1}
                 />
               </ReactFlow>
            </ReactFlowProvider>

            {/* Tips for Navigation */}
            <div className="absolute bottom-6 left-6 z-50 pointer-events-none">
               <div className="bg-[#111] border border-white/10 p-3 rounded-xl flex flex-col gap-1.5 shadow-xl">
                  <div className="flex items-center gap-2 text-xs text-white/80 font-medium">
                     <div className="w-1.5 h-1.5 rounded-full bg-white" />
                     Interactive Trace Mode
                  </div>
                  <div className="text-[10px] text-white/40 font-medium">
                     Scroll back • Select Node to Inspect
                  </div>
               </div>
            </div>
          </div>

          {/* Node Inspector Side Panel */}
          <div className={cn(
            "w-96 bg-[#0a0a0a] border-l border-white/10 flex flex-col transition-all duration-300 overflow-hidden",
            selectedNodeId ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0 w-0"
          )}>
            {selectedNode ? (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                       {selectedNode.data.executionStatus === 'completed' ? (
                         <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                       ) : selectedNode.data.executionStatus === 'error' ? (
                         <XCircle className="w-4 h-4 text-red-500" />
                       ) : (
                         <AlertCircle className="w-4 h-4 text-white" />
                       )}
                       <h3 className="font-medium text-white text-sm">{selectedNode.data.label}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-white/60 font-mono text-xs">{selectedNode.data.executionDuration?.toFixed(2)}s</span>
                       <button onClick={() => setSelectedNodeId(null)} className="text-white/40 hover:text-white p-1 rounded-md hover:bg-white/10 ml-2 transition-colors">✕</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-400 capitalize">
                      {selectedNode.type?.replace('Node', '') || ''}
                    </span>
                    <span className={cn(
                      "text-xs font-medium capitalize",
                      selectedNode.data.executionStatus === 'completed' ? "text-zinc-400" : 
                      selectedNode.data.executionStatus === 'error' ? "text-red-400" : "text-white"
                    )}>
                      {selectedNode.data.executionStatus}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 wea-no-scrollbar">
                  {/* Inputs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-medium text-zinc-500 border-b border-white/5 pb-2">
                      <span>Inputs (Handoff)</span>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(selectedNode.data.executionRaw?.inputs || {}).map(([key, val]: [string, any]) => (
                        <div key={key} className="space-y-1.5">
                           <span className="text-xs text-white/60 capitalize">{key}</span>
                           <div className="text-xs p-3 bg-white/5 rounded-xl border border-white/5 text-white/80 font-mono leading-relaxed break-all">
                              {typeof val === 'string' && (val.startsWith('http') || val.startsWith('data:')) ? (
                                <div className="space-y-2">
                                   <div className="text-xs text-white/40 truncate mb-1">{val}</div>
                                   <img src={val} className="max-h-24 rounded-lg border border-white/10" alt="Input Preview" />
                                </div>
                              ) : (
                                <span>{String(val)}</span>
                              )}
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outputs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-medium text-zinc-500 border-b border-white/5 pb-2">
                      <span>Outputs (Handoff)</span>
                    </div>
                    {selectedNode.data.executionError ? (
                       <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-medium leading-relaxed font-mono">
                         {selectedNode.data.executionError}
                       </div>
                    ) : (
                       <div className="space-y-3">
                         {Object.entries(selectedNode.data.executionResult || {}).map(([key, val]: [string, any]) => (
                           <div key={key} className="space-y-1.5">
                              <span className="text-xs text-white/60 capitalize">{key}</span>
                              <div className="text-xs p-3 bg-white/5 rounded-xl border border-white/10 text-white font-mono leading-relaxed break-all">
                                 {typeof val === 'string' && (val.includes('.com') || val.includes('.net') || val.includes('http')) ? (
                                   <div className="space-y-2">
                                      <div className="text-[9px] text-white/40 truncate mb-1">{val}</div>
                                      <a href={val} target="_blank" rel="noreferrer" className="text-xs text-white underline flex items-center gap-1 hover:text-white/80">
                                         Open asset source ↗
                                      </a>
                                   </div>
                                 ) : (
                                   <span>{String(val)}</span>
                                 )}
                              </div>
                           </div>
                         ))}
                       </div>
                    )}
                  </div>

                  {/* Visual Preview for Media Nodes */}
                  {(selectedNode.data.executionResult?.imageUrl || selectedNode.data.executionResult?.croppedImageUrl || selectedNode.data.executionResult?.frameUrl) && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-zinc-500">Asset Preview</div>
                      <div className="aspect-video relative rounded-xl overflow-hidden border border-white/10 bg-black/40 group/preview">
                         <img 
                           src={selectedNode.data.executionResult.imageUrl || selectedNode.data.executionResult.croppedImageUrl || selectedNode.data.executionResult.frameUrl} 
                           alt="Execution Result" 
                           className="object-contain w-full h-full" 
                         />
                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                            <a 
                              href={selectedNode.data.executionResult.imageUrl || selectedNode.data.executionResult.croppedImageUrl || selectedNode.data.executionResult.frameUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-4 py-2 bg-white text-black text-xs font-medium rounded-full cursor-pointer hover:bg-zinc-200"
                            >
                              View Full Asset
                            </a>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm px-12 text-center leading-loose">
                Select a node to inspect its execution trace
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
