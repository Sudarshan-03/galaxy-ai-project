"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useStore } from "@/store/useStore";
import { NodeWrapper } from "./NodeWrapper";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Save, Unlock, FileText } from "lucide-react";
import { isValidHandleConnection } from "@/lib/validationUtils";

const TextNode = (props: NodeProps) => {
  const { id, data, selected } = props;
  const { updateNodeData, nodes, edges } = useStore();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.stopPropagation();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { text: e.target.value });
  };

  const isOutputMode = edges.some(e => e.target === id && e.targetHandle === 'text_input');

  const toggleSave = () => {
    const nextSavedState = !data.isSaved;
    updateNodeData(id, { 
      isSaved: nextSavedState,
      isReady: nextSavedState && !!data.text
    });
  };

  const theme = { bg: 'bg-[#0e0e13]', stroke: 'border-white/10' };

  const extraMenuItems = (
    <DropdownMenuItem 
      onClick={toggleSave}
      disabled={isOutputMode}
      className="text-[12px] py-2 focus:bg-[#e2ff46]/10 focus:text-[#e2ff46] cursor-pointer rounded-sm disabled:opacity-50"
    >
      {data.isSaved ? (
        <>
          <Unlock className="mr-2 h-3.5 w-3.5 opacity-70" />
          <span>Unsave Content</span>
        </>
      ) : (
        <>
          <Save className="mr-2 h-3.5 w-3.5 opacity-70" />
          <span>Save Content</span>
        </>
      )}
    </DropdownMenuItem>
  );

  return (
    <NodeWrapper {...props} theme={theme} extraMenuItems={extraMenuItems}>
      <div className="space-y-2">
        <label className="text-[9px] text-white/50 uppercase font-mono flex items-center gap-1.5 font-bold tracking-wider">
           <FileText className={`w-3 h-3 ${isOutputMode ? 'text-purple-400' : (data.isSaved ? 'text-[#e2ff46]' : 'text-white/30')}`} />
           {isOutputMode ? "OUTPUT DISPLAY" : (data.isSaved ? "LOCKED PROTOCOL" : "MANUAL INPUT")}
        </label>
        {isOutputMode ? (
          <div className="w-full bg-[#050508] border border-purple-500/30 rounded-sm p-2 text-[11px] font-mono text-white/80 overflow-y-auto h-24 custom-scrollbar whitespace-pre-wrap">
             {data.executionResult?.text || "Waiting for incoming data..."}
          </div>
        ) : (
          <textarea
            value={data.text || ""}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={data.isSaved}
            placeholder="Enter text contents..."
            className={`w-full bg-black/40 border rounded-sm p-2 text-[11px] font-mono outline-none transition-all resize-none custom-scrollbar ${
              data.isSaved 
                ? 'border-[#e2ff46]/20 text-white/40 cursor-not-allowed bg-[#050508]' 
                : 'border-white/5 text-white/80 focus:border-white/20'
            }`}
            rows={4}
          />
        )}
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        id="text_input"
        style={{ left: -32 }}
        isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
        className="w-3 h-3 rounded-full border border-black shadow-md transition-all bg-[#1a1a1f] border-white/40"
      />
      
      <Handle
        type="source"
        position={Position.Right}
        id="text_output"
        style={{ right: -32 }}
        isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
        className={`w-3 h-3 rounded-full border border-black shadow-md transition-all ${
          data.isSaved ? 'bg-[#e2ff46] shadow-[0_0_10px_#e2ff4666]' : 'bg-[#1a1a1f] border-white/40'
        }`}
      />
    </NodeWrapper>
  );
};

export default memo(TextNode);
