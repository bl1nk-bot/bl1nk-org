# ⚡ bl1nk Architecture: The Omnipresent AI Workspace

This document provides a detailed overview of the system architecture, including the technology stack, data flow, and the core **Identity-First & Adapter-Driven** design principles.

---

## 🧰 Complete Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework (Web)** | **Next.js 16 + React 19** (Vercel Edge API) |
| **Framework (Desktop)** | Tauri v2 + Vite |
| **Language** | TypeScript, Rust (Desktop), Python (Modal Workers) |
| **UI Components** | **shadcn/ui**, Tailwind CSS |
| **State Management** | Zustand |
| **Database** | Neon (PostgreSQL) |
| **ORM** | **Prisma** (Standard Monorepo Setup in `packages/db`) |
| **Cloud Compute** | Modal (Serverless Execution Layer) |
| **Identity Bridge** | **Playwright (on Modal)** for Cloud Browser Persistence |
| **Adapter Interface** | **@bl1nk/sdk** (Modular Agent Adapters) |
| **Object Storage** | Cloudflare R2 (Artifacts) + Modal NFS (Session Cache) |
| **Agent Protocol** | Model Context Protocol (MCP) |
| **Security** | **AES-256-GCM** for Identity Vault encryption |

---

## 🔄 Data Flow Architecture

### 1️⃣ Identity & Session Flow (The bl1nk Special)


```
React UI (Identity View)
  ↓
Next.js API (Request Cloud Browser Session)
  ↓
Modal Cloud Worker (Spawn Playwright Instance)
  ↓
User Login (Visual Stream via WebSocket/WebRTC)
  ↓
packages/identity-vault (Extract & Encrypt Cookies)
  ↓
packages/db (Save Encrypted Session Blob via Prisma)
  ↓
Agent Adapter (Inject session into CLI Environment)
```

### 2️⃣ Agent Interaction Flow
```
React UI (shadcn)
  ↓
Zustand Action (UI State Update)
  ↓
Next.js API Routes (Vercel Edge Gateway)
  ↓
Agent Adapter (Provider-specific Logic)
  ↓
Modal Worker (CLI Execution with Injected Identity)
  ↓
SSE / WebSocket (Real-time logs) → React UI
```

---

## 🧱 Key Principles

* 🚀 **Identity Portability** – Login once via Cloud Browser, run anywhere (Web, Mobile, Desktop) without re-authenticating.
* 🔌 **Adapter-Driven Architecture** – Adding a new Agent (Claude, Gemini, Qwen) is as simple as building a new package under `packages/adapters/`.
* 🛡️ **Zero-Knowledge Vault** – User sessions are encrypted at rest via AES-256-GCM.
* ✅ **Type-Safe Database** – Centralized Prisma client in `packages/db` shared across all apps and services.
* ✅ **Local-First, Cloud-Empowered** – Desktop app handles local tasks, while heavy agent workloads offload to Modal.

---

## 📂 Project Structure (Turborepo)



```text
bl1nk-org/
├── apps/
│   ├── web/                 # Next.js 16 Dashboard
│   └── desktop/             # Tauri v2 App
├── packages/
│   ├── db/                  # Prisma Schema & Shared Client
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/index.ts
│   ├── sdk/                 # @bl1nk/sdk (Adapter Interface)
│   ├── adapters/            # Vertical Agent Adapters (Claude, Gemini, Browser)
│   ├── identity-vault/      # Session Encryption Logic
│   └── ui/                  # Shared shadcn/ui components
├── services/
│   └── orchestrator/        # Fastify / Edge API (The Dispatcher)
└── modal/
    └── workers/             # Python logic for Playwright & CLI Runners
```

---

<p align="center">
  <strong>The remote control for your AI subscriptions. Built for the era of autonomous agents.</strong>
</p>
