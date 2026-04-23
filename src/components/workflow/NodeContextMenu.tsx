"use client";

import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";
import { useStore } from "@/store/useStore";
import { Copy, Type, Lock, Trash2 } from "lucide-react";

interface NodeContextMenuProps {
  children: React.ReactNode;
  nodeId: string;
}

export function NodeContextMenu({ children, nodeId }: NodeContextMenuProps) {
  const { duplicateNode, updateNodeLabel, toggleNodeLock } = useStore();

  const handleRename = () => {
    const newName = prompt("Enter new name for the node:");
    if (newName) {
      updateNodeLabel(nodeId, newName);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent 
        className="w-56 glass-blur border-white/10 bg-[#1a1a1f]/95 text-white/90 p-1 rounded-[5px]"
      >
        <ContextMenuItem 
          onClick={() => duplicateNode(nodeId)}
          className="text-[12px] py-2 focus:bg-white/10 focus:text-white cursor-pointer rounded-sm"
        >
          <Copy className="mr-2 h-3.5 w-3.5" />
          <span>Duplicate</span>
          <ContextMenuShortcut className="text-[10px] opacity-40">ctrl+d</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={handleRename}
          className="text-[12px] py-2 focus:bg-white/10 focus:text-white cursor-pointer rounded-sm"
        >
          <Type className="mr-2 h-3.5 w-3.5" />
          <span>Rename</span>
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => toggleNodeLock(nodeId)}
          className="text-[12px] py-2 focus:bg-white/10 focus:text-white cursor-pointer rounded-sm"
        >
          <Lock className="mr-2 h-3.5 w-3.5" />
          <span>Lock</span>
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/5 my-1" />
        <ContextMenuItem 
          onClick={() => {
            const { nodes, onNodesChange } = useStore.getState();
            onNodesChange([{ type: 'remove', id: nodeId }]);
          }}
          className="text-[12px] py-2 focus:bg-white/10 focus:text-white cursor-pointer rounded-sm text-red-400 focus:text-red-300"
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          <span>Delete</span>
          <ContextMenuShortcut className="text-[10px] opacity-40 ml-4">delete / backspace</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
