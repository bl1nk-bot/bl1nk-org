---
name: project-overview
description: Complete project architecture and structure guide for bl1nk-org monorepo. Use when exploring the codebase, understanding project organization, finding files, or needing architectural context. Triggers on: architecture questions, directory navigation, "where is X", "how does X work", adding new features, understanding data flow, or when user mentions any app/package paths.
---

# Project Overview: bl1nk-org Monorepo

**Local-first AI agent workspace with cloud enhancement**

A monorepo containing multiple AI workspace clients (Web, Desktop, Obsidian, Android) sharing common packages for agent runtime, storage, and database.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Web Framework** | Next.js 15 + React 19 |
| **UI Components** | shadcn/ui (24 components) + Tailwind CSS v4 |
| **State Management** | Zustand 5.0 |
| **Data Validation** | Zod 4.3 |
| **Package Manager** | Bun 1.1.0 |
| **Task Runner** | Just |
| **Build Tool** | Turbo 2.0 |
| **Linting** | Biome 2.4.5 (replacing ESLint/Prettier) |
| **AI/LLM** | Vercel AI SDK 6.0, @ai-sdk/gateway |
| **Database** | PostgreSQL (via @bl1nk/database package) |
| **Cloud Storage** | Cloudflare R2 + Boto3 (@bl1nk/cloud-storage) |
| **Agent Runtime** | Modal (@bl1nk/modal-runtime) |
| **Telemetry** | Custom (@bl1nk/telemetry) |

---

## 📁 Project Structure

```
bl1nk-org/
├── apps/                          # Client applications
│   ├── web/                       # Next.js web app (primary)
│   │   ├── app/                   # Next.js app router
│   │   │   ├── layout.tsx         # Root layout with Toaster
│   │   │   ├── globals.css        # Tailwind + CSS variables
│   │   │   └── api/chat/route.ts  # Chat API endpoint
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui components (24)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── sonner.tsx     # Toast notifications
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── breadcrumb.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   └── ... (14 more)
│   │   │   └── ai-elements/       # AI-specific components (14)
│   │   │       ├── agent.tsx
│   │   │       ├── code-block.tsx
│   │   │       ├── checkpoint.tsx
│   │   │       ├── conversation.tsx
│   │   │       ├── file-tree.tsx
│   │   │       ├── message.tsx
│   │   │       ├── plan.tsx
│   │   │       ├── queue.tsx
│   │   │       ├── task.tsx
│   │   │       ├── terminal.tsx
│   │   │       ├── canvas.tsx
│   │   │       ├── edge.tsx
│   │   │       └── node.tsx
│   │   ├── lib/
│   │   │   └── utils.ts           # cn() utility
│   │   ├── hooks/
│   │   ├── store/                 # Zustand stores
│   │   │   ├── agent.ts
│   │   │   ├── auth.ts
│   │   │   └── ui.ts
│   │   ├── middleware.ts
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── desktop/                   # Tauri v2 desktop app
│   │   ├── src/                   # React + Vite UI
│   │   └── src-tauri/             # Rust backend
│   │
│   ├── obsidian/                  # Obsidian plugin
│   ├── android/                   # React Native app
│   └── docs/                      # Documentation site (Astro)
│
├── packages/                      # Shared packages
│   ├── agent-runtime/             # Agent runtime execution
│   ├── cloud-storage/             # Cloudflare R2 + Boto3
│   ├── database/                  # PostgreSQL + Drizzle ORM
│   ├── modal-runtime/             # Modal cloud compute
│   └── telemetry/                 # Logging & analytics
│
├── docs/                          # Documentation
├── scripts/                       # Build/deploy scripts
│
├── .agents/skills/                # Agent skills
│   ├── linear/
│   ├── project-overview/
│   └── shadcn-ui/
│
├── .qwen/skills/                  # Qwen Code skills (symlinks)
├── .claude/                       # Claude Code config
├── .vscode/                       # VSCode settings
│
├── biome.json                     # Biome linter/formatter config
├── bunfig.toml                    # Bun config
├── docker-compose.yml             # Local dev services
├── justfile                       # Task definitions
├── package.json                   # Root workspace config
├── tsconfig.base.json             # Base TypeScript config
├── turbo.json                     # Turborepo config
└── vercel.json                    # Vercel deployment config
```

---

## 🔄 Key Workflows

### 1. Development

```bash
# Install dependencies
bun install

# Run all apps in dev mode
bun run dev

# Run specific app
cd apps/web && bun run dev

# Lint and format
bun run lint          # Biome check --write
bun run lint:check    # Biome check (read-only)
bun run format        # Biome format --write
```

### 2. Building

```bash
# Build all apps
bun run build

# Build specific app
cd apps/web && bun run build
```

### 3. Adding Components

```bash
# Add shadcn/ui component
cd apps/web
npx shadcn@latest add [component-name]

# Available components (24 total)
accordion, alert, avatar, badge, breadcrumb, button, card, collapsible,
command, dialog, dropdown-menu, hover-card, input, input-group,
progress, scroll-area, select, separator, sidebar, skeleton, sonner,
spinner, tabs, textarea, tooltip
```

---

## 🎯 Important Files & Patterns

### Component Imports

```typescript
// UI components (shadcn/ui)
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// AI elements (custom)
import { Agent } from "@/components/ai-elements/agent"
import { CodeBlock } from "@/components/ai-elements/code-block"

// Utilities
import { cn } from "@/lib/utils"
```

### State Management (Zustand)

```typescript
import { useAgentStore } from "@/store/agent"
import { useUIStore } from "@/store/ui"
```

### File Locations

| Need | Look Here |
|------|-----------|
| UI components | `apps/web/components/ui/` |
| AI components | `apps/web/components/ai-elements/` |
| API routes | `apps/web/app/api/` |
| Shared types | `packages/*/src/types/` |
| Database schemas | `packages/database/src/schemas/` |
| Agent skills | `.agents/skills/` or `.qwen/skills/` |

---

## 📋 Configuration Files

### `biome.json` - Linting/Formatting

```json
{
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "asNeeded"
    }
  },
  "css": {
    "parser": {
      "tailwindDirectives": true
    }
  }
}
```

### `package.json` - Scripts

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "biome check --write",
    "lint:check": "biome check",
    "format": "biome format --write"
  }
}
```

### `components.json` - Shadcn UI

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "cssVariables": true
  },
  "iconLibrary": "lucide"
}
```

---

## 🚀 Deployment

### Web App (Vercel)

- Deployed via `vercel.json` config
- Edge functions in `app/api/`
- Static assets optimized automatically

### Desktop App (Tauri)

- Build: `cd apps/desktop && bun run build`
- Outputs: macOS (.dmg), Windows (.msi), Linux (.AppImage)

### Obsidian Plugin

- Build: `cd apps/obsidian && bun run build`
- Outputs: `main.js`, `manifest.json`

---

## 📚 Skills Available

This project uses agent skills for enhanced productivity:

1. **project-overview** (this skill) - Architecture & structure
2. **shadcn-ui** - UI component patterns & installation
3. **linear** - Linear issue tracking integration

Skills are stored in `.agents/skills/` and symlinked to `.qwen/skills/`

---

## 🔧 Common Tasks

### Adding a new page

1. Create file in `apps/web/app/[route]/page.tsx`
2. Import UI components from `@/components/ui/`
3. Use Zustand stores for state if needed

### Adding a new component

1. Run `npx shadcn@latest add [name]` in `apps/web/`
2. Component created in `components/ui/`
3. Import and use in pages

### Modifying shared logic

1. Edit in appropriate `packages/` folder
2. Changes auto-reflect in all apps via workspace links

### Debugging

- Check `apps/web/.next/` for build output
- Use `bun run lint` to catch errors early
- Biome provides auto-fixes for most issues

---

## 📞 Contact & Resources

- **Web**: https://bl1nk.site
- **Email**: org@bl1nk.site, team@bl1nk.site
- **License**: MIT
