---
name: project-overview
description: Complete project architecture and structure guide. Use when exploring the codebase, understanding project organization, finding files, or needing comprehensive architectural context. Triggers on architecture questions, directory navigation, or project overview needs.
---

# Project Overview: The Omnipresent AI Workspace

System architecture for a local-first, cloud-enhanced AI agent workspace.
This document provides a complete guide to the project’s structure, technology stack, data flow, and design principles.

---

## 📋 Description

A personal AI agent workspace ecosystem that is local-first but seamlessly integrates cloud capabilities (thin client, fat cloud).
The platform supports multiple clients:

· Web (Browser)
· Desktop (macOS / Windows / Linux) – Native (Tauri)
· Obsidian (Plugin)
· Mobile (Android)
· Documentation site

Core architecture: Monorepo managed with Bun and Just (task runner).

---

## 🧰 Complete Tech Stack

Category Technology
Framework (Web) Next.js 16 + React 19 (includes Vercel Edge API)
Framework (Desktop) Tauri v2 + Vite
Language TypeScript (frontend), Rust (desktop core), Python (Modal cloud)
UI Components shadcn/ui, Tailwind CSS
State Management Zustand
Data Validation Zod
Workspace / Tooling Bun (package manager), Just (task runner)
Cloud Compute Modal (integrated via packages)
API Gateway Vercel Edge Functions (integrated in web/)
Database Neon (PostgreSQL) + Drizzle ORM (in packages/)
Object Storage Cloudflare R2 + Boto3
Agent Protocol Model Context Protocol (MCP)
Plugin Bundler esbuild (for Obsidian)

---

## 📁 Complete Project Structure

The monorepo clearly separates frontend (thin clients) from shared packages (core logic & cloud compute).

```
project-root/
├── .github/
│   ├── workflows/              # CI/CD pipelines
│   └── ISSUE_TEMPLATE/
├── .vscode/                    # VSCode settings
├── .env.example                # Environment template
├── .gitignore
├── .npmrc / .bunrc
├── turbo.json                  # Turborepo config (optional)
├── justfile                    # Task runner
├── package.json                # Bun workspace root
├── tsconfig.base.json          # Base TypeScript config
├── README.md
└── docs/                       # Architecture documentation

app/
├── web/                         # Next.js Web App + Vercel API Gateway
│   ├── app/                     # App Router
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/                 # Route handlers (Vercel Edge Functions / API Gateway)
│   │   │   ├── agent/
│   │   │   ├── tools/
│   │   │   └── storage/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── features/            # Feature-specific components
│   │   └── layouts/
│   ├── hooks/                    # Custom React hooks
│   ├── lib/
│   │   ├── api.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── store/                    # Zustand stores
│   │   ├── auth.ts
│   │   ├── agent.ts
│   │   └── ui.ts
│   ├── middleware.ts             # Vercel Edge Middleware (Auth, CORS, Logging)
│   ├── vercel.json                # Vercel configuration
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── desktop/                       # Tauri v2 Desktop App
│   ├── src/                       # React + Vite UI
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── src-tauri/                 # Rust backend
│   │   ├── src/
│   │   │   ├── main.rs
│   │   │   ├── commands/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── Cargo.toml
│   │   └── tauri.conf.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── obsidian/                       # Obsidian Plugin
│   ├── src/
│   │   ├── main.ts
│   │   ├── settings.ts
│   │   ├── commands/
│   │   └── ui/
│   ├── esbuild.config.js
│   ├── manifest.json
│   ├── tsconfig.json
│   └── package.json
│
├── android/                         # React Native / Flutter
│   ├── src/
│   ├── android/
│   ├── ios/
│   └── package.json
│
└── doc/                            # Documentation Site (Astro/Docusaurus)
    ├── src/
    ├── public/
    └── astro.config.mjs

packages/
├── docs/
│   ├── changelog/
│   ├── development/
│   ├── self-hosting/
│   └── usage/
├── locales/
│   ├── en-US/
│   ├── zh-CN/
│   └── th-TH/
├── packages/
│   ├── agent-runtime/               # Agent runtime execution
│   ├── builtin-agents/               # Pre-configured AI agents
│   ├── builtin-tool-*/                # Builtin tool packages (MCP based)
│   ├── business/                      # Cloud-only business logic
│   │   ├── config/
│   │   ├── const/
│   │   └── model-runtime/
│   ├── config/
│   ├── const/
│   ├── context-engine/                # Context management
│   ├── conversation-flow/             # Chat logic and history
│   ├── database/                      # Database Layer (Neon + Drizzle ORM)
│   │   ├── drizzle.config.ts
│   │   └── src/
│   │       ├── models/
│   │       ├── schemas/               # Drizzle schemas (users, agents, artifacts)
│   │       ├── migrations/
│   │       └── repositories/
│   ├── desktop-bridge/                 # Tauri IPC bridge
│   ├── edge-config/
│   ├── editor-runtime/
│   ├── fetch-sse/
│   ├── file-loaders/
│   ├── memory-user-memory/
│   ├── model-bank/
│   ├── model-runtime/                  # LLM Integrations
│   │   └── src/
│   │       ├── core/
│   │       └── providers/
│   ├── observability-otel/             # OpenTelemetry
│   ├── prompts/
│   ├── python-interpreter/              # Modal Sandbox & Python execution logic
│   ├── cloud-storage/                   # Cloudflare R2 + Boto3 handlers
│   ├── ssrf-safe-fetch/
│   ├── types/
│   ├── utils/
│   └── web-crawler/                     # Exa/Playwright integration
├── telemetry/                           # Logging & Analytics
│   ├── src/
│   │   ├── logger.ts
│   │   ├── analytics.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── tsconfig.json
│   └── package.json

project-root/
├── .env.example
├── .env.local (git-ignored)
├── .env.production
├── docker-compose.yml          # Local development
├── Dockerfile (root)           # Multi-stage build
└── .dockerignore
```

---

## 🔄 Data Flow Architecture

All actions start from the user interface (UI → State → Network → Compute → Storage).

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

· ✅ Separation of Concerns – Frontend (UI) ↔ Packages (logic & compute) ↔ Database/Storage
· ✅ Scalability – Each layer can scale independently
· ✅ Type Safety – Full TypeScript across frontend and backend logic
· ✅ Modularity – Packages for shared code and isolated cloud components
· ✅ Local-First – Desktop app works offline
· ✅ Cloud-Ready – Seamless integration with Modal and Vercel Edge
