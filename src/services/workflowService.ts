import axios from "axios";

export interface ProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const workflowService = {
  async cropImage(payload: {
    imageUrl: string;
    x: string;
    y: string;
    width: string;
    height: string;
    nodeId: string;
  }): Promise<ProcessingResult> {
    console.log(`[Service] Starting Crop Image for node ${payload.nodeId}`);
    try {
      const { data: run } = await axios.post("/api/trigger/crop-image", payload);
      const handleId = run.handleId;
      console.log(`[Service] Triggered task: ${handleId}`);

      let attempts = 0;
      while (true) {
        attempts++;
        await new Promise((r) => setTimeout(r, 800)); // Optimized to 800ms
        const { data: currentRun } = await axios.get(`/api/trigger/crop-image?handleId=${handleId}`);
        console.log(`[Service] Polling ${handleId} (Attempt ${attempts}): ${currentRun.status}`);
        
        if (currentRun.status === "COMPLETED") {
          console.log(`[Service] Node ${payload.nodeId} completed successfully.`);
          return { success: true, data: currentRun.output };
        } else if (["FAILED", "CANCELED", "CRASHED"].includes(currentRun.status)) {
          console.error(`[Service] Node ${payload.nodeId} failed: ${currentRun.status}`);
          return { success: false, error: `Task ${currentRun.status.toLowerCase()}` };
        }
      }
    } catch (error: any) {
      console.error(`[Service] Error in cropImage:`, error);
      return { success: false, error: error.message };
    }
  },

  async extractFrame(payload: {
    videoUrl: string;
    timestamp: string;
    nodeId: string;
  }): Promise<ProcessingResult> {
    console.log(`[Service] Starting Extract Frame for node ${payload.nodeId}`);
    try {
      const { data: run } = await axios.post("/api/trigger/extract-frame", payload);
      const handleId = run.id;
      console.log(`[Service] Triggered task: ${handleId}`);

      let attempts = 0;
      while (true) {
        attempts++;
        await new Promise((r) => setTimeout(r, 800));
        const { data: currentRun } = await axios.get(`/api/trigger/extract-frame?handleId=${handleId}`);
        console.log(`[Service] Polling ${handleId} (Attempt ${attempts}): ${currentRun.status}`);
        
        if (currentRun.status === "COMPLETED") {
          console.log(`[Service] Node ${payload.nodeId} completed successfully.`);
          return { success: true, data: currentRun.output };
        } else if (["FAILED", "CANCELED", "CRASHED"].includes(currentRun.status)) {
          console.error(`[Service] Node ${payload.nodeId} failed: ${currentRun.status}`);
          return { success: false, error: `Task ${currentRun.status.toLowerCase()}` };
        }
      }
    } catch (error: any) {
      console.error(`[Service] Error in extractFrame:`, error);
      return { success: false, error: error.message };
    }
  },

  async generateLLM(payload: {
    systemPrompt?: string;
    userMessage: string;
    imageUrls: string[];
    model: string;
    nodeId: string;
  }): Promise<ProcessingResult> {
    console.log(`[Service] Starting LLM Generate for node ${payload.nodeId}`);
    try {
      const { data } = await axios.post("/api/trigger/llm-generate", payload);
      if (!data.success) {
        console.error(`[Service] LLM generation failed for node ${payload.nodeId}: ${data.error}`);
        return { success: false, error: data.error || "LLM generation failed" };
      }
      console.log(`[Service] Node ${payload.nodeId} completed successfully.`);
      return { success: true, data: data.output };
    } catch (error: any) {
      const errMsg = error.response?.data?.error || error.message;
      console.error(`[Service] Error in generateLLM:`, errMsg);
      return { success: false, error: errMsg };
    }
  },

  async generateImage(payload: {
    prompt: string;
    model: string;
    aspectRatio: string;
    nodeId: string;
  }): Promise<ProcessingResult> {
    console.log(`[Service] Starting Image Generate for node ${payload.nodeId}`);
    try {
      const { data } = await axios.post("/api/image-generate", payload);
      if (!data.success) {
        console.error(`[Service] Image generation failed for node ${payload.nodeId}: ${data.error}`);
        return { success: false, error: data.error || "Image generation failed" };
      }
      console.log(`[Service] Image node ${payload.nodeId} completed successfully.`);
      return { success: true, data: data.output };
    } catch (error: any) {
      const errMsg = error.response?.data?.error || error.message;
      console.error(`[Service] Error in generateImage:`, errMsg);
      return { success: false, error: errMsg };
    }
  }
};
