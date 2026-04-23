"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface RenameNodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  currentName: string;
}

export function RenameNodeDialog({ isOpen, onClose, onRename, currentName }: RenameNodeDialogProps) {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onRename(name);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#1a1a1f] border-white/10 text-white p-0 gap-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-4 flex flex-row items-center justify-between border-b border-white/5 space-y-0">
          <DialogTitle className="text-sm font-semibold tracking-wide">Rename Node</DialogTitle>
           {/* Custom close button handled by Dialog primitive but we can ensure layout */}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#242429] border-white/10 text-white focus-visible:ring-1 focus-visible:ring-[#e2ff46] focus-visible:border-[#e2ff46] h-10"
              placeholder="Node name"
              autoFocus
            />
          </div>
          
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/5 h-9"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#e2ff46] text-black hover:bg-[#cce640] font-medium h-9 px-6"
            >
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
