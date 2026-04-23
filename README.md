# WEAVY: Artistic Intelligence

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Trigger.dev](https://img.shields.io/badge/Powered%20by-Trigger.dev_v3-ff5a00?style=for-the-badge)](https://trigger.dev)
[![Prisma](https://img.shields.io/badge/Database-Prisma_%26_Neon-1652f3?style=for-the-badge&logo=prisma)](https://prisma.io)
[![Next.js](https://img.shields.io/badge/Framework-Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)

**WEAVY** is a state-of-the-art **Multimodal AI** workflow orchestrator that transforms complex media pipelines into high-performance visual execution graphs. Powered by advanced **Graph Algorithms** for cycle-free integrity and **Topological Sorting** (Kahn's Algorithm) to manage a dynamic ready queue, WEAVY pipelines parallelized LLM and FFmpeg tasks with precision.

![WEAVY Canvas Board](./screenshotforgithub.png)

---

## Technical Architecture & Implementation

WEAVY is built on a **"Thin Client, Heavy Worker"** architecture. The frontend manages UI state and topological scheduling, while Trigger.dev handles long-running, compute-intensive tasks (LLM inference and FFmpeg processing).

### The Brain: Topological Execution Engine

Located in `src/hooks/useGraphExecution.ts`, the engine implements **Kahn's Algorithm** to ensure data integrity:

1. **Strict Validation** — Before execution, it verifies that all input nodes (Text, Image, Video) are in a "Ready" state.
2. **Parallel Batching** — Nodes are grouped by dependency layers. All independent nodes in a layer are triggered concurrently via `Promise.all`.
3. **Data Propagation** — Outputs from parent nodes are dynamically injected into the payloads of child nodes via handle mapping.

### Infrastructure: Trigger.dev v3 & Cloud Media

- **Background Jobs** — Every compute-heavy node (Crop, Extract Frame, LLM) runs as a Trigger.dev task, preventing Vercel timeouts and providing robust retry logic.
- **FFmpeg Processing** — Uses the native Trigger.dev FFmpeg extension for image cropping and frame extraction in a serverless environment.
- **Transloadit CDN** — Processed assets are uploaded via Transloadit sub-tasks, providing a high-availability CDN URL for immediate frontend preview.

---

## Architecture in Action: Product Marketing Kit Case Study

### The Multi-Branch Pipeline

1. **Branch A (Visual Identity)**
   - User uploads a product photo (**Image Node**)
   - The **Crop Node** triggers an FFmpeg task to focus on the product
   - **LLM Node #1** receives the cropped photo + text details to generate a description

2. **Branch B (Motion Capture)**
   - User uploads a demo video (**Video Node**)
   - The **Frame Node** extracts a high-quality "hero frame" from 50% into the video

3. **The Convergence (Final Synthesis)**
   - **LLM Node #2** waits for both Branch A and B to complete, then aggregates all outputs into a visually-aware marketing post.

### Execution Timeline

| Phase | Branch A (Parallel) | Branch B (Parallel) | Convergence |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Upload Image + Text | Upload Video | (Idle) |
| **Phase 2** | Crop Image Task | Extract Frame Task | (Idle) |
| **Phase 3** | LLM Node #1 (Description) | (Complete) | (Idle) |
| **Phase 4** | (Complete) | (Complete) | **LLM Node #2 (Final Post)** |

> Branch A and B run **simultaneously**. Kahn's Algorithm ensures the final node only fires once every upstream dependency is resolved.

---

## Node Ecosystem

Every node is a precision-engineered micro-service. When connected, manual inputs are automatically disabled and data flows through cloud triggers.

| Node | Input Handles | Output Handles | Logic |
| :--- | :--- | :--- | :--- |
| **Text** | *(None)* | `text_output` | String buffer for prompts or static data |
| **Upload Image** | *(Manual File)* | `image_url` | Transloadit SDK upload → CDN URL |
| **Upload Video** | *(Manual File)* | `video_url` | Secure cloud upload with player preview |
| **Crop Image** | `image_url`, `x`, `y`, `w`, `h` | `output` | Trigger.dev FFmpeg `crop` filter |
| **Extract Frame** | `video_url`, `timestamp` | `output` | FFmpeg fast-seek JPEG extraction |
| **LLM Generate** | `system`, `user`, `images` | `output` | Google Gemini Flash with multimodal vision |
| **Image Generate** | `prompt` | `output` | AI image generation from text prompt |

---

## Canvas Features

- **Drag & Drop** — Add nodes by dragging from the sidebar onto the canvas
- **Select Mode** (`V`) / **Pan Mode** (`H`) — Standard interaction modes
- **Precision Zooming** — 25%–200% zoom levels with Fit View
- **Infinite Undo/Redo** — Full state persistence via `Zundo`
- **JSON Export/Import** — Export node snapshots, import and merge external workflows
- **Execution History** — Right sidebar audit log with per-node timing, input/output inspection, and status badges

---

## Project Structure

```
src/
├── app/
│   ├── (marketing)/        # Landing page (GSAP animations, Clerk auth)
│   ├── (workspace)/        # Protected canvas workspace
│   │   └── canvas/
│   └── api/
│       ├── trigger/        # Trigger.dev bridge routes (llm, crop, frame)
│       ├── image-generate/ # Image generation route
│       └── history/        # Audit log persistence (save & list)
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   └── workflow/
│       ├── nodes/          # 7 specialized node components
│       ├── WorkflowCanvas.tsx
│       ├── NodeSidebar.tsx
│       ├── HistorySidebar.tsx
│       └── ...
├── hooks/
│   ├── useGraphExecution.ts   # Kahn's Algorithm scheduler
│   ├── useConnectedData.ts
│   └── useIsHandleConnected.ts
├── lib/
│   ├── dagUtils.ts         # DAG cycle detection
│   ├── validationUtils.ts  # Zod-based type-safe validation
│   └── prisma.ts           # Singleton Prisma client (pg adapter)
├── services/
│   └── workflowService.ts  # API client with async polling logic
├── store/
│   └── useStore.ts         # Zustand store with zundo undo/redo
└── trigger/
    ├── llmGenerate.ts      # Gemini LLM task
    ├── cropImage.ts        # FFmpeg crop task
    └── extractFrame.ts     # FFmpeg frame extraction task
```

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Auth** | Clerk |
| **Database** | Neon Serverless Postgres + Prisma ORM |
| **Background Jobs** | Trigger.dev v3 |
| **Media Processing** | FFmpeg (via Trigger.dev extension) |
| **Media CDN** | Transloadit |
| **AI** | Google Gemini Flash (multimodal) |
| **Canvas** | React Flow |
| **State** | Zustand + Zundo |
| **Animations** | Framer Motion, GSAP |
| **UI Primitives** | Radix UI, shadcn/ui |
| **Styling** | Tailwind CSS v4 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Trigger.dev](https://trigger.dev) account
- A [Clerk](https://clerk.com) account
- A [Neon](https://neon.tech) serverless Postgres database
- A [Transloadit](https://transloadit.com) account
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)

### Installation

```bash
# Clone the repo
git clone https://github.com/Sudarshan-03/galaxy-ai-project.git
cd galaxy-ai-project

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your credentials in .env

# Run Prisma migrations
npx prisma migrate dev

# Start the Next.js dev server
npm run dev

# In a separate terminal, start the Trigger.dev worker
npx trigger.dev@latest dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the following:

```env
# Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Trigger.dev
TRIGGER_SECRET_KEY=your_trigger_secret_key_here
TRIGGER_PROJECT_REF=your_project_ref_here
TRIGGER_API_URL=https://api.trigger.dev

# Transloadit (Media Processing)
TRANSLOADIT_KEY=your_transloadit_key_here
TRANSLOADIT_SECRET=your_transloadit_secret_here
TEMPLATE_ID=your_template_id_here
NEXT_PUBLIC_TRANSLOADIT_KEY=your_transloadit_key_here
NEXT_PUBLIC_TEMPLATE_ID=your_template_id_here

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Neon Serverless Postgres
DATABASE_URL="postgres://user:password@host:port/database?sslmode=require&pool=true"
```

---

## Troubleshooting

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **Nodes not executing** | Trigger.dev worker not running | Run `npx trigger.dev@latest dev` in a separate terminal |
| **Database connection failure** | Wrong connection string | Check `DATABASE_URL` format — Neon requires `sslmode=require` |
| **FFmpeg errors** | Missing extension in config | Ensure `ffmpeg()` extension is included in `trigger.config.ts` |
| **Clerk redirect loops** | Misconfigured middleware | Verify `NEXT_PUBLIC_CLERK_SIGN_IN_URL` is set in `.env` |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

*Developed with engineering excellence. Powered by AI.*
