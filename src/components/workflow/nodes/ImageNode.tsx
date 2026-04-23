"use client";

import React, { memo, useState, useEffect } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { useStore } from "@/store/useStore";
import { NodeWrapper } from "./NodeWrapper";
import { Upload, Loader2 } from "lucide-react";
import { isValidHandleConnection } from "@/lib/validationUtils";
import Uppy from "@uppy/core";
import Transloadit from "@uppy/transloadit";
import "@uppy/core/css/style.min.css";

const COLORS = {
  bg: 'rgba(53, 53, 57, 1)',
  stroke: '#45a08a',
  active: '#050e0bff',
};

const CHECKERBOARD_STYLE = {
  backgroundImage: `repeating-conic-gradient(#353539 0% 25%, #2b2b2f 25% 50%, #353539 50% 75%, #2b2b2f 75% 100%)`,
  backgroundSize: '16px 16px',
};

const ImageNode = (props: NodeProps) => {
  const { id, data } = props;
  const { updateNodeData, nodes, edges } = useStore();
  const { setNodes } = useReactFlow();
  const [isUploading, setIsUploading] = useState(false);

  const [uppy] = useState(() => {
    const uppyInstance = new Uppy({
      autoProceed: true,
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: ['image/*'],
      },
    });

    const transloaditParams = {
      auth: { key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY as string },
      template_id: process.env.NEXT_PUBLIC_TEMPLATE_ID as string,
    } as any; 

    uppyInstance.use(Transloadit, {
      service: "https://api2.transloadit.com",
      waitForEncoding: true,
      alwaysRunAssembly: true,
      params: transloaditParams,
      assemblyOptions: {
        fields: {},
        params: transloaditParams,
      },
    } as any);

    uppyInstance.on('upload', () => setIsUploading(true));

    uppyInstance.on('complete', (result: any) => {
      setIsUploading(false);
      if (result.transloadit && result.transloadit.length > 0) {
        const assembly = result.transloadit[0];
        const sslUrl = assembly.results?.image_thumbed?.[0]?.ssl_url 
                    || assembly.results?.[':original']?.[0]?.ssl_url;

        if (sslUrl && typeof sslUrl === 'string') {
          setNodes((nds) => nds.map((node) => 
             node.id === id ? { ...node, data: { ...node.data, imageUrl: sslUrl, isReady: true } } : node
          ));
          updateNodeData(id, { imageUrl: sslUrl, isReady: true });
        }
      }
    });

    uppyInstance.on('error', () => setIsUploading(false));

    return uppyInstance;
  });

  useEffect(() => {
    return () => {
      if (uppy) {
        uppy.cancelAll();
        // @ts-ignore
        uppy.close?.({ reason: 'unmount' }); 
      }
    };
  }, [uppy, id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uppy.cancelAll();
      setIsUploading(true);
      setNodes((nds) => nds.map((node) => 
        node.id === id ? { ...node, data: { ...node.data, imageUrl: null, isReady: false } } : node
      ));
      updateNodeData(id, { imageUrl: null, isReady: false });

      Array.from(e.target.files).forEach((file) => {
        uppy.addFile({
          name: file.name,
          type: file.type,
          data: file,
        });
      });
    }
  };

  const theme = { bg: 'bg-node-media-bg', stroke: 'border-node-media-stroke' };

  return (
    <NodeWrapper {...props} theme={theme} className={isUploading ? "node-executing" : ""}>
      <div 
        className="relative w-full min-h-[160px] rounded-sm overflow-hidden flex items-center justify-center border border-white/5"
        style={CHECKERBOARD_STYLE}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-2 z-10">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: COLORS.stroke }} />
              <span className="font-mono text-xs text-white/50">PROCESSING...</span>
          </div>
        ) : data.imageUrl ? (
          <div className="absolute inset-0 w-full h-full group">
            <img src={data.imageUrl} alt="Uploaded" className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="cursor-pointer bg-black/60 p-1.5 rounded-full hover:bg-black/90 text-white shadow-sm border border-white/10 backdrop-blur-sm transition-all block">
                  <Upload className="w-3.5 h-3.5" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
              </label>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center gap-2 group w-full h-full absolute inset-0 text-center p-4 hover:bg-white/5 transition-colors">
              <Upload className="w-6 h-6 mb-1 transition-transform group-hover:-translate-y-0.5" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
              <span className="font-sans text-sm font-medium text-white/80 group-hover:text-white transition-colors">Upload Image</span>
              <span className="font-sans text-[10px] text-white/40 max-w-[120px]">Drag & drop or click to upload</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
          </label>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="image_url"
        style={{ 
          right: -32,
        }}
        isValidConnection={(conn) => isValidHandleConnection(conn, nodes, edges)}
        className="w-3 h-3 bg-[#1a1a1f] rounded-full border border-[#45a08a] shadow-md"
      />
    </NodeWrapper>
  );
};

export default memo(ImageNode);
