# 🤖 AGENTS.md — Global Multi-Agent Instruction Guide

ไฟล์นี้คือ **Single Source of Truth** สำหรับ AI Agents ทุกตัว (Gemini, Claude, Qwen) เพื่อให้เข้าใจบริบท โครงสร้าง และมาตรฐานของโปรเจกต์ **bl1nk-org** อย่างเป๊ะที่สุด

---

## 🎯 Project Vision

**bl1nk** คือ Open-source AI Agent Control Plane แบบ Cloud-Native ที่ถูกออกแบบมาเพื่อ "สวมสิทธิ์" (Identity Assumption) AI Subscription ของผู้ใช้ผ่าน Cloud Browser (Playwright on Modal.com) เพื่อให้ผู้ใช้สามารถรัน Agent ได้ทุกที่โดยไม่ต้องพึ่งพา Hardware ตัวเอง

---

## 🏗️ Core Architecture & Responsibility Map

| Layer             | Technology Stack            | Location                   | Primary Responsibility                           |
| :---------------- | :-------------------------- | :------------------------- | :----------------------------------------------- |
| **Frontend**      | Next.js 16.1.7 + React 19   | `apps/web/`                | Web Layouts, Server Actions, Route Handlers      |
| **Desktop**       | Tauri v2 + Rust             | `apps/desktop/`            | Native OS Hooks, Local Resource Management       |
| **Database**      | Prisma + Neon               | `packages/database/`       | Centralized Schema & Database Client (Singleton) |
| **UI Kit**        | shadcn/ui + Tailwind CSS v4 | `apps/web/`                | Standard Atomic Components                       |
| **Identity**      | AES-256-GCM                 | `packages/identity-vault/` | Secure encryption/decryption of browser sessions |
| **Worker**        | Modal (Python)              | `modal/workers/`           | Headless Playwright & CLI Execution Nodes        |
| **Protocol**      | @bl1nk/sdk                  | `packages/sdk/`            | Adapter Interfaces & Global Types                |
| **Shared**        | TypeScript Utilities        | `packages/shared/`         | Common utilities, types, constants               |
| **Telemetry**     | Analytics & Logging         | `packages/telemetry/`      | Analytics, logging, monitoring                   |
| **Agent Runtime** | Agent Execution             | `packages/agent-runtime/`  | Agent execution & MCP logic                      |
| **Cloud Storage** | Cloudflare R2               | `packages/cloud-storage/`  | File storage via R2 + Boto3                      |

---

## 📁 Project Structure

```
bl1nk-org/
├── apps/                          # Client applications
│   ├── web/                       # Next.js 16 web app (Primary)
│   │   ├── app/                   # Layouts, Pages & Routing
│   │   ├── components/            # Feature-specific components
│   │   ├── store/                 # Zustand stores (auth, agent, ui)
│   │   ├── lib/utils.ts           # cn() utility for Tailwind
│   │   └── hooks/                 # Custom React hooks
│   ├── desktop/                   # Tauri v2 desktop app
│   ├── obsidian/                  # Obsidian plugin
│   ├── android/                   # React Native app
│   └── docs/                      # Documentation site
│
├── packages/                      # Shared modular packages
│   ├── database/                  # Prisma + Neon DB (Singleton)
│   ├── shared/                    # Shared utilities, types, constants
│   ├── telemetry/                 # Analytics, logging, monitoring
│   ├── agent-runtime/             # Agent execution & MCP logic
│   ├── cloud-storage/             # Cloudflare R2 + Boto3
│   └── identity-vault/            # Encryption (AES-256) & Session Logic
│
├── modal/                         # Cloud Infrastructure Logic
│   └── workers/                   # Python logic for Playwright & CLI Runners
│
├── docs/                          # Documentation (SPEC.md, ARCHITECT.md)
├── biome.json                     # Biome configuration (Linter/Formatter)
├── justfile                       # Task definitions
├── turbo.json                     # Turborepo configuration
└── package.json                   # Root workspace config
```

---

## 🛠️ Strict Engineering Standards

### 1. Database & Persistence (The Prisma Rule)

- **Schema Ownership:** แก้ไขที่ `packages/database/prisma/schema.prisma` เท่านั้น
- **No Direct Access:** ห้ามติดตั้ง Prisma Client ใน `apps/` แต่ละแอปแยกกัน ให้ใช้ผ่าน `@bl1nk/database`
- **Workflow:** `Edit Schema` -> `bun run db:generate` (at root) -> `Implement Logic`

### 2. UI Development Workflow

- **Standard Components:** ใช้ shadcn/ui components จาก `apps/web/components/ui/`
- **Utility:** ใช้ `cn()` จาก `apps/web/lib/utils.ts` สำหรับ merge Tailwind classes
- **Feature Components:** ถ้า UI มีการผูก Logic ให้สร้างไว้ใน `apps/web/components/`
- **Styling:** ใช้ **Tailwind CSS v4** (CSS-first variables)

### 3. Tooling & Linter

- **Linter/Formatter:** ใช้ **Biome** เท่านั้น (ห้ามใช้ ESLint หรือ Prettier)
- **Task Runner:** ใช้ **Just** (`justfile`) สำหรับรวมคำสั่งสำคัญ
- **Package Manager:** **Bun** 1.1.0+ เท่านั้น
- **Scripts:** รันผ่าน `bun run <script>` หรือ `just <task>`

---

## 🔄 Critical Data Flows (The "Identity Bridge")

1. **Capture:** Modal Worker รัน Playwright เพื่อ Login และบันทึก `storage_state.json`
2. **Protect:** Backend รับไฟล์ JSON และใช้ `@bl1nk/identity-vault` เข้ารหัสแบบ AES-256-GCM
3. **Store:** บันทึก Encrypted Blob ลงใน Neon Database ผ่าน Prisma
4. **Assume Identity:** เมื่อเรียกใช้ Agent (เช่น Claude CLI) ระบบจะ Decrypt ข้าม Cloud ไปที่ Modal เพื่อสวมสิทธิ์การทำงานทันที

---

## 📜 Agent Operational Protocols

**เมื่อได้รับคำสั่งให้ทำงาน:**

1. **Vertical Discovery:** ค้นหา `AGENTS.md` ในโฟลเดอร์ย่อยเพื่อดูรายละเอียดเฉพาะทาง
2. **Schema First:** หากมีการบันทึกข้อมูล ต้องอัปเดต Prisma Schema และทำ Migration ก่อนเสมอ
3. **Atomic UI:** ตรวจสอบว่าคอมโพแนนท์ที่ต้องการมีอยู่แล้วหรือไม่ ถ้าไม่มีให้เพิ่มเข้า `apps/web/components/ui/`
4. **Validation:** ใช้ **Zod** ตรวจสอบ Type Safety ระหว่างการส่งข้อมูลข้าม Layer
5. **Clean Up:** รัน `bun run lint` ทุกครั้งก่อนจบงาน

---

## 🚀 Common Workflows

### 1. Development

```bash
bun install
bun run dev          # Turbo run dev across all apps
just dev-web         # Run only web app
```

### 2. Database Management (packages/database)

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

## 📞 Shared Context Keys

- **Primary Author:** billlzzz18 (Bill)
- **Status:** Phase 1 - Identity Bridge & Database Foundations
- **Tech Stack Focus:** Next.js 16.1.7, React 19, Prisma, Modal, Bun, Biome, Tailwind v4

---

<p align="center">"Code for many clients, Execute on one cloud, Secure every identity."</p>
