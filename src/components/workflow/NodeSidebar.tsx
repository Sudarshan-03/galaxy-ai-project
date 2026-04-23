"use client";

import React, { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import {
  Search,
  Type,
  Image as ImageIcon,
  Video,
  Crop,
  Film,
  Cpu,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useGraphExecution } from "@/hooks/useGraphExecution";

const nodeTypes = [
  { type: "textNode", label: "Text Node", icon: Type },
  { type: "imageNode", label: "Upload Image Node", icon: ImageIcon },
  { type: "videoNode", label: "Upload Video Node", icon: Video },
  { type: "llmNode", label: "Run Any LLM Node", icon: Cpu },
  { type: "imageGenNode", label: "Generate Image Node", icon: Sparkles },
  { type: "cropNode", label: "Crop Image Node", icon: Crop },
  { type: "frameNode", label: "Extract Frame Node", icon: Film },
];

export function NodeSidebar() {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNodes, setFilteredNodes] = useState(nodeTypes);

  const { nodes, resetExecution } = useStore();
  const { executeGraph } = useGraphExecution();
  const selectedNodesCount = nodes.filter(n => n.selected).length;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!searchQuery.trim()) {
        setFilteredNodes(nodeTypes);
      } else {
        const lowerQuery = searchQuery.toLowerCase();
        setFilteredNodes(
          nodeTypes.filter((node) => 
            node.label.toLowerCase().startsWith(lowerQuery)
          )
        );
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-border bg-sidebar transition-all duration-300">
      <SidebarHeader className="p-4 gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white tracking-wide">Workflow</span>
          <button 
            onClick={() => toggleSidebar()}
            className="p-1 hover:bg-white/10 rounded-md transition-colors text-zinc-400 hover:text-white"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
          <Input 
            placeholder="Search nodes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#111] border-white/10 text-sm h-9 rounded-lg focus-visible:ring-1 focus-visible:ring-white/30" 
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="wea-no-scrollbar">
        <SidebarGroup>
          <div className="px-4 space-y-2 mb-6">
            <button
              onClick={executeGraph}
              disabled={selectedNodesCount === 0}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                selectedNodesCount > 0 
                  ? 'bg-white text-black hover:bg-zinc-200 shadow-xl' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              Run Selected ({selectedNodesCount})
            </button>
            <button
              onClick={() => resetExecution()}
              className="w-full flex items-center justify-center gap-2 py-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg text-xs transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Execution
            </button>
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-medium text-zinc-500 mb-2">
            Blocks
          </SidebarGroupLabel>
          <div className="px-4 grid grid-cols-2 gap-2">
            {filteredNodes.map((node) => (
              <div
                key={node.type}
                draggable
                onDragStart={(event) => onDragStart(event, node.type)}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-[#111] border border-white/5 rounded-xl cursor-grab active:cursor-grabbing hover:bg-white/10 hover:border-white/10 transition-all aspect-square"
                title={node.label}
              >
                <node.icon className="h-6 w-6 text-zinc-400" />
                <span className="text-xs text-center font-medium leading-tight text-white">{node.label}</span>
              </div>
            ))}
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
