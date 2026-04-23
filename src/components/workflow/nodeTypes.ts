import ImageNode from "./nodes/ImageNode";
import VideoNode from "./nodes/VideoNode";
import TextNode from "./nodes/TextNode";
import LLMNode from "./nodes/LLMNode";
import CropImageNode from "./nodes/CropImageNode";
import ExtractFrameNode from "./nodes/ExtractFrameNode";
import ImageGenNode from "./nodes/ImageGenNode";

export const nodeTypes = {
  textNode: TextNode,
  imageNode: ImageNode,
  videoNode: VideoNode,
  llmNode: LLMNode,
  cropNode: CropImageNode,
  frameNode: ExtractFrameNode,
  imageGenNode: ImageGenNode,
};

export const edgeTypes = {};
