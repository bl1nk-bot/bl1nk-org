---
name: project-overview
description: Complete project architecture and structure guide for bl1nk-org monorepo. Use when exploring the codebase, understanding project organization, finding files, or needing comprehensive architectural context. Triggers on architecture questions, directory navigation, "where is X", "how does X work", adding new features, or understanding data flow.
---

# ⚡ Project Overview: bl1nk-org Monorepo

**Local-first AI agent workspace with cloud-native identity enhancement.**

A high-performance monorepo designed for the era of autonomous agents, featuring a unique **Identity-First Adapter Engine** that allows users to bring their own AI subscriptions via cloud-bound browsers.

---

## 📦 Tech Stack

| Layer | Technology | Implementation Detail |
|-------|-----------|-----------------------|
| **Web Framework** | **Next.js 16 + React 19** | App Router, Server Actions, Vercel Edge Runtime. |
| **Desktop Framework**| **Tauri v2 + Vite** | Rust-based core for local-first performance. |
| **Language** | TypeScript, Rust, Python | TS (Frontend), Rust (Desktop), Python (Modal Workers). |
| **UI Components** | **shadcn/ui + Tailwind CSS v4** | Shared via `@bl1nk/ui` package. |
| **State Management** | **Zustand 5.0** | Centralized stores for UI, Agent logs, and Auth. |
| **Database & ORM** | **Neon (Postgres) + Prisma** | Centralized in `packages/db` for monorepo-wide safety. |
| **Cloud Compute** | **Modal.com** | Serverless execution for Playwright & Agent CLI. |
| **Identity Bridge** | **Playwright (on Modal)** | Persistent Cloud Browser for session portability. |
| **Agent Protocol** | **Model Context Protocol (MCP)** | Standardized tool and context exchange format. |
| **Security** | **AES-256-GCM** | Military-grade encryption for the Identity Vault. |
| **Package Manager** | **Bun 1.1.0** | Fast dependency management and task execution. |
| **Linting** | **Biome 2.4.5** | High-speed linting and formatting (replacing ESLint/Prettier). |

---

## 🔄 Data Flow Architecture

### 1️⃣ Identity & Session Flow (The bl1nk Special)

```text
React UI (Identity View in apps/web)
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

### 2️⃣ Agent Interaction Flow (Standard Command)
```text
React UI (Terminal/Chat using @bl1nk/ui)
  ↓ [Zustand Action: Dispatch Task]
Next.js API Routes (API Gateway)
  ↓ [Lookup Relevant Adapter via @bl1nk/sdk]
packages/adapters/ (Provider-specific Implementation)
  ↓ [Trigger Modal Worker]
Modal Worker (Execute Agent CLI with Injected Identity)
  ↓ [Stream PTY Output via SSE/WebSocket]
React UI (Real-time updates via xterm-zerolag-input)
```

---

## 📁 Project Structure

```text
bl1nk-org/
├── apps/                          # Client applications
│   ├── web/                       # Next.js 16 web app (Primary)
│   │   ├── app/                   # Layouts, Pages & Routing (Core Structure)
│   │   ├── components/            # Feature-specific components (Logic-heavy)
│   │   ├── store/                 # Zustand stores (agent, auth, ui)
│   │   └── features/              # Vertical slices (identity, chat, explorer)
│   ├── desktop/                   # Tauri v2 desktop app (Rust + React UI)
│   ├── obsidian/                  # Obsidian plugin (esbuild)
│   ├── android/                   # React Native app
│   └── docs/                      # Documentation site (Astro)
│
├── packages/                      # Shared modular packages
│   ├── db/                        # Prisma Monorepo Setup (Neon DB)
│   │   ├── prisma/                # schema.prisma (Single Source of Truth)
│   │   └── src/                   # Exported Singleton Prisma Client
│   ├── ui/                        # @bl1nk/ui (Standard Components)
│   │   ├── src/
│   │   │   ├── components/ui/     # Standard shadcn components (Button, Card, etc.)
│   │   │   └── lib/utils.ts       # Shared cn() utility
│   │   └── tailwind.config.ts     # Base Tailwind configuration
│   ├── sdk/                       # @bl1nk/sdk (Adapter & Plugin Interface)
│   ├── adapters/                  # Agent Adapters (Claude, Gemini, Browser)
│   ├── identity-vault/            # Encryption (AES-256) & Session Logic
│   ├── agent-runtime/             # Agent execution & MCP logic
│   ├── cloud-storage/             # Cloudflare R2 + Boto3
│   └── modal-runtime/             # Modal cloud compute wrappers
│
├── modal/                         # Cloud Infrastructure Logic
│   └── workers/                   # Python logic for Playwright & CLI Runners
│
├── .agents/skills/                # Agent skills (project-overview, shadcn-ui)
├── biome.json                     # Biome configuration
├── justfile                       # Task definitions (Task Runner)
├── turbo.json                     # Turborepo configuration
└── package.json                   # Root workspace config
```

---

## 🔌 The Adapter Engine (Community-Driven)

Following the **Chat SDK Adapter Pattern**, bl1nk treats every AI provider as a pluggable module via `@bl1nk/sdk`.

| Adapter Tier | Description | Examples |
|--------------|-------------|----------|
| **Official** | Maintained by bl1nk-org | `@bl1nk-adapter/claude`, `@bl1nk-adapter/browser` |
| **Vendor** | Maintained by platform owners | `@resend/bl1nk-adapter` |
| **Community**| Third-party open-source | `matrix-adapter`, `custom-mcp-adapter` |

---

## 🧱 Key Principles

* ✅ **Identity Portability** – Login once via Cloud Browser, session migrates across Web/Mobile/Desktop.
* ✅ **Separation of Concerns** – Framework Layouts (`apps/*`) ↔ Standard Components (`packages/ui`).
* ✅ **Zero-Knowledge Vault** – User sessions encrypted at rest via AES-256-GCM.
* ✅ **Centralized Database** – Prisma client in `packages/db` shared across all packages.
* ✅ **Local-First, Cloud-Empowered** – Desktop works offline; heavy tasks offload to Modal.

---

## 🚀 Common Workflows

### 1. Development
```bash
bun install
bun run dev          # Turbo run dev across all apps
```

### 2. Database Management (packages/db)
```bash
bun run db:generate  # prisma generate
bun run db:push      # prisma db push
```

### 3. Linting & Formatting
```bash
bun run lint         # biome check --write
bun run format       # biome format --write
```

---

## 🎯 Important Files & Patterns

### Component Imports
```typescript
// Shared UI components
import { Button } from "@bl1nk/ui/components/ui/button"

// Local Feature components
import { ChatInterface } from "@/features/chat/components/ChatInterface"

// Utilities
import { cn } from "@bl1nk/ui/lib/utils"
```

---

<p align="center">
  <strong>The remote control for your AI subscriptions. Built for the era of autonomous agents.</strong>
</p>
