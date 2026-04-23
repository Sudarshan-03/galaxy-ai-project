import React, { memo, useState, useEffect } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useStore } from "@/store/useStore";
import { NodeWrapper } from "./NodeWrapper";
import { useIsHandleConnected } from "@/hooks/useIsHandleConnected";
import { useConnectedData } from "@/hooks/useConnectedData";
import { isValidHandleConnection } from "@/lib/validationUtils";
const CropImageNode = (props: NodeProps) => {
  const { id, data } = props;
  const { updateNodeData, nodes, edges } = useStore();

  const isProcessing = data.executionStatus === 'running';

  // Local state for HMR stability and manual entry
  const [localX, setLocalX] = useState(data.x || "0");
  const [localY, setLocalY] = useState(data.y || "0");
  const [localWidth, setLocalWidth] = useState(data.width || "100");
  const [localHeight, setLocalHeight] = useState(data.height || "100");

  // Data Propagation
  const connectedImageUrl = useConnectedData(id, 'image_url');
  const connectedX = useConnectedData(id, 'x_percent');
  const connectedY = useConnectedData(id, 'y_percent');
  const connectedWidth = useConnectedData(id, 'width_percent');
  const connectedHeight = useConnectedData(id, 'height_percent');

  // Sync from props if they change externally
  useEffect(() => {
    setLocalX(data.x || "0");
    setLocalY(data.y || "0");
    setLocalWidth(data.width || "100");
    setLocalHeight(data.height || "100");
  }, [data.x, data.y, data.width, data.height]);

  const isImageUrlConnected = useIsHandleConnected(id, 'image_url', 'target');
  const isXConnected = useIsHandleConnected(id, 'x_percent', 'target');
  const isYConnected = useIsHandleConnected(id, 'y_percent', 'target');
  const isWidthConnected = useIsHandleConnected(id, 'width_percent', 'target');
  const isHeightConnected = useIsHandleConnected(id, 'height_percent', 'target');

  const syncToStore = (field: string, value: string) => {
    updateNodeData(id, { [field]: value });
  };

  const theme = { bg: 'bg-[#0e0e13]', stroke: 'border-white/10' };

  return (
    <NodeWrapper {...props} theme={theme} minWidth="280px" className="relative">
      {/* Image Preview */}
      <div className="media-checkerboard w-full h-32 rounded-sm border border-white/5 border-dashed flex items-center justify-center relative overflow-hidden">
        {data.executionResult?.croppedImageUrl || data.croppedImageUrl || connectedImageUrl || data.imageUrl ? (
          <img src={data.executionResult?.croppedImageUrl || data.croppedImageUrl || connectedImageUrl || data.imageUrl} alt="Crop View" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] text-white/20 font-mono text-center px-4">
              {isImageUrlConnected ? "IMAGE STREAM ATTACHED" : "WAITING FOR IMAGE..."}
            </span>
          </div>
        )}
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] text-white/40 font-mono pointer-events-none uppercase">URL</span>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="image_url"
        style={{ left: -28, top: '105px', zIndex: 50 }}
        isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
        className="w-3 h-3 bg-[#1a1a1f] border border-white/60 rounded-full"
      />

      {/* Inputs Grid */}
      <div className="space-y-3 mt-3">
        <div className="grid grid-cols-2 gap-3">
          {/* X Pos */}
          <div className="space-y-1 relative px-1">
            <label className="text-[9px] text-white/50 uppercase font-mono pl-3">X Pos (%)</label>
            <Handle
              type="target"
              position={Position.Left}
              id="x_percent"
              style={{ left: -28, top: '75%', zIndex: 50 }}
              isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
              className="w-2.5 h-2.5 bg-white/40 border border-white/60 rounded-full"
            />
            <input
              type="text"
              disabled={isXConnected || isProcessing}
              value={isXConnected ? (connectedX || "...") : localX}
              onChange={(e) => setLocalX(e.target.value)}
              onBlur={() => syncToStore('x', localX)}
              className={`w-full bg-[#1a1a1f]/50 border border-white/5 rounded-sm p-1.5 text-xs font-mono outline-none focus:border-white/20 ${
                isXConnected || isProcessing ? 'opacity-50 grayscale cursor-not-allowed' : ''
              }`}
            />
          </div>
          {/* Y Pos */}
          <div className="space-y-1 relative px-1">
            <label className="text-[9px] text-white/50 uppercase font-mono pl-3">Y Pos (%)</label>
            <Handle
              type="target"
              position={Position.Left}
              id="y_percent"
              style={{ left: -28, top: '75%', zIndex: 50 }}
              isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
              className="w-2.5 h-2.5 bg-white/40 border border-white/60 rounded-full"
            />
            <input
              type="text"
              disabled={isYConnected || isProcessing}
              value={isYConnected ? (connectedY || "...") : localY}
              onChange={(e) => setLocalY(e.target.value)}
              onBlur={() => syncToStore('y', localY)}
              className={`w-full bg-[#1a1a1f]/50 border border-white/5 rounded-sm p-1.5 text-xs font-mono outline-none focus:border-white/20 ${
                isYConnected || isProcessing ? 'opacity-50 grayscale cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Width */}
          <div className="space-y-1 relative px-1">
            <label className="text-[9px] text-white/50 uppercase font-mono pl-3">Width (%)</label>
            <Handle
              type="target"
              position={Position.Left}
              id="width_percent"
              style={{ left: -28, top: '75%', zIndex: 50 }}
              isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
              className="w-2.5 h-2.5 bg-white/40 border border-white/60 rounded-full"
            />
            <input
              type="text"
              disabled={isWidthConnected || isProcessing}
              value={isWidthConnected ? (connectedWidth || "...") : localWidth}
              onChange={(e) => setLocalWidth(e.target.value)}
              onBlur={() => syncToStore('width', localWidth)}
              className={`w-full bg-[#1a1a1f]/50 border border-white/5 rounded-sm p-1.5 text-xs font-mono outline-none focus:border-white/20 ${
                isWidthConnected || isProcessing ? 'opacity-50 grayscale cursor-not-allowed' : ''
              }`}
            />
          </div>
          {/* Height */}
          <div className="space-y-1 relative px-1">
            <label className="text-[9px] text-white/50 uppercase font-mono pl-3">Height (%)</label>
            <Handle
              type="target"
              position={Position.Left}
              id="height_percent"
              style={{ left: -28, top: '75%', zIndex: 50 }}
              isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
              className="w-2.5 h-2.5 bg-white/40 border border-white/60 rounded-full"
            />
            <input
              type="text"
              disabled={isHeightConnected || isProcessing}
              value={isHeightConnected ? (connectedHeight || "...") : localHeight}
              onChange={(e) => setLocalHeight(e.target.value)}
              onBlur={() => syncToStore('height', localHeight)}
              className={`w-full bg-[#1a1a1f]/50 border border-white/5 rounded-sm p-1.5 text-xs font-mono outline-none focus:border-white/20 ${
                isHeightConnected || isProcessing ? 'opacity-50 grayscale cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>

        {/* Action Area */}
        <div className="flex justify-between items-center pt-2 pb-1 px-1">
          <div className="text-[8px] font-mono text-white/20 uppercase">precision crop engine v1.2</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ right: -32, zIndex: 50 }}
        isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
        className="w-3 h-3 bg-[#e2ff46] border border-black rounded-full shadow-[0_0_10px_rgba(226,255,70,0.5)] transition-transform hover:scale-125"
      />
    </NodeWrapper>
  );
};

export default memo(CropImageNode);
