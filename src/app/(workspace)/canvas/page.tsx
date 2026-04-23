"use client";

import { useEffect, useState } from "react";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import { NodeSidebar } from "@/components/workflow/NodeSidebar";
import { HistorySidebar } from "@/components/workflow/HistorySidebar";

export default function CanvasPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <main className="dark h-screen w-screen overflow-hidden flex bg-background text-foreground">
      <NodeSidebar />
      <WorkflowCanvas />
      <HistorySidebar />
    </main>
  );
}
