import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import axios from "axios";

const LlmGenerateSchema = z.object({
  systemPrompt: z.string().optional(),
  userMessage: z.string().min(1, "Missing userMessage"),
  imageUrls: z.array(z.string()).optional(),
  model: z.string().default("gemini-2.5-flash"),
  nodeId: z.string().min(1, "nodeId is required"),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = LlmGenerateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { systemPrompt, userMessage, imageUrls, model, nodeId } = parsed.data;

    console.log(`[API] Direct LLM generate for node ${nodeId}, model: ${model}`);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel(
      {
        model: model || "gemini-2.5-flash",
        ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
      },
      { apiVersion: "v1beta" }
    );

    const hasImages = imageUrls && imageUrls.length > 0;
    let result;

    if (hasImages) {
      const parts: any[] = [{ text: userMessage }];

      for (const url of imageUrls!) {
        try {
          console.log(`[API] Fetching image for LLM context: ${url}`);
          const imageResp = await axios.get(url, { responseType: "arraybuffer" });
          const imageData = Buffer.from(imageResp.data).toString("base64");
          const imageMime = imageResp.headers["content-type"] || "image/jpeg";
          parts.push({ inlineData: { data: imageData, mimeType: imageMime } });
        } catch (fetchErr) {
          console.error(`[API] Failed to fetch image part: ${url}`, fetchErr);
        }
      }

      const contents = [{ role: "user", parts }];
      result = await geminiModel.generateContent({ contents });
    } else {
      result = await geminiModel.generateContent(userMessage);
    }

    const response = result.response;
    const text = response.text();

    console.log(`[API] LLM generation complete for node ${nodeId}, length: ${text.length}`);

    return NextResponse.json({
      success: true,
      output: { responseText: text },
    });
  } catch (error: any) {
    console.error("[API] LLM generate error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "LLM generation failed" },
      { status: 500 }
    );
  }
}
