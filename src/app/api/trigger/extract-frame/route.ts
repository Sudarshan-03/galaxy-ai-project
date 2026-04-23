import { tasks, runs } from "@trigger.dev/sdk/v3";
import { type extractFrameTask } from "@/trigger/extractFrame";
import { NextResponse } from "next/server";

import { z } from "zod";

const ExtractFrameSchema = z.object({
  videoUrl: z.string().min(1, "Missing videoUrl").url("Invalid URL format"),
  timestamp: z.union([z.string(), z.number()]).transform(v => v.toString()).default("0"),
  nodeId: z.string().min(1, "nodeId is required"),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = ExtractFrameSchema.safeParse(payload);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() }, 
        { status: 400 }
      );
    }
    
    const { videoUrl, timestamp, nodeId } = parsed.data;

    console.log(`[API] Triggering extract-frame for node ${nodeId}`);
    const handle = await tasks.trigger<typeof extractFrameTask>("extract-frame", {
      videoUrl,
      timestamp,
      nodeId,
    });
    console.log(`[API] Task triggered: ${handle.id}`);

    return NextResponse.json({ id: handle.id });
  } catch (error: any) {
    console.error("[API] Trigger error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const handleId = searchParams.get("handleId");

    if (!handleId) {
        return NextResponse.json({ error: "Missing handleId" }, { status: 400 });
    }

    try {
        const run = await runs.retrieve(handleId);
        return NextResponse.json(run);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
