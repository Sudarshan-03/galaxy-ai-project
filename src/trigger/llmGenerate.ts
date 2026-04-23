import { logger, task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

export const llmGenerateTask = task({
  id: "llm-generate",
  run: async (payload: { 
    systemPrompt?: string; 
    userMessage: string; 
    imageUrls?: string[]; 
    model: string; 
    nodeId: string 
  }) => {
    const { systemPrompt, userMessage, imageUrls, model, nodeId } = payload;
    const hasImages = imageUrls && imageUrls.length > 0;
    
    logger.info("Starting Gemini Generation", { nodeId, model, imageCount: imageUrls?.length || 0 });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const geminiModel = genAI.getGenerativeModel({ 
      model: model || "gemini-3-flash-preview",
      systemInstruction: systemPrompt 
    }, { apiVersion: "v1beta" });

    try {
      let result;
      
      if (hasImages) {
        const parts: any[] = [{ text: userMessage }];
        
        for (const url of imageUrls) {
          try {
            logger.info("Fetching context image", { url });
            const imageResp = await axios.get(url, { responseType: 'arraybuffer' });
            const imageData = Buffer.from(imageResp.data).toString('base64');
            const imageMime = imageResp.headers['content-type'] || 'image/jpeg';
            
            parts.push({
              inlineData: {
                data: imageData,
                mimeType: imageMime
              }
            });
          } catch (fetchErr) {
            logger.error("Failed to fetch image part", { url, error: String(fetchErr) });
          }
        }

        const contents = [{ role: "user", parts }];
        result = await geminiModel.generateContent({ contents });
      } else {
        result = await geminiModel.generateContent(userMessage);
      }

      const response = await result.response;
      const text = response.text();

      logger.info("Gemini Generation Success", { nodeId, textLength: text.length });
      
      return { responseText: text };
    } catch (err) {
      logger.error("Gemini API Error", { 
        error: err instanceof Error ? err.message : String(err), 
        nodeId 
      });
      throw err;
    }
  }
});
