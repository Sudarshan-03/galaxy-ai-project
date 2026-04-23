"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactFlowProvider } from "reactflow";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <ReactFlowProvider>
        {children}
      </ReactFlowProvider>
    </SidebarProvider>
  );
}
