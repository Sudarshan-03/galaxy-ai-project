import { logger, task, tasks } from "@trigger.dev/sdk/v3";
import ffmpeg from "fluent-ffmpeg";
import { Transloadit } from "transloadit";
import fs from "fs";
import path from "path";
import axios from "axios";
import os from "os";

export const uploadFrameToTransloaditTask = task({
  id: "upload-frame-to-transloadit",
  run: async (payload: { filePath: string; nodeId: string }) => {
    const { filePath, nodeId } = payload;
    const templateId = process.env.TEMPLATE_ID;

    logger.info("Starting Transloadit upload for extracted frame", {
      nodeId,
      filePath: path.resolve(filePath),
    });

    const transloadit = new (Transloadit as any)({
      authKey: process.env.TRANSLOADIT_KEY!,
      authSecret: process.env.TRANSLOADIT_SECRET!,
    });

    try {
      const assembly: any = await transloadit.createAssembly({
        uploads: {
          'file': fs.createReadStream(filePath)
        },
        params: {
          template_id: templateId,
        },
        waitForCompletion: true
      });

      if (assembly.ok === "ASSEMBLY_COMPLETED") {
        logger.info("Transloadit Assembly Success (Frame)", { assemblyId: assembly.assembly_id, nodeId });
        const results = assembly.results || {};
        const finalUrl = results[':original']?.[0]?.ssl_url || 
                         results[Object.keys(results)[0]]?.[0]?.ssl_url;

        if (!finalUrl) {
          throw new Error("Transloadit success but no URL generated for frame");
        }

        return { sslUrl: finalUrl };
      } else {
        throw new Error(assembly.message || "Assembly failed");
      }
    } catch (err) {
      logger.error("Transloadit Frame Upload Error", { error: err instanceof Error ? err.message : String(err), nodeId });
      throw err;
    }
  }
});

export const extractFrameTask = task({
  id: "extract-frame",
  machine: "large-1x",
  run: async (payload: { videoUrl: string; timestamp: string; nodeId: string }) => {
    const { videoUrl, timestamp, nodeId } = payload;
    logger.info("Starting Video Frame Extraction", { nodeId, videoUrl, timestamp });

    const tempInput = path.join(os.tmpdir(), `video_${nodeId}${path.extname(videoUrl.split('?')[0]) || '.mp4'}`);
    const tempOutput = path.join(os.tmpdir(), `frame_${nodeId}.jpg`);

    try {
      // 1. Download Video (Seeking works best locally)
      logger.info("Downloading source video", { nodeId, videoUrl });
      const response = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });
      const writer = fs.createWriteStream(tempInput);
      response.data.pipe(writer);
      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => resolve());
        writer.on('error', reject);
      });

      // 2. FFmpeg Extraction
      // Use -ss before -i for fast seeking
      logger.info("Executing FFmpeg Frame Extraction", { nodeId, timestamp, tempOutput });
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempInput)
          .seekInput(timestamp)
          .output(tempOutput)
          .frames(1)
          .videoFilters('scale=iw:-1') // Maintain aspect ratio
          .outputOptions('-q:v 2') // High quality
          .on('end', () => resolve())
          .on('error', (err) => {
            logger.error("FFmpeg extraction failed", { error: err.message, nodeId });
            reject(err);
          })
          .run();
      });

      // 3. Upload Result (Isolated Sub-task)
      logger.info("Triggering frame upload sub-task", { nodeId, tempOutput });
      const uploadResult = await tasks.triggerAndWait<typeof uploadFrameToTransloaditTask>("upload-frame-to-transloadit", {
        filePath: tempOutput,
        nodeId
      });

      if (!uploadResult.ok) {
        throw new Error(`Upload sub-task failed: ${uploadResult.error}`);
      }

      logger.info("Frame extraction completed", { nodeId, frameUrl: uploadResult.output.sslUrl });
      return { frameUrl: uploadResult.output.sslUrl };
    } catch (err) {
      logger.error("Extract Frame Task Exception", { error: err instanceof Error ? err.message : String(err), nodeId });
      throw err;
    } finally {
      if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
      if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
    }
  }
});
