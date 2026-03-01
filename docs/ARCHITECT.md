# Architecture Overview: The Omnipresent AI Workspace

This document provides a detailed overview of the system architecture, including the technology stack, data flow, and core design principles.

---

## 🧰 Complete Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework (Web)** | Next.js 16 + React 19 (includes Vercel Edge API) |
| **Framework (Desktop)** | Tauri v2 + Vite |
| **Language** | TypeScript (frontend), Rust (desktop core), Python (Modal cloud) |
| **UI Components** | shadcn/ui, Tailwind CSS |
| **State Management** | Zustand |
| **Data Validation** | Zod |
| **Workspace / Tooling** | Bun (package manager), Just (task runner) |
| **Cloud Compute** | Modal (integrated via packages) |
| **API Gateway** | Vercel Edge Functions (integrated in `web/`) |
| **Database** | Neon (PostgreSQL) + Drizzle ORM (in `packages/`) |
| **Object Storage** | Cloudflare R2 + Boto3 |
| **Agent Protocol** | Model Context Protocol (MCP) |
| **Plugin Bundler** | esbuild (for Obsidian) |

---

## 🔄 Data Flow Architecture

### 1️⃣ Agent Interaction Flow (Standard conversation)
```
React UI (shadcn)
  ↓
Zustand Action (update UI state)
  ↓
Next.js API Routes (Vercel API Gateway + Auth)
  ↓
Agent Runtime via Packages (LLM processing / Modal compute)
  ↓
Server-Sent Events (SSE) streamed back
  ↓
React UI (real-time updates)
```

### 2️⃣ Tool Execution Flow
```
React UI
  ↓
Next.js API Routes (Vercel Edge)
  ↓
Agent Runtime (command analysis)
  ↓
packages/builtin-tool-* (invoke MCP tool / Tool Registry)
  ↓
Python Interpreter Sandbox (code execution / data fetch via Modal)
  ↓
Return result / feed back to agent context
```

### 3️⃣ Artifact & Storage Flow (Long‑term data)
```
Python Interpreter Sandbox / Agent Runtime (generate file/image)
  ↓
packages/cloud-storage (Boto3 upload to Cloudflare R2)
  ↓
packages/database (save URL to Neon DB via Drizzle)
  ↓
URL returned to Zustand store (via frontend)
  ↓
React Render (display artifact)
```

---

## 🧱 Key Principles

*   ✅ **Separation of Concerns** – Frontend (UI) ↔ Packages (logic & compute) ↔ Database/Storage.
*   ✅ **Scalability** – Each layer can scale independently.
*   ✅ **Type Safety** – Full TypeScript across frontend and backend logic.
*   ✅ **Modularity** – Packages for shared code and isolated cloud components.
*   ✅ **Local-First** – Desktop app works offline.
*   ✅ **Cloud-Ready** – Seamless integration with Modal and Vercel Edge.
