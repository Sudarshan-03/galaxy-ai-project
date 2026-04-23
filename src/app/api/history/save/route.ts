import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { z } from "zod";

const SaveHistorySchema = z.object({
  status: z.string().min(1, "status is required"),
  scope: z.string().min(1, "scope is required"),
  duration: z.number().nullable().optional(),
  nodesSnapshot: z.any().optional(),
  edges: z.any().optional(),
  nodeExecutions: z.array(z.object({
    nodeId: z.string(),
    nodeLabel: z.string(),
    nodeType: z.string(),
    status: z.string(),
    inputs: z.any().optional(),
    outputs: z.any().optional(),
    error: z.string().nullable().optional(),
    startTime: z.string().or(z.date()),
    endTime: z.string().or(z.date()).nullable().optional(),
    duration: z.number().nullable().optional(),
  })).optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = SaveHistorySchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() }, 
        { status: 400 }
      );
    }
    
    const { status, scope, duration, nodeExecutions, nodesSnapshot, edges } = parsed.data;

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create top-level WorkflowRun
      const run = await tx.workflowRun.create({
        data: {
          status,
          scope,
          duration,
          nodesSnapshot: nodesSnapshot || [],
          edges: edges || [],
        },
      });

      // 2. Create individual NodeExecution records
      if (nodeExecutions && nodeExecutions.length > 0) {
        await tx.nodeExecution.createMany({
          data: nodeExecutions.map((exec: any) => ({
            runId: run.id,
            nodeId: exec.nodeId,
            nodeLabel: exec.nodeLabel,
            nodeType: exec.nodeType,
            status: exec.status,
            inputs: exec.inputs || {},
            outputs: exec.outputs || {},
            error: exec.error,
            startTime: new RegExp(/^\d{4}-\d{2}-\d{2}T/).test(exec.startTime) ? new Date(exec.startTime) : new Date(),
            endTime: exec.endTime ? (new RegExp(/^\d{4}-\d{2}-\d{2}T/).test(exec.endTime) ? new Date(exec.endTime) : new Date()) : null,
            duration: exec.duration,
          })),
        });
      }

      return run;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to save history:", error);
    return NextResponse.json({ error: "Failed to save history" }, { status: 500 });
  }
}
