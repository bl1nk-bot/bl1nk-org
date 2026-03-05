# ⚡ bl1nk Architecture: The Omnipresent AI Workspace (Full Spec)

This document provides a comprehensive architectural blueprint for **bl1nk-org**. It defines the technology stack, multi-layer data flows, and the core **Identity-First & Adapter-Driven** principles required for building a scalable AI Agent Control Plane.

---

## 🧰 Complete Tech Stack

| Category | Technology | Implementation Detail |
| :--- | :--- | :--- |
| **Framework (Web)** | **Next.js 16 + React 19** | Uses App Router, Server Actions, and Vercel Edge Runtime. |
| **Framework (Desktop)** | **Tauri v2 + Vite** | Rust-based core for local-first performance and OS integration. |
| **Language** | **TypeScript & Rust & Python** | Full-stack TS, Rust for Desktop, Python for Modal cloud workers. |
| **UI Components** | **shadcn/ui + Tailwind CSS** | Consistent design language across all platforms. |
| **State Management** | **Zustand** | Centralized stores for UI state, agent logs, and session data. |
| **Database & ORM** | **Neon (Postgres) + Prisma** | Standard monorepo setup located in `packages/db/**`. |
| **Cloud Compute** | **Modal.com** | Serverless execution for Playwright and Agent CLI runners. |
| **Identity Bridge** | **Playwright (Headless/Headed)** | Persistent Cloud Browser for user subscription authentication. |
| **Agent Protocol** | **Model Context Protocol (MCP)** | Standardized tool and context exchange format. |
| **Security** | **AES-256-GCM** | Military-grade encryption for the Identity Vault (Sessions). |
| **Tooling** | **Bun & Just** | High-performance package management and task automation. |

---

## 🔄 Data Flow Architecture

### 1️⃣ Identity & Session Flow (The bl1nk Core IP)
This flow enables "Identity Portability" by capturing and encrypting user sessions from cloud browsers.



```text
React UI (Identity View Component)
  ↓ [Request Identity Session]
Next.js API Routes (Vercel Edge / Auth Middleware)
  ↓ [Invoke Modal Function]
Modal Cloud Worker (Spawn Isolated Playwright Node)
  ↓ [Stream Browser UI via WebSocket/WebRTC]
User (Performs Login on AI Provider Website)
  ↓ [Extract storage_state / cookies]
packages/identity-vault (Encrypt via AES-256-GCM)
  ↓ [Save Encrypted Blob]
packages/db (Prisma Client → Neon PostgreSQL)
  ↓ [Inject into Runtime]
Agent Adapter (Injects session into CLI process on Modal)
```

### 2️⃣ Agent Interaction Flow (The Command Loop)
Standard interaction for task execution and real-time feedback.

```text
React UI (shadcn Terminal/Chat)
  ↓ [Zustand Action: Dispatch Task]
Next.js API Routes (API Gateway)
  ↓ [Lookup Relevant Adapter]
packages/adapters/ (Provider-specific Adapter Implementation)
  ↓ [Trigger Modal Worker]
Modal Worker (Execute Agent CLI e.g., Claude Code)
  ↓ [Stream PTY Output via SSE/WebSocket]
React UI (Real-time xterm-zerolag-input updates)
```

### 3️⃣ Tool Execution & Artifact Flow
Execution of complex tools via MCP and persistent storage of results.

```text
Agent Runtime (Analyzing instruction)
  ↓ [Identify Tool Requirement]
packages/builtin-tool-* (Invoke MCP Tool)
  ↓ [Python Sandbox / Modal Compute]
Cloudflare R2 (Boto3 upload of generated files/images)
  ↓ [Save Metadata]
packages/db (Prisma record of Artifact URL)
  ↓ [Return to UI]
React Render (Display Artifact in workspace)
```

---

## 🔌 The Adapter Engine (Community-Driven Design)

Following the **Chat SDK Adapter Pattern**, `bl1nk` treats every AI provider as a pluggable module.

| Adapter Tier | Description | Examples |
| :--- | :--- | :--- |
| **Official** | Built and maintained by bl1nk-org | `@bl1nk-adapter/claude`, `@bl1nk-adapter/browser` |
| **Vendor** | Built by platform companies | `@resend/bl1nk-adapter` |
| **Community** | Open-source third-party adapters | `matrix-adapter`, `custom-mcp-adapter` |

### Adapter Interface Definition
Each adapter must implement the standard `@bl1nk/sdk` interface:
- `initialize(config)`: Setup credentials and validate session.
- `postMessage(message)`: Send instruction to the agent/platform.
- `handleWebhook(request)`: Process incoming events from providers.
- `encodeThreadId/decodeThreadId`: Map UI threads to platform threads.

---

## 🧱 Key Design Principles

* ✅ **Identity Persistence** – The user's cloud-bound browser session is the primary key for all agent interactions.
* ✅ **Separation of Concerns** – UI (`apps/web`) ↔ Adapters (`packages/adapters`) ↔ Database (`packages/db`).
* ✅ **Type Safety** – Prisma generates full types for the entire monorepo, ensuring data consistency.
* ✅ **Scalability** – Modal allows `bl1nk` to spawn 100+ parallel agents without local hardware limits.
* ✅ **Local-First, Cloud-Ready** – Desktop app works offline; heavy compute is offloaded to Modal via the Adapter Engine.

---

## 📂 Project Structure (Turborepo Standard)



```text
bl1nk-org/
├── apps/
│   ├── web/                 # Next.js 16 Dashboard (Full Feature Set)
│   └── desktop/             # Tauri v2 Desktop App (Rust Core)
├── packages/
│   ├── db/                  # Prisma Monorepo Setup (Neon DB)
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/index.ts     # Exported Singleton Prisma Client
│   ├── sdk/                 # @bl1nk/sdk (Adapter & Plugin Interface)
│   ├── adapters/            # Folder for Vertical Agent Adapters
│   │   ├── shared/          # Utility functions for Adapters
│   │   ├── claude/          # Claude Code Sub-based Adapter
│   │   └── browser/         # Identity Bridge / Cloud Browser Adapter
│   ├── identity-vault/      # Encryption (AES-256) & Session Logic
│   ├── ui/                  # Shared shadcn/ui components
│   └── builtin-tool-*/      # Individual MCP Tool Packages
├── services/
│   └── orchestrator/        # Fastify / Node-based Task Dispatcher
├── modal/
│   └── workers/             # Python logic for Playwright & CLI Runners
├── .justfile                # Task runner commands
└── AGENTS.md                # Agent instruction & context guide
```

---

<p align="center">
  <strong>The remote control for your AI subscriptions. Built for the era of autonomous agents.</strong>
</p>
