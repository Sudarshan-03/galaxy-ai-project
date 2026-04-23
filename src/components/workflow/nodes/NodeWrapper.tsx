"use client";

import React, { useState } from "react";
import { NodeProps } from "reactflow";
import { useStore } from "@/store/useStore";
import { NodeContextMenu } from "../NodeContextMenu";
import { MoreHorizontal, Copy, Type, Lock, Unlock, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RenameNodeDialog } from "../RenameNodeDialog";
import { cn } from "@/lib/utils";

interface NodeWrapperProps extends NodeProps {
  children: React.ReactNode;
  theme: { bg: string, stroke: string };
  minWidth?: string;
  className?: string;
  extraMenuItems?: React.ReactNode;
}

export const NodeWrapper = ({ 
  id, 
  data, 
  selected, 
  dragging, 
  children, 
  theme, 
  minWidth = "240px",
  className = "",
  extraMenuItems
}: NodeWrapperProps) => {
  const { duplicateNode, updateNodeLabel, toggleNodeLock, onNodesChange } = useStore();
  const isDraggable = useStore((s) => s.nodes.find((n) => n.id === id)?.draggable);
  const [isRenameOpen, setIsRenameOpen] = useState(false);

  const handleRename = (newName: string) => {
    updateNodeLabel(id, newName);
  };

  return (
    <>
      <NodeContextMenu nodeId={id}>
        <div
          className={cn(
            "rounded-2xl border text-white shadow-xl transition-all",
            theme.bg,
            theme.stroke,
            selected && "ring-1 ring-white/30",
            data.executionStatus === "running" && "node-executing",
            data.executionStatus === "completed" && "node-completed",
            data.executionStatus === "error" && "node-error",
            dragging && "opacity-50",
            className
          )}
          style={{ minWidth }}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-white/5 px-4 py-3 border-b border-white/5 rounded-t-[inherit]">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate max-w-[150px]">{data.label}</span>
              {data.executionStatus && data.executionStatus !== 'idle' && (
                <div className="flex items-center gap-2 mt-1">
                   <div className={cn(
                     "w-1.5 h-1.5 rounded-full shrink-0",
                     data.executionStatus === 'completed' ? "bg-zinc-300" : 
                     data.executionStatus === 'running' ? "bg-white animate-pulse" : 
                     "bg-red-500"
                   )} />
                   <span className={cn(
                     "text-[10px] font-medium capitalize",
                     data.executionStatus === 'completed' ? "text-zinc-400" : 
                     data.executionStatus === 'running' ? "text-white" : 
                     "text-red-400"
                   )}>
                     {data.executionStatus}
                   </span>
                   {data.executionDuration > 0 && (
                     <span className="text-[10px] text-white/40 ml-auto whitespace-nowrap">{data.executionDuration.toFixed(2)}s</span>
                   )}
                </div>
              )}
            </div>
            
            {!data.isReadOnly && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-white/40 hover:text-white transition-colors p-0.5 rounded-sm hover:bg-white/10 outline-none">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end"
                  className="w-48 glass-blur border-white/10 bg-[#121212]/95 text-white/90 p-1 rounded-xl shadow-xl"
                >
                  <DropdownMenuItem 
                    onClick={() => duplicateNode(id)}
                    className="text-[12px] py-2 focus:bg-white/10 focus:text-white cursor-pointer rounded-sm"
                  >
                    <Copy className="mr-2 h-3.5 w-3.5 opacity-70" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setIsRenameOpen(true)}
                    className="text-[12px] py-2 focus:bg-white/10 focus:text-white cursor-pointer rounded-sm"
                  >
                    <Type className="mr-2 h-3.5 w-3.5 opacity-70" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => toggleNodeLock(id)}
                    className="text-[12px] py-2 focus:bg-white/10 focus:text-white cursor-pointer rounded-sm"
                  >
                    {isDraggable === false ? (
                      <>
                        <Unlock className="mr-2 h-3.5 w-3.5 opacity-70" />
                        <span>Unlock</span>
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-3.5 w-3.5 opacity-70" />
                        <span>Lock</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  {extraMenuItems && (
                    <>
                      <DropdownMenuSeparator className="bg-white/5 my-1" />
                      {extraMenuItems}
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-white/5 my-1" />
                  <DropdownMenuItem 
                    onClick={() => onNodesChange([{ type: 'remove', id }])}
                    className="text-[12px] py-2 focus:bg-white/10 focus:text-white cursor-pointer rounded-sm text-red-400 focus:text-red-300"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5 opacity-70" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-3">
            {children}
          </div>
        </div>
      </NodeContextMenu>

      <RenameNodeDialog 
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        onRename={handleRename}
        currentName={data.label}
      />
    </>
  );
};
