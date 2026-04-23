import { NextResponse } from "next/server";
import { z } from "zod";

const ImageGenerateSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  model: z.string().default("imagen-3.0-generate-002"),
  nodeId: z.string().min(1, "nodeId is required"),
  aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).default("1:1"),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = ImageGenerateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { prompt, model, nodeId, aspectRatio } = parsed.data;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    console.log(`[API] Image generate for node ${nodeId}, model: ${model}`);

    // Call Google Imagen via the generativelanguage REST API directly
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;

    const body = {
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio,
      },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[API] Imagen API error ${response.status}:`, errText);
      let errMsg = `Imagen API error (${response.status})`;
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson?.error?.message || errMsg;
      } catch {}
      return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
    }

    const data = await response.json();

    const prediction = data?.predictions?.[0];
    if (!prediction?.bytesBase64Encoded) {
      console.error("[API] No image bytes in Imagen response:", JSON.stringify(data));
      return NextResponse.json(
        { success: false, error: "No image returned from Imagen API" },
        { status: 500 }
      );
    }

    const mimeType = prediction.mimeType || "image/png";
    const imageDataUrl = `data:${mimeType};base64,${prediction.bytesBase64Encoded}`;

    console.log(`[API] Image generation complete for node ${nodeId}`);

    return NextResponse.json({
      success: true,
      output: {
        imageUrl: imageDataUrl,
        mimeType,
        prompt,
        model,
      },
    });
  } catch (error: any) {
    console.error("[API] Image generate error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Image generation failed" },
      { status: 500 }
    );
  }
}
