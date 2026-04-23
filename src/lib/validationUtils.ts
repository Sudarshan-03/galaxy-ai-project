import { Connection, Node, Edge } from "reactflow";
import { isCircularConnection } from "./dagUtils";

export type HandleDataType = "image" | "video" | "text" | "number" | "unknown";

/**
 * Determines the data type of a handle based on its node type and handle ID.
 */
export const getHandleType = (nodeType: string, handleId: string): HandleDataType => {
  switch (nodeType) {
    case "imageNode":
      if (handleId === "image_url") return "image";
      break;
    case "videoNode":
      if (handleId === "video_url") return "video";
      break;
    case "textNode":
      if (handleId === "text_output" || handleId === "text_input") return "text";
      break;
    case "cropNode":
      if (handleId === "image_url") return "image";
      if (["x_percent", "y_percent", "width_percent", "height_percent"].includes(handleId)) return "text";
      if (handleId === "output") return "image";
      break;
    case "frameNode":
      if (handleId === "video_url") return "video";
      if (handleId === "timestamp") return "text";
      if (handleId === "output") return "image";
      break;
    case "llmNode":
      if (["system_prompt", "user_message"].includes(handleId)) return "text";
      if (handleId === "image_input") return "image";
      if (handleId === "output") return "text";
      break;
    case "imageGenNode":
      if (handleId === "prompt_input") return "text";
      if (handleId === "image_url") return "image";
      break;
  }
  return "unknown";
};


/**
 * Validates if a connection is allowed between two handles.
 */
export const isValidHandleConnection = (connection: any, nodes: Node[], edges: Edge[] = []): boolean => {
  const { source, target, sourceHandle, targetHandle } = connection;
  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);

  if (!sourceNode || !targetNode || !sourceHandle || !targetHandle) {
    return false;
  }

  // logic check: cycle detection
  if (isCircularConnection(source, target, nodes, edges)) {
    return false;
  }

  const sourceType = getHandleType(sourceNode.type || "", sourceHandle);
  const targetType = getHandleType(targetNode.type || "", targetHandle);

  // Strict type checking
  if (sourceType === targetType) return true;
  
  // Allow text to connect to other specific text-based handles
  if (sourceType === "text" && targetType === "text") return true;

  return false;
};
