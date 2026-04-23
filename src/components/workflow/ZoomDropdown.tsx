"use client";

import * as React from "react";
import { useReactFlow, useViewport } from "reactflow";
import { ChevronDown, Plus, Minus, Maximize, CircleDashed } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ZoomDropdown() {
  const { zoomIn, zoomOut, setViewport, fitView } = useReactFlow();
  const { x, y, zoom } = useViewport();

  const zoomTo100 = React.useCallback(() => {
    setViewport({ x, y, zoom: 1 }, { duration: 400 });
  }, [setViewport, x, y]);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      if (modifier) {
        if (event.key === '=' || event.key === '+') {
          event.preventDefault();
          zoomIn();
        } else if (event.key === '-') {
          event.preventDefault();
          zoomOut();
        } else if (event.key === '0') {
          event.preventDefault();
          zoomTo100();
        } else if (event.key === '1') {
          event.preventDefault();
          fitView();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, zoomTo100, fitView]);

  const zoomPercentage = Math.round(zoom * 100);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-1 px-3 py-1.5 hover:bg-white/5 rounded-md cursor-pointer group transition-all">
          <span className="text-[11px] font-medium text-white/60 group-hover:text-white min-w-[32px] text-center">
            {zoomPercentage}%
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-white/30 group-hover:text-white transition-transform group-data-[state=open]:rotate-180" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="center" 
        sideOffset={12}
        className="glass-blur border-white/10 text-white min-w-[200px] p-1.5 bg-[#1a1a1f]/95 shadow-2xl"
      >
        <DropdownMenuItem 
          onClick={() => zoomIn()}
          className="focus:bg-white/10 focus:text-white cursor-pointer py-2 rounded-md"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" />
            <span>Zoom in</span>
          </div>
          <DropdownMenuShortcut className="text-white/30 font-mono tracking-tighter">Ctrl +</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => zoomOut()}
          className="focus:bg-white/10 focus:text-white cursor-pointer py-2 rounded-md"
        >
          <div className="flex items-center gap-2">
            <Minus className="w-3.5 h-3.5" />
            <span>Zoom out</span>
          </div>
          <DropdownMenuShortcut className="text-white/30 font-mono tracking-tighter">Ctrl -</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/5 my-1.5" />
        <DropdownMenuItem 
          onClick={() => zoomTo100()}
          className="focus:bg-white/10 focus:text-white cursor-pointer py-2 rounded-md"
        >
          <div className="flex items-center gap-2">
            <CircleDashed className="w-3.5 h-3.5" />
            <span>Zoom to 100%</span>
          </div>
          <DropdownMenuShortcut className="text-white/30 font-mono tracking-tighter">Ctrl 0</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => fitView()}
          className="focus:bg-white/10 focus:text-white cursor-pointer py-2 rounded-md"
        >
          <div className="flex items-center gap-2">
            <Maximize className="w-3.5 h-3.5" />
            <span>Zoom to fit</span>
          </div>
          <DropdownMenuShortcut className="text-white/30 font-mono tracking-tighter">Ctrl 1</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
