# WEAVY: Artistic Intelligence

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Trigger.dev](https://img.shields.io/badge/Powered%20by-Trigger.dev_v3-ff5a00?style=for-the-badge)](https://trigger.dev)
[![Prisma](https://img.shields.io/badge/Database-Prisma_%26_Supabase-1652f3?style=for-the-badge&logo=prisma)](https://prisma.io)

**WEAVY** is a state-of-the-art **Multimodal AI** orchestrator that transforms complex media pipelines into high-performance execution graphs. Powered by advanced **Graph Algorithms** for cycle-free integrity and **Topological Sorting** (Kahn's Algorithm) to manage a dynamic **Ready Queue**, WEAVY pipelines parallelized LLM and FFmpeg tasks with surgical engineering precision.

![WEAVY Canvas Board](./screenshotforgithub.png)

## 🎥 Demo

[![WEAVY Workflow Demo](https://img.youtube.com/vi/x1HhMepOzvE/maxresdefault.jpg)](https://youtu.be/x1HhMepOzvE)

---

## Technical Architecture & Implementation

WEAVY is built on a "Thin Client, Heavy Worker" architecture. The frontend manages the UI state and topological scheduling, while Trigger.dev handles long-running compute-intensive tasks (LLM inference and FFmpeg processing).

### The Brain: Topological Execution Engine
Located in `src/hooks/useGraphExecution.ts`, the engine implements **Kahn's Algorithm** to ensure data integrity:
1.  **Strict Validation**: Before execution, it verifies that all "Input" nodes (Text, Image, Video) are in a "Ready" state (locked or uploaded).
2.  **Parallel Batching**: Nodes are grouped by dependency layers. All independent nodes in a layer are triggered concurrently using `Promise.all`.
3.  **Data Propagation**: Outputs from parent nodes are dynamically injected into the payloads of child nodes via handle mapping.

### Infrastructure: Trigger.dev v3 & Cloud Media
- **Background Jobs**: Every compute-heavy node (Crop, Extract Frame, LLM) runs as a Trigger.dev task. This prevents Vercel timeout limits and provides robust retry logic.
- **FFmpeg Excellence**: We use the native Trigger.dev FFmpeg extension for precise image cropping and frame extraction, ensuring consistent results in a serverless environment.
- **Transloadit CDN**: Processed assets are uploaded via Transloadit sub-tasks, providing a high-availability CDN for immediate frontend preview.

---

## Architecture in Action: Product Marketing Kit Case Study

To understand how WEAVY handles complex dependencies, let's look at the **Product Marketing Kit Generator** workflow:

### The Multi-Branch Pipeline
1.  **Branch A (Visual Identity)**: 
    - **Step 1**: User uploads a product photo (**Image Node**).
    - **Step 2**: The **Crop Node** triggers an FFmpeg mission to focus on the product.
    - **Step 3**: **LLM Node #1** receives the cropped photo + text details to generate a technical description.
2.  **Branch B (Motion Capture)**:
    - **Step 1**: User uploads a demo video (**Video Node**).
    - **Step 2**: The **Frame Node** extracts a high-quality "hero frame" from 50% into the video.
3.  **The Convergence (Final Synthesis)**:
    - **LLM Node #2** acts as the "Social Media Manager". It **waits** for both Branch A and Branch B to complete.
    - **Inputs**: It aggregates the description from LLM #1, the cropped photo from Branch A, and the hero frame from Branch B.
    - **Output**: A visually-aware, context-rich marketing post.

### Execution Timeline
| Phase | Branch A (Parallel) | Branch B (Parallel) | Convergence |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Upload Image + Text | Upload Video | (Idle) |
| **Phase 2** | Crop Image Task | Extract Frame Task | (Idle) |
| **Phase 3** | LLM Node #1 (Description) | (Complete) | (Idle) |
| **Phase 4** | (Complete) | (Complete) | **LLM Node #2 (Final Post)** |

> [!NOTE]
> Branch A and B run **simultaneously**. The Kahn's Algorithm engine ensures the "Social Media Manager" node only fires once every upstream dependency is resolved.

---

## Advanced Features & Capabilities

### Specialized Node Ecosystem
Every node in WEAVY is a precision-engineered micro-service. When connected, manual inputs are automatically disabled, and data flows through high-speed cloud triggers.

| Node | Input Handles | Output Handles | "Behind the Scenes" Logic |
| :--- | :--- | :--- | :--- |
| **Text** | *(None)* | `text_output` | Simple string buffer for system prompts or static manual data. |
| **Upload Image** | *(Manual File)* | `image_url` | Uses **Transloadit SDK** to upload and provide a high-speed CDN URL. |
| **Upload Video** | *(Manual File)* | `video_url` | Secure cloud upload for large media files with instant player preview. |
| **Crop Image** | `image_url`, `x`, `y`, `w`, `h` | `output` (Cropped) | **Trigger.dev** machine runs FFmpeg `complexFilter` with `crop` parameters. |
| **Extract Frame** | `video_url`, `timestamp` | `output` (Frame) | FFmpeg fast-seeking (`-ss`) extracts a high-quality JPEG at the exact millisecond. |
| **LLM Generate** | `system`, `user`, `images` | `output` (Text) | Orchestrates **Google Gemini 3 Flash** with multimodal vision context. |

### Pro-Grade Canvas Controls
- **Drag & Drop Workflow**: Add nodes by dragging them from the tactical sidebar onto the blueprint grid.
- **Smart Interaction Modes**:
  - `Select Mode` (V): Standard box selection for grouping and moving nodes.
  - `Hand/Pan Mode` (H): Effortless navigation across expansive, multi-branch graphs.
- **Precision Zooming**: Choose from 25% to 200% zoom levels or use `Fit View` to instantly re-center your entire workspace.
- **Infinite Undo/Redo**: Full state persistence using `Zundo`, giving you the freedom to experiment without risk.

### Data Portability: JSON Snapshots
- **Export Selected**: Highlights specific nodes and saves their internal state, position, and connections into a serialized JSON bundle.
- **Dynamic Import**: Import any WEAVY JSON. The engine automatically handles ID re-mapping and position offseting to merge external workflows into your current session.

### Strategic Audit Log (Right Sidebar)
WEAVY maintains a surgical record of every execution for transparency and debugging. Clicking a run in the history panel reveals the **In-Depth Execution Trace**:
- **Visual Node Map**: A mini-representation of which nodes were part of the specific run.
- **Granular Timing**: See exactly how many seconds each node took to execute (e.g., "Crop Task: 1.82s").
- **Handoff Inspection**: 
  - **Inbound Data**: View the exact JSON/URL payload a node received from its parents.
  - **Outbound Data**: Inspect the resulting URLs or AI text generated, with direct links to "Open Asset Source".
- **Status Badges**: Color-coded badges (Emerald ✅ for success, Red ❌ for failure, Amber ⏳ for running) provide instant pulse checks on pipeline health.

---

## Project Structure & Route Logic

### Key Routes
- `/`: Marketing landing page with high-impact GSAP animations and Clerk authentication entry points.
- `/canvas`: The core workflow builder. Protected by Clerk middleware.
- `/api/trigger/[task]`: API routes that bridge the frontend to Trigger.dev tasks.
- `/api/history/`: Endpoints for persisting and retrieving the audit log from Supabase.

### Directory Breakdown
- `src/hooks/`: Contains `useGraphExecution.ts` (the core scheduler) and `useStore.ts` (Zustand state management).
- `src/components/workflow/nodes/`: Implementation of the 6 specialized node types. Uses `NodeWrapper.tsx` for consistent status tracking and UI styling.
- `src/trigger/`: The serverless logic for Image Cropping, Frame Extraction, and Gemini LLM orchestration.
- `src/lib/`: Unified utility functions for DAG cycle detection (`dagUtils.ts`) and type-safe connection validation (`validationUtils.ts`).
- `scripts/`: Internal utilities like Gemimi model listing (`list-gemini-models.js`).

---

## UI & Aesthetics
WEAVY features a premium, tactical aesthetic:
- **Interaction**: Custom drag-and-drop system, smooth pan/zoom, and a persistent MiniMap.
- **Feedback**: Pulsating glow effects during node execution and real-time status badges (Running, Completed, Error).
- **Libraries Used**:
  - **React Flow**: Workflow canvas engine.
  - **Framer Motion**: Micro-interactions and layout transitions.
  - **GSAP**: High-performance marketing animations.
  - **Radix UI**: Accessible primitives for dropdowns, dialogs, and tooltips.
  - **Lucide React**: Tactical icon system.
  - **Sonner**: Premium toast notifications.

---

## Environment Variables (`.env.example`)

To run this project, you will need to add the following variables to your `.env` file:

```text
# AI API Keys
GEMINI_API_KEY=your_gemini_api_key_here

# Trigger.dev Keys
TRIGGER_SECRET_KEY=your_trigger_secret_key_here
TRIGGER_PROJECT_REF=your_project_ref_here
TRIGGER_API_URL=https://api.trigger.dev

# Transloadit Keys (Media Processing)
TRANSLOADIT_KEY=your_transloadit_key_here
TRANSLOADIT_SECRET=your_transloadit_secret_here
TEMPLATE_ID=your_template_id_here

# Clerk Auth Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Supabase Keys
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database URL (Prisma)
DATABASE_URL="postgres://user:password@host:6543/postgres?pgbouncer=true"
```

---

## Troubleshooting Guide

| Issue | Potential Cause | Resolution |
| :--- | :--- | :--- |
| **Nodes Not Executing** | Trigger.dev worker not running locally. | Run `npx trigger.dev@latest dev` in a separate terminal. |
| **Database Connection Failure** | IP not whitelisted in Supabase. | Add `0.0.0.0/0` to your Supabase allowed IP ranges. |
| **FFmpeg Errors** | Missing extension in `trigger.config.ts`. | Ensure the `ffmpeg()` extension is included in the build config. |
| **Clerk Redirect Loops** | Misconfigured `middleware.ts`. | Ensure `NEXT_PUBLIC_CLERK_SIGN_IN_URL` is set correctly in `.env`. |

---

##  Contributing Guide

1. **Feature Requests**: Open an issue describing the new Node type or UI improvement you'd like to see.
2. **Branching**: Create a feature branch (`git checkout -b feature/amazing-feature`).
3. **Coding Standards**: Ensure all new components use the `NodeWrapper` and follow the tactical military-industrialism design system.
4. **Testing**: Run a full graph execution on the "Product Marketing Kit" sample before submitting a PR.

---
*Developed with engineering excellence. Powered by AI.*
