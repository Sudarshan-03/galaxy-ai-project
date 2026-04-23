import { logger, task, tasks } from "@trigger.dev/sdk/v3";
import ffmpeg from "fluent-ffmpeg";
import { Transloadit } from "transloadit";
import fs from "fs";
import path from "path";
import axios from "axios";
import os from "os";

export const uploadToTransloaditTask = task({
  id: "upload-to-transloadit",
  run: async (payload: { filePath: string; nodeId: string }) => {
    const { filePath, nodeId } = payload;
    const templateId = process.env.TEMPLATE_ID;

    logger.info("Starting Transloadit upload sub-task", {
      nodeId,
      templateId,
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
        waitForCompletion: true // CRITICAL: Must be true to get result in this run
      });

      if (assembly.ok === "ASSEMBLY_COMPLETED") {
        logger.info("Transloadit Assembly Success", { 
          assemblyId: assembly.assembly_id,
          nodeId 
        });

        // Extract URL using prioritized keys
        const results = assembly.results || {};
        const finalUrl = results[':original']?.[0]?.ssl_url || 
                         results[Object.keys(results)[0]]?.[0]?.ssl_url;

        if (!finalUrl) {
          logger.error("No SSL URL generated in assembly results", { results, nodeId });
          throw new Error("Transloadit success but no URL generated");
        }

        return { sslUrl: finalUrl };
      } else {
        logger.error("Transloadit Assembly failed or timed out", { 
          error: assembly.error, 
          message: assembly.message,
          nodeId 
        });
        throw new Error(assembly.message || "Assembly failed");
      }
    } catch (err) {
      logger.error("Transloadit SDK Exception", { 
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        nodeId
      });
      throw err;
    }
  }
});

export const cropImageTask = task({
  id: "crop-image",
  machine: "large-1x",
  run: async (payload: { imageUrl: string; x: string; y: string; width: string; height: string; nodeId: string }) => {
    const { imageUrl, x, y, width, height, nodeId } = payload;
    logger.info("Starting FFmpeg crop image task", { nodeId, imageUrl });
    
    // Convert string inputs to decimal floats for calculation
    const xPct = parseFloat(x);
    const yPct = parseFloat(y);
    const wPct = parseFloat(width);
    const hPct = parseFloat(height);
    
    const tempInput = path.join(os.tmpdir(), `source_${nodeId}.png`);
    const tempOutput = path.join(os.tmpdir(), `output_${nodeId}.png`);
    
    try {
        // 1. Download
        logger.info("Downloading source image", { nodeId, imageUrl, tempInput });
        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'stream'
        });
        
        const writer = fs.createWriteStream(tempInput);
        response.data.pipe(writer);
        
        await new Promise<void>((resolve, reject) => {
            writer.on('finish', () => resolve());
            writer.on('error', (err) => {
              logger.error("Download stream failed", { error: err.message, nodeId });
              reject(err);
            });
        });

        // 2. FFmpeg Crop
        logger.info("Executing FFmpeg Crop", { 
          nodeId, 
          filter: `crop=iw*${wPct/100}:ih*${hPct/100}:iw*${xPct/100}:ih*${yPct/100}`,
          tempOutput 
        });
        
        await new Promise<void>((resolve, reject) => {
            ffmpeg(tempInput)
                .complexFilter([
                    {
                        filter: 'crop',
                        options: {
                            w: `iw*${wPct/100}`,
                            h: `ih*${hPct/100}`,
                            x: `iw*${xPct/100}`,
                            y: `ih*${yPct/100}`
                        }
                    }
                ])
                .outputOptions('-preset ultrafast')
                .on('end', () => resolve())
                .on('error', (err) => {
                    logger.error("FFmpeg execution failed", { error: err.message, nodeId });
                    reject(err);
                })
                .save(tempOutput);
        });

        // 3. Upload to Transloadit (Isolated Sub-task)
        logger.info("Triggering Transloadit upload sub-task", { nodeId, tempOutput });
        const uploadResult = await tasks.triggerAndWait<typeof uploadToTransloaditTask>("upload-to-transloadit", {
            filePath: tempOutput,
            nodeId
        });

        if (!uploadResult.ok) {
            logger.error("Upload sub-task returned error status", { nodeId, error: uploadResult.error });
            throw new Error(`Upload task failed: ${uploadResult.error}`);
        }

        logger.info("Crop workflow completed successfully", { 
          nodeId, 
          finalUrl: uploadResult.output.sslUrl 
        });
        
        return { croppedImageUrl: uploadResult.output.sslUrl };
    } catch (err) {
      logger.error("Crop Task Exception", {
        error: err instanceof Error ? err.message : String(err),
        nodeId
      });
      throw err;
    } finally {
        if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
        if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
    }
  },
});
