import { tasks, runs } from "@trigger.dev/sdk/v3";
import { type cropImageTask } from "@/trigger/cropImage";
import { NextResponse } from "next/server";

import { z } from "zod";

const CropImageSchema = z.object({
  imageUrl: z.string().min(1, "Missing imageUrl").url("Invalid URL format"),
  x: z.union([z.string(), z.number()]).transform(v => v.toString()).default("0"),
  y: z.union([z.string(), z.number()]).transform(v => v.toString()).default("0"),
  width: z.union([z.string(), z.number()]).transform(v => v.toString()).default("100"),
  height: z.union([z.string(), z.number()]).transform(v => v.toString()).default("100"),
  nodeId: z.string().min(1, "nodeId is required"),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = CropImageSchema.safeParse(payload);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() }, 
        { status: 400 }
      );
    }
    
    const { imageUrl, x, y, width, height, nodeId } = parsed.data;

    console.log(`[API] Triggering crop-image for node ${nodeId}`);
    const handle = await tasks.trigger<typeof cropImageTask>("crop-image", {
      imageUrl,
      x,
      y,
      width,
      height,
      nodeId,
    });
    console.log(`[API] Task triggered: ${handle.id}`);

    return NextResponse.json({ handleId: handle.id });
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
