"use client";

import React, { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useStore } from "@/store/useStore";
import { NodeWrapper } from "./NodeWrapper";
import {
  Sparkles,
  Loader2,
  ChevronDown,
  Check,
  Image as ImageIcon,
  Wand2,
} from "lucide-react";
import { useIsHandleConnected } from "@/hooks/useIsHandleConnected";
import { useConnectedData } from "@/hooks/useConnectedData";
import { isValidHandleConnection } from "@/lib/validationUtils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"] as const;
type AspectRatio = (typeof ASPECT_RATIOS)[number];

const MODELS = [
  { id: "imagen-3.0-generate-002", label: "Imagen 3", status: "stable" },
  { id: "imagen-3.0-fast-generate-001", label: "Imagen 3 Fast", status: "stable" },
];

const CHECKERBOARD = {
  backgroundImage: `repeating-conic-gradient(#1a1a1f 0% 25%, #111116 25% 50%, #1a1a1f 50% 75%, #111116 75% 100%)`,
  backgroundSize: "16px 16px",
};

const ImageGenNode = (props: NodeProps) => {
  const { id, data } = props;
  const { updateNodeData, nodes, edges } = useStore();

  const isProcessing = data.executionStatus === "running";
  const isWaiting = data.executionStatus === "waiting";
  const hasOutput = !!(data.executionResult?.imageUrl);

  const [selectedModel, setSelectedModel] = useState(data.model || "imagen-3.0-generate-002");
  const [selectedAspect, setSelectedAspect] = useState<AspectRatio>(data.aspectRatio || "1:1");

  const isPromptConnected = useIsHandleConnected(id, "prompt_input", "target");
  const connectedPrompt = useConnectedData(id, "prompt_input");

  const currentModel = MODELS.find((m) => m.id === selectedModel) || MODELS[0];

  const theme = { bg: "bg-[#0a0a10]", stroke: "border-violet-500/20" };

  const outputImageUrl = data.executionResult?.imageUrl;

  return (
    <NodeWrapper {...props} theme={theme} minWidth="340px" className={`${isWaiting ? "opacity-60" : ""}`}>
      {/* Output Image Preview */}
      <div
        className="w-full rounded-sm border border-white/5 overflow-hidden relative group/preview"
        style={{ aspectRatio: selectedAspect.replace(":", "/"), ...CHECKERBOARD }}
      >
        {isWaiting ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-pulse text-white/20" />
            <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">
              Pending Upstream
            </span>
          </div>
        ) : isProcessing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40">
            <div className="relative">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              <Sparkles className="w-3.5 h-3.5 text-violet-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <span className="text-[10px] font-mono text-violet-300/70 uppercase tracking-widest animate-pulse">
              Generating Image...
            </span>
          </div>
        ) : hasOutput ? (
          <>
            <img
              src={outputImageUrl}
              alt="Generated"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity">
              <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1">
                <span className="text-[9px] font-mono text-white/60 bg-black/50 px-1.5 py-0.5 rounded-sm">
                  {selectedAspect} · {currentModel.label}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-30">
            <ImageIcon className="w-8 h-8 text-violet-400" />
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
              Awaiting Generation
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-3">
        {/* Prompt Input Handle */}
        <div className="relative">
          <Handle
            type="target"
            position={Position.Left}
            id="prompt_input"
            style={{ left: -36, top: "50%", zIndex: 50 }}
            isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
            className={`w-3 h-3 border border-white/60 rounded-full ${
              isPromptConnected
                ? "bg-violet-400 shadow-[0_0_10px_#a78bfa88]"
                : "bg-white/20 animate-pulse"
            }`}
          />
          <div
            className={`flex items-center gap-2 w-full p-2 bg-[#1a1a1f]/50 border rounded-sm ${
              isPromptConnected ? "border-violet-500/30 bg-[#0e0e13]" : "border-dashed border-white/10"
            }`}
          >
            <Wand2
              className={`w-3.5 h-3.5 shrink-0 ${
                isPromptConnected ? "text-violet-400" : "text-white/20"
              }`}
            />
            <span
              className={`text-[10px] font-mono truncate font-medium ${
                isPromptConnected
                  ? connectedPrompt
                    ? "text-white"
                    : "text-white/60"
                  : "text-white/30 italic"
              }`}
            >
              {isPromptConnected
                ? connectedPrompt
                  ? "PROMPT ACTIVE"
                  : "UPSTREAM PROMPT PENDING"
                : "CONNECT PROMPT (LLM → HERE)"}
            </span>
          </div>
        </div>

        {/* Manual Prompt Fallback */}
        {!isPromptConnected && (
          <div className="space-y-1">
            <label className="text-[9px] text-white/40 uppercase font-mono tracking-wider pl-1">
              Manual Prompt
            </label>
            <textarea
              value={data.manualPrompt || ""}
              onChange={(e) => updateNodeData(id, { manualPrompt: e.target.value })}
              disabled={isProcessing || isWaiting}
              placeholder="Describe the image you want to generate..."
              className="w-full h-16 bg-[#1a1a1f] border border-white/10 rounded-sm p-2 text-[11px] font-mono text-white/80 placeholder:text-white/20 resize-none outline-none focus:border-violet-500/40 transition-colors disabled:opacity-40 custom-scrollbar"
            />
          </div>
        )}

        {/* Model Selector */}
        <div className="space-y-1">
          <label className="text-[9px] text-white/50 uppercase font-mono tracking-wider pl-1 font-bold">
            Image Model
          </label>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                disabled={isProcessing || isWaiting}
                className="w-full flex items-center justify-between bg-[#1a1a1f] border border-white/10 rounded-sm p-2 text-xs font-mono outline-none hover:border-violet-500/30 transition-all text-white/90 disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  {currentModel.label}
                  <span className="text-white/30 text-[9px]">({currentModel.status})</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-40" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-[1000] min-w-[240px] bg-[#1a1a1f] border border-white/10 rounded-sm p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-100 font-mono"
                sideOffset={5}
              >
                {MODELS.map((m) => (
                  <DropdownMenu.Item
                    key={m.id}
                    onSelect={() => {
                      setSelectedModel(m.id);
                      updateNodeData(id, { model: m.id });
                    }}
                    className="flex items-center justify-between px-2 py-2 text-[11px] text-white/70 hover:bg-violet-500/10 hover:text-white outline-none cursor-pointer rounded-sm group transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-violet-400" />
                      {m.label}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] opacity-30 group-hover:opacity-60">
                        ({m.status})
                      </span>
                      {selectedModel === m.id && (
                        <Check className="w-3 h-3 text-violet-400" />
                      )}
                    </div>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="space-y-1">
          <label className="text-[9px] text-white/50 uppercase font-mono tracking-wider pl-1 font-bold">
            Aspect Ratio
          </label>
          <div className="flex gap-1 flex-wrap">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio}
                disabled={isProcessing || isWaiting}
                onClick={() => {
                  setSelectedAspect(ratio);
                  updateNodeData(id, { aspectRatio: ratio });
                }}
                className={`px-2 py-1 text-[9px] font-mono rounded-sm border transition-all disabled:opacity-40 ${
                  selectedAspect === ratio
                    ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                    : "bg-[#1a1a1f] border-white/10 text-white/40 hover:border-white/20 hover:text-white/70"
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 pb-1 border-t border-white/5">
          <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">
            imagen · generative layer
          </div>
          {hasOutput && (
            <a
              href={outputImageUrl}
              download="generated-image.png"
              className="text-[8px] font-mono text-violet-400/60 hover:text-violet-300 transition-colors uppercase tracking-wider"
              onClick={(e) => e.stopPropagation()}
            >
              ↓ Save
            </a>
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="image_url"
        style={{ top: "30%", right: -32, zIndex: 50 }}
        isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
        className={`w-3.5 h-3.5 border border-black rounded-full transition-all hover:scale-125 ${
          hasOutput
            ? "bg-violet-400 shadow-[0_0_12px_#a78bfa99]"
            : "bg-transparent border-white/20 border-2"
        }`}
      />
    </NodeWrapper>
  );
};

export default memo(ImageGenNode);
