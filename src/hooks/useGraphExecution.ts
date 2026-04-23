import { useStore } from "@/store/useStore";
import { workflowService } from "@/services/workflowService";
import { toast } from "sonner";
import { useCallback } from "react";

/**
 * Hook to manage complex graph execution using Kahn's Algorithm (Topological Sort).
 * Supports parallel execution of independent branches.
 */
export const useGraphExecution = () => {
  const { nodes, edges, updateNodeStatus, setExecutionResult, resetExecution, updateNodeData } = useStore();

  const executeGraph = useCallback(async () => {
    // 1. Identify Selected Nodes & Edges
    const selectedNodes = nodes.filter(n => n.selected);
    if (selectedNodes.length === 0) {
      toast.error("No nodes selected for execution. Click a node to select it, or Shift+Drag to select multiple.");
      return;
    }

    const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
    const relevantEdges = edges.filter(e => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target));

    // 2. Phase A: Strict Validation Protocol
    const latestNodesAtStart = useStore.getState().nodes;
    for (const node of selectedNodes) {
      const latestNode = latestNodesAtStart.find((n: any) => n.id === node.id);
      if (!latestNode) continue;

      const isInputNode = ['textNode', 'imageNode', 'videoNode'].includes(latestNode.type || "");
      
      // Strict Check: Node MUST be 'Ready' (Locked for Text, Uploaded for Files)
      if (isInputNode) {
        if (latestNode.type === 'textNode') {
          if (!latestNode.data.text || latestNode.data.text.trim() === "") {
             toast.error(`Protocol Violation: Text node "${latestNode.data.label || latestNode.id}" cannot be empty.`);
             return;
          }
        } else if (!latestNode.data.isReady) {
          toast.error(`Protocol Violation: "${latestNode.data.label || latestNode.id}" must be COMPLETED (Uploaded) before pipeline execution.`);
          return;
        }
      }

      // LLM mandatory check (user_message)
      if (latestNode.type === 'llmNode') {
        const hasIncomingUserMsg = edges.some(e => e.target === latestNode.id && e.targetHandle === 'user_message');
        const hasFallbackText = !!(latestNode.data.text || latestNode.data.userMessage);
        
        if (!hasIncomingUserMsg && !hasFallbackText) {
           toast.error(`LLM Error: "${latestNode.data.label || 'llm'}" requires a 'User Message' connection or internal manual content.`);
           return;
        }
      }
    }

    // 3. Phase B: Build Dependency Graph
    const adjacencyList: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};

    selectedNodes.forEach(node => {
      adjacencyList[node.id] = [];
      inDegree[node.id] = 0;
    });

    relevantEdges.forEach(edge => {
      if (adjacencyList[edge.source]) {
        adjacencyList[edge.source].push(edge.target);
        inDegree[edge.target]++;
      }
    });

    // Reset execution state ONLY for selected nodes to preserve cached data for non-selected parents
    resetExecution(Array.from(selectedNodeIds));
    
    // Initial Status Orchestration: Set all selected nodes to 'waiting' 
    const initialQueue = selectedNodes.filter(node => inDegree[node.id] === 0).map(node => node.id);
    const initialQueueSet = new Set(initialQueue);
    selectedNodes.forEach(node => {
      if (!initialQueueSet.has(node.id)) {
        updateNodeStatus(node.id, 'waiting');
      }
    });

    toast.info(`Initializing flow for ${selectedNodes.length} node(s)...`);

    // 4. Phase C: Parallel Execution Loop
    let queue = [...initialQueue];
    const processedNodes = new Set<string>();
    const executionStartTime = Date.now();
    const trackingData: any[] = [];

    console.log(`[Execution] Starting Pipeline... Batch 0: ${queue.join(', ')}`);

    try {
      let batchCount = 0;
      while (queue.length > 0) {
        batchCount++;
        const currentBatch = [...queue];
        queue = [];

        console.log(`[Execution] Processing Batch ${batchCount}: ${currentBatch.length} node(s)`);

        await Promise.all(currentBatch.map(async (nodeId) => {
          const latestNodes = useStore.getState().nodes; 
          const node = latestNodes.find((n: any) => n.id === nodeId);
          if (!node) return;

          console.log(`[Execution] Node ${nodeId} (${node.type}) -> STARTED`);
          const startTime = new Date();
          updateNodeStatus(nodeId, 'running');

          try {
            let result: any = null;
            const currentInputs: any = {};

            const getParentResult = (handleId: string) => {
              const edge = edges.find(e => e.target === nodeId && e.targetHandle === handleId);
              if (!edge) return null;
              
              const parent = latestNodes.find((n: any) => n.id === edge.source);
              if (!parent) return null;

              const parentData = parent.data || {};
              const parentExecution = parentData.executionResult || {};

              let val = null;
              if (parent.type === 'llmNode') {
                 val = parentExecution.responseText || parentData.responseText;
              } else if (parent.type === 'imageGenNode') {
                 val = parentExecution.imageUrl || parentData.imageUrl;
              } else {
                switch (edge.sourceHandle || handleId) {
                  case 'image_url': val = parentExecution.imageUrl || parentExecution.croppedImageUrl || parentExecution.frameUrl || parentData.imageUrl; break;
                  case 'video_url': val = parentExecution.videoUrl || parentData.videoUrl; break;
                  case 'text_output': val = parentExecution.text || parentData.text; break;
                  case 'output': val = parentExecution.croppedImageUrl || parentExecution.frameUrl || parentExecution.responseText || parentExecution.text || parentData.responseText || parentData.text || parentData.imageUrl || parentData.videoUrl; break;
                  default:
                    if (handleId.includes('_percent')) {
                      val = parentExecution.text || parentData.text || parentData[handleId.replace('_percent', '')];
                    } else {
                      val = parentExecution.text || parentData.text;
                    }
                }
              }
              currentInputs[handleId] = { value: val, fromNodeId: parent.id };
              return val;
            };

            const getMultiParentResults = (handleId: string) => {
              const incomingEdges = edges.filter(e => e.target === nodeId && e.targetHandle === handleId);
              const metadata: any[] = [];
              const resultsArr = incomingEdges.map(e => {
                const parent = latestNodes.find((n: any) => n.id === e.source);
                if (!parent) return null;
                const parentData = parent.data || {};
                const parentExecution = parentData.executionResult || {};
                
                let val = null;
                if (parent.type === 'llmNode') val = parentExecution.responseText || parentData.responseText;
                else if (e.sourceHandle === 'image_url' || handleId === 'image_input') val = parentExecution.imageUrl || parentExecution.croppedImageUrl || parentExecution.frameUrl || parentData.imageUrl;
                else val = parentExecution.text || parentData.text;

                metadata.push({ value: val, fromNodeId: parent.id });
                return val;
              }).filter(Boolean);

              const val = ['system_prompt', 'user_message', 'text_input'].includes(handleId) ? resultsArr.join('\n\n') : resultsArr;
              currentInputs[handleId] = { value: val, metadata };
              return val;
            };

            switch (node.type) {
              case 'textNode': {
                const incomingText = getParentResult('text_input');
                if (incomingText !== null && incomingText !== undefined) {
                  result = { text: incomingText };
                } else {
                  result = { text: node.data.text };
                }
                break;
              }
              case 'imageNode':
                result = { imageUrl: node.data.imageUrl };
                break;
              case 'videoNode':
                result = { videoUrl: node.data.videoUrl };
                break;
              case 'cropNode': {
                const imageUrl = getParentResult('image_url') || node.data.imageUrl;
                const cropRes = await workflowService.cropImage({
                  imageUrl,
                  x: getParentResult('x_percent') || node.data.x || "0",
                  y: getParentResult('y_percent') || node.data.y || "0",
                  width: getParentResult('width_percent') || node.data.width || "100",
                  height: getParentResult('height_percent') || node.data.height || "100",
                  nodeId
                });
                if (!cropRes.success) throw new Error(cropRes.error);
                result = cropRes.data;
                break;
              }
              case 'frameNode': {
                const videoUrl = getParentResult('video_url') || node.data.videoUrl;
                const frameRes = await workflowService.extractFrame({
                  videoUrl,
                  timestamp: getParentResult('timestamp') || node.data.timestamp || "0.0",
                  nodeId
                });
                if (!frameRes.success) throw new Error(frameRes.error);
                result = frameRes.data;
                break;
              }
              case 'llmNode': {
                const finalUserMessage = getMultiParentResults('user_message') || node.data.userMessage || node.data.text;
                if (!finalUserMessage || finalUserMessage.trim() === "") throw new Error(`Execution Error: "${node.data.label}" has no user message.`);
                const llmRes = await workflowService.generateLLM({
                  systemPrompt: getParentResult('system_prompt') || node.data.systemPrompt,
                  userMessage: finalUserMessage,
                  imageUrls: (getMultiParentResults('image_input') as string[]) || [],
                  model: node.data.model || "gemini-2.5-flash",
                  nodeId
                });
                if (!llmRes.success) throw new Error(llmRes.error);
                result = llmRes.data;
                break;
              }
              case 'imageGenNode': {
                const prompt = getParentResult('prompt_input') || node.data.manualPrompt || node.data.text;
                if (!prompt || (typeof prompt === 'string' && prompt.trim() === "")) {
                  throw new Error(`Image Gen Error: "${node.data.label}" requires a prompt. Connect an LLM or enter a manual prompt.`);
                }
                const imgRes = await workflowService.generateImage({
                  prompt: typeof prompt === 'string' ? prompt : String(prompt),
                  model: node.data.model || "imagen-3.0-generate-002",
                  aspectRatio: node.data.aspectRatio || "1:1",
                  nodeId
                });
                if (!imgRes.success) throw new Error(imgRes.error);
                result = imgRes.data;
                break;
              }
            }

            const endTime = new Date();
            const duration = (endTime.getTime() - startTime.getTime()) / 1000;
            console.log(`[Execution] Node ${nodeId} -> COMPLETED (${duration.toFixed(2)}s)`);
            
            setExecutionResult(nodeId, result);
            processedNodes.add(nodeId);
            
            trackingData.push({
              nodeId,
              nodeLabel: node.data.label || nodeId,
              nodeType: node.type,
              status: 'completed',
              inputs: currentInputs,
              outputs: result,
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              duration
            });
          } catch (err: any) {
            const endTime = new Date();
            const duration = (endTime.getTime() - startTime.getTime()) / 1000;
            console.error(`[Execution] Node ${nodeId} -> FAILED (${duration.toFixed(2)}s): ${err.message}`);
            updateNodeStatus(nodeId, 'error');
            trackingData.push({
              nodeId,
              nodeLabel: node.data.label || nodeId,
              nodeType: node.type,
              status: 'failed',
              inputs: {},
              outputs: {},
              error: err.message,
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              duration
            });
            throw err;
          }
        }));

        currentBatch.forEach(nodeId => {
          (adjacencyList[nodeId] || []).forEach(childId => {
            inDegree[childId]--;
            if (inDegree[childId] === 0) {
               console.log(`[Execution] Node ${childId} -> UNLOCKED (Dependency ${nodeId} finished)`);
               queue.push(childId);
            }
          });
        });
      }

      console.log(`[Execution] Pipeline finished in ${(Date.now() - executionStartTime) / 1000}s`);
      const totalDuration = (Date.now() - executionStartTime) / 1000;
      const scope = selectedNodes.length === 1 ? 'single' : (processedNodes.size === nodes.length ? 'full' : 'partial');
      
      await fetch('/api/history/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          scope,
          duration: totalDuration,
          nodeExecutions: trackingData,
          nodesSnapshot: nodes,
          edges: edges
        })
      });

      toast.success(`Pipeline completed: ${processedNodes.size} nodes processed.`);
    } catch (error: any) {
      console.error("Graph execution halted:", error);
      const totalDuration = (Date.now() - executionStartTime) / 1000;
      const scope = selectedNodes.length === 1 ? 'single' : 'partial';

      await fetch('/api/history/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'failed',
          scope: 'partial',
          duration: totalDuration,
          nodeExecutions: trackingData,
          nodesSnapshot: nodes,
          edges: edges
        })
      });

      toast.error(`Execution Halted: ${error.message}`);
    }
  }, [nodes, edges, resetExecution, updateNodeStatus, setExecutionResult]);

  return { executeGraph };
};
