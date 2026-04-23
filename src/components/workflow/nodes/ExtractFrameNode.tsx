import React, { memo, useState, useEffect } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useStore } from "@/store/useStore";
import { NodeWrapper } from "./NodeWrapper";
import { Film, Play, Loader2, Image as ImageIcon } from "lucide-react";
import { useIsHandleConnected } from "@/hooks/useIsHandleConnected";
import { useConnectedData } from "@/hooks/useConnectedData";
import { isValidHandleConnection } from "@/lib/validationUtils";

const ExtractFrameNode = (props: NodeProps) => {
  const { id, data } = props;
  const { updateNodeData, nodes, edges } = useStore();

  const isProcessing = data.executionStatus === 'running';

  // Local state for HMR stability
  const [localTimestamp, setLocalTimestamp] = useState(data.timestamp || "0.0");

  // Data Propagation
  const connectedVideoUrl = useConnectedData(id, 'video_url');
  const connectedTimestamp = useConnectedData(id, 'timestamp');

  useEffect(() => {
    setLocalTimestamp(data.timestamp || "0.0");
  }, [data.timestamp]);

  const isVideoConnected = useIsHandleConnected(id, 'video_url', 'target');
  const isTimestampConnected = useIsHandleConnected(id, 'timestamp', 'target');

  const syncToStore = (field: string, value: string) => {
    updateNodeData(id, { [field]: value });
  };

  const theme = { bg: 'bg-[#0e0e13]', stroke: 'border-white/10' };

  return (
    <NodeWrapper {...props} theme={theme} minWidth="280px" className={isProcessing ? "node-executing" : "relative"}>
      {/* Media Preview Container */}
      <div className="media-checkerboard w-full h-32 rounded-sm border border-white/5 border-dashed flex items-center justify-center relative overflow-hidden bg-black/20">
        {(data.executionResult?.frameUrl || data.frameUrl) ? (
          <img src={data.executionResult?.frameUrl || data.frameUrl} alt="Extracted Frame" className="w-full h-full object-cover" />
        ) : (connectedVideoUrl || data.videoUrl) ? (
          <div className="flex flex-col items-center gap-1 opacity-60">
            <Film className="w-6 h-6 text-[#e2ff46]" />
            <span className="text-[9px] font-mono text-white/50 uppercase">Video Attached</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-20">
            <ImageIcon className="w-6 h-6" />
            <span className="text-[9px] font-mono uppercase">Preview</span>
          </div>
        )}
        
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#e2ff46]" />
          </div>
        )}

        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] text-white/40 font-mono pointer-events-none uppercase">URL</span>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="video_url"
        style={{ left: -28, top: '100px', zIndex: 50 }}
        isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
        className="w-3 h-3 bg-[#1a1a1f] border border-white/60 rounded-full"
      />

      <div className="mt-3 space-y-3 px-1">
        {/* Timestamp Input */}
        <div className="space-y-1 relative">
            <div className="flex justify-between items-center pr-1">
                <label className="text-[9px] text-white/50 uppercase font-mono tracking-wider pl-1 font-bold">Timestamp (sec)</label>
                {isTimestampConnected && <span className="text-[8px] text-[#e2ff46] font-mono font-bold animate-pulse">LOCKED</span>}
            </div>
            
            <div className="relative">
                <Handle
                  type="target"
                  position={Position.Left}
                  id="timestamp"
                  style={{ left: -28, top: '50%', zIndex: 50 }}
                  isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
                  className="w-2.5 h-2.5 bg-white/40 border border-white/60 rounded-full"
                />
                <input
                  type="text"
                  disabled={isTimestampConnected || isProcessing}
                  value={isTimestampConnected ? (connectedTimestamp || "...") : localTimestamp}
                  onChange={(e) => setLocalTimestamp(e.target.value)}
                  onBlur={() => syncToStore('timestamp', localTimestamp)}
                  className={`w-full bg-[#1a1a1f]/50 border border-white/10 rounded-sm p-2 text-xs font-mono outline-none transition-all ${
                    isTimestampConnected || isProcessing 
                      ? 'opacity-50 grayscale cursor-not-allowed border-white/5' 
                      : 'focus:border-[#e2ff46]/50 bg-[#0e0e13]'
                  }`}
                />
            </div>
        </div>

        {/* Action Area */}
        <div className="flex justify-between items-center pt-1 pb-1">
          <div className="text-[8px] font-mono text-white/20 uppercase">seeking engine v2.0</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ top: '50%', right: -32, zIndex: 50 }}
        isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
        className="w-3 h-3 bg-[#e2ff46] border border-black shadow-[0_0_10px_rgba(226,255,70,0.5)] rounded-full transition-transform hover:scale-125"
      />
    </NodeWrapper>
  );
};

export default memo(ExtractFrameNode);
