import React, { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useStore } from "@/store/useStore";
import { NodeWrapper } from "./NodeWrapper";
import { Brain, Play, Loader2, MessageSquare, ShieldCheck, Image as ImageIcon, ChevronDown, Check } from "lucide-react";
import { useIsHandleConnected } from "@/hooks/useIsHandleConnected";
import { useConnectedData, useMultiConnectedData } from "@/hooks/useConnectedData";
import { isValidHandleConnection } from "@/lib/validationUtils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const LLMNode = (props: NodeProps) => {
  const { id, data } = props;
  const { updateNodeData, nodes } = useStore();
  
  const isProcessing = data.executionStatus === 'running';
  const isWaiting = data.executionStatus === 'waiting';
  const hasOutput = !!(data.responseText || data.executionResult?.responseText);
  const edges = useStore(s => s.edges);

  const [selectedModel, setSelectedModel] = useState(data.model || "gemini-2.5-flash");

  // Data Propagation
  const connectedSystemPrompt = useConnectedData(id, 'system_prompt');
  const connectedUserMessage = useConnectedData(id, 'user_message');
  const connectedImages = useMultiConnectedData(id, 'image_input');

  const isSystemConnected = useIsHandleConnected(id, 'system_prompt', 'target');
  const isUserConnected = useIsHandleConnected(id, 'user_message', 'target');
  const isImageConnected = useIsHandleConnected(id, 'image_input', 'target');

  const theme = { bg: 'bg-[#0e0e13]', stroke: 'border-white/10' };

  const models = [
    { id: "gemini-3-flash-preview", label: "Gemini 3 Flash", status: "working", group: "GEMINI 3" },
    { id: "gemini-3-pro-preview", label: "Gemini 3 Pro", status: "in progress", group: "GEMINI 3" },
    { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", status: "working", group: "GEMINI 2.5" },
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", status: "working", group: "GEMINI 2.5" },
    { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", status: "in progress", group: "GEMINI 2.5" },
    { id: "gemini-2.5-flash-tts", label: "Gemini 2.5 Flash TTS", status: "working", group: "MULTIMODAL" },
    { id: "gemini-2.5-flash-native-audio-dialog", label: "Gemini 2.5 Live", status: "working", group: "MULTIMODAL" },
    { id: "gemma-3-27b", label: "Gemma 3 27B", status: "working", group: "RESEARCH" },
    { id: "gemma-3-12b", label: "Gemma 3 12B", status: "working", group: "RESEARCH" },
    { id: "gemma-3-4b", label: "Gemma 3 4B", status: "working", group: "RESEARCH" },
    { id: "gemma-3-1b", label: "Gemma 3 1B", status: "working", group: "RESEARCH" },
    { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", status: "in progress", group: "LEGACY" },
  ];

  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <NodeWrapper {...props} theme={theme} minWidth="340px" className={`${isProcessing ? "node-executing px-4 pb-4 pt-1" : "relative px-4 pb-4 pt-1"} ${isWaiting ? "opacity-60" : ""}`}>
      <div className="w-full h-40 rounded-sm border border-white/5 bg-black/40 flex flex-col p-3 overflow-hidden mt-2 relative group/output">
        <div className="flex items-center gap-1.5 mb-2 opacity-40 group-hover/output:opacity-70 transition-opacity">
            <Brain className={`w-3.5 h-3.5 ${hasOutput ? 'text-[#e2ff46]' : 'text-white/40'}`} />
            <span className="text-[10px] font-mono uppercase tracking-tighter">
              {isWaiting ? "QUEUEING TOKENS..." : (hasOutput ? "AI RESPONSE" : "AWAITING INFERENCE")}
            </span>
        </div>
        <div className="flex-1 overflow-y-auto text-[11px] font-mono leading-relaxed text-white/80 custom-scrollbar pr-2 whitespace-pre-wrap font-medium">
          {isWaiting 
            ? "Waiting for upstream nodes to complete..." 
            : (data.executionResult?.responseText || data.responseText || (isProcessing ? "Processing tokens..." : "Awaiting input flow..."))
          }
        </div>
        {(isProcessing || isWaiting) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
            {isProcessing ? (
               <Loader2 className="w-6 h-6 animate-spin text-[#e2ff46]" />
            ) : (
               <div className="flex flex-col items-center gap-2">
                 <Loader2 className="w-4 h-4 animate-pulse text-white/20" />
                 <span className="text-[8px] font-mono text-white/40 animate-pulse uppercase tracking-widest">Pending Upstream</span>
               </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-[9px] text-white/50 uppercase font-mono tracking-wider pl-1 font-bold">Inference Engine</label>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button disabled={isProcessing || isWaiting} className="w-full flex items-center justify-between bg-[#1a1a1f] border border-white/10 rounded-sm p-2 text-xs font-mono outline-none hover:border-[#e2ff46]/30 transition-all text-white/90 disabled:opacity-50">
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${currentModel.status === 'working' ? 'bg-[#e2ff46]' : 'bg-orange-500'}`} />
                  {currentModel.label} <span className="text-white/30 text-[9px]">({currentModel.status})</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-40" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content className="z-[1000] min-w-[280px] bg-[#1a1a1f] border border-white/10 rounded-sm p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-100 font-mono" sideOffset={5}>
                {["GEMINI 3", "GEMINI 2.5", "MULTIMODAL", "RESEARCH", "LEGACY"].map((group) => (
                  <React.Fragment key={group}>
                    <div className="px-2 py-1.5 text-[8px] text-white/20 uppercase tracking-widest border-b border-white/5 mb-1 mt-1 font-bold">
                      {group}
                    </div>
                    {models.filter(m => m.group === group).map((m) => (
                      <DropdownMenu.Item 
                        key={m.id}
                        onSelect={() => { setSelectedModel(m.id); updateNodeData(id, { model: m.id }); }}
                        className="flex items-center justify-between px-2 py-2 text-[11px] text-white/70 hover:bg-[#e2ff46]/10 hover:text-white outline-none cursor-pointer rounded-sm group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                           <span className={`w-1 h-1 rounded-full ${m.status === 'working' ? 'bg-[#e2ff46]' : 'bg-orange-500 animate-pulse'}`} />
                           {m.label}
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={`text-[9px] opacity-30 group-hover:opacity-60`}>({m.status})</span>
                           {selectedModel === m.id && <Check className="w-3 h-3 text-[#e2ff46]" />}
                        </div>
                      </DropdownMenu.Item>
                    ))}
                  </React.Fragment>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        <div className="space-y-2.5">
          <div className="relative">
            <Handle type="target" position={Position.Left} id="system_prompt" style={{ left: -36, top: '50%', zIndex: 50 }}
              isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
              className={`w-2.5 h-2.5 border border-white/60 rounded-full ${isSystemConnected ? 'bg-[#e2ff46] shadow-[0_0_8px_#e2ff4666]' : 'bg-white/10'}`} />
            <div className={`flex items-center gap-2 w-full p-2 bg-[#1a1a1f]/50 border rounded-sm border-white/5 ${isSystemConnected ? 'border-[#e2ff46]/20' : ''}`}>
                <ShieldCheck className={`w-3.5 h-3.5 ${isSystemConnected ? 'text-[#e2ff46]' : 'text-white/20'}`} />
                <span className={`text-[10px] font-mono truncate ${isSystemConnected ? 'text-white/90' : 'text-white/30'}`}>
                    {isSystemConnected ? (connectedSystemPrompt ? "SYSTEM PROTOCOL ACTIVE" : "UPSTREAM STRING ATTACHED") : "SYSTEM PROMPT (OPTIONAL)"}
                </span>
            </div>
          </div>

          <div className="relative">
            <Handle type="target" position={Position.Left} id="user_message" style={{ left: -36, top: '50%', zIndex: 50 }}
              isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
              className={`w-3 h-3 border border-white/60 rounded-full ${isUserConnected ? 'bg-[#e2ff46] shadow-[0_0_10px_#e2ff4688]' : 'bg-white/20 animate-pulse'}`} />
            <div className={`flex items-center gap-2 w-full p-2 bg-[#1a1a1f]/50 border rounded-sm ${isUserConnected ? 'border-[#e2ff46]/30 bg-[#0e0e13]' : 'border-dashed border-white/10'}`}>
                <MessageSquare className={`w-3.5 h-3.5 ${isUserConnected ? 'text-[#e2ff46]' : 'text-white/20'}`} />
                <span className={`text-[10px] font-mono truncate font-medium ${isUserConnected ? (connectedUserMessage ? 'text-white' : 'text-white/60') : 'text-white/30 italic'}`}>
                    {isUserConnected ? (connectedUserMessage ? "USER MESSAGE ACTIVE" : "UPSTREAM INPUT PENDING") : "CONNECT USER MESSAGE"}
                </span>
            </div>
          </div>

          <div className="relative">
            <Handle type="target" position={Position.Left} id="image_input" style={{ left: -36, top: '15px', zIndex: 50 }}
              isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
              className={`w-2.5 h-2.5 border border-white/60 rounded-full ${isImageConnected ? 'bg-[#e2ff46] shadow-[0_0_8px_#e2ff4666]' : 'bg-white/10'}`} />
            
            <div className={`flex items-center justify-between gap-2 w-full p-2 bg-[#1a1a1f]/50 border rounded-sm border-white/5 ${isImageConnected ? 'border-[#e2ff46]/20' : ''}`}>
               <div className="flex items-center gap-2 truncate">
                  <ImageIcon className={`w-3.5 h-3.5 ${isImageConnected ? 'text-[#e2ff46]' : 'text-white/20'}`} />
                  <span className={`text-[10px] font-mono truncate ${isImageConnected ? 'text-white/90' : 'text-white/30'}`}>
                      {isImageConnected ? `${connectedImages.length} SOURCE STREAM(S)` : "VISION INPUT"}
                  </span>
               </div>
            </div>
            
            {connectedImages.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2 bg-white/5 p-2 rounded-sm border border-white/5 max-h-[120px] overflow-y-auto custom-scrollbar">
                 {connectedImages.map((url, idx) => (
                    <div key={idx} className="aspect-square rounded-sm overflow-hidden border border-white/10 bg-black/40 relative group/img">
                       <img src={url} className="w-full h-full object-cover" alt={`Context ${idx}`} />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[8px] font-mono text-[#e2ff46]">PART {idx + 1}</span>
                       </div>
                    </div>
                 ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 pb-1 border-t border-white/5 mt-2">
          <div className="flex flex-col gap-0.5">
             <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">inference layer</div>
             {connectedImages.length > 0 && (
               <div className="text-[7px] font-mono text-[#e2ff46]/40 uppercase tracking-widest">multimodal: {connectedImages.length} images</div>
             )}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="output" style={{ top: '50%', right: -32, zIndex: 50 }}
        isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
        className={`w-3.5 h-3.5 border border-black rounded-full transition-all hover:scale-125 ${
          hasOutput 
            ? 'bg-[#e2ff46] shadow-[0_0_12px_#e2ff4699]' 
            : 'bg-transparent border-white/20 border-2'
        }`} />
    </NodeWrapper>
  );
};

export default memo(LLMNode);
