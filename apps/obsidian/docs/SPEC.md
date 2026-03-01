# SPEC.md — obsidian-acp-bl1nk

> Source of truth สำหรับทุก AI ที่ทำงานในโปรเจ็คนี้  
> อ่านก่อนทำงานทุกครั้ง — ห้ามเดาสิ่งที่ไม่มีในนี้

---

## ภาพรวม

Plugin สำหรับ Obsidian ที่เชื่อม ACP protocol, MCP tools, และ sandboxed runtimes เข้าด้วยกัน  
โดยใช้ Obsidian เป็น interface + filesystem หลัก ไม่ใช่ runtime ของ agent

---

## การตัดสินใจสำคัญ — เรียงตามเวลา

| # | วันที่ | ตัดสินใจ | เปลี่ยนจาก | เป็น | เหตุผล |
|---|---|---|---|---|---|
| 1 | 2026-02-23 | Repository strategy | fork obsidian-agent-client | เขียนใหม่ + ใช้เป็น reference | โค้ดเดิมทดสอบแล้ว ห้ามแก้ |
| 2 | 2026-02-23 | Monorepo structure | 3 repo แยกกัน | `packages/obsidian`, `packages/cloudflare`, `packages/vercel` | จัดการ shared types ง่ายกว่า |
| 3 | 2026-02-23 | Python sandbox | Cloudflare V8 isolate | Modal.com | รัน Python ได้จริง, per-call isolate |
| 4 | 2026-02-23 | Node.js sandbox | Cloudflare V8 isolate | Vercel + Bun + spawn | 60 นาที/เดือน พอสำหรับ per-call |
| 5 | 2026-02-23 | Cloudflare role | MCP Gateway + V8 sandbox | Gateway + R2 storage + serve files เท่านั้น | ไม่รันโค้ด agent |
| 6 | 2026-02-23 | MCP connection | ผ่าน Cloudflare Gateway | เชื่อมตรงจาก plugin/CLI | stdio/sse/http รองรับอยู่แล้ว |
| 7 | 2026-02-23 | ACP role | ใช้แบบ tool/server | Protocol กลางเท่านั้น | ACP ไม่ใช่ tool ไม่ใช่ server |
| 8 | 2026-02-23 | Database | ไม่มี | Drizzle + PostgreSQL | TypeScript-first, Edge-compatible |
| 9 | 2026-02-23 | DB schema source | เขียน schema แยก | gen จาก `src/types/*.types.ts` | ไม่ duplicate |
| 10 | 2026-02-23 | pgvector | Phase 1 | Phase 2 เท่านั้น | ยังไม่จำเป็น |
| 11 | 2026-02-23 | Sandbox role | built-in tool เท่านั้น | built-in tool หรือ MCP server อีกตัว | ยืดหยุ่นกว่า |
| 12 | 2026-02-23 | Bun runtime | Node.js | Bun + spawn | ความเร็วสูงสุด background execution |

---

## Architecture

```
Obsidian Plugin
(Interface + Filesystem + ACP client + MCP client)
│
├── [ACP Protocol] ─── Claude Code, Gemini CLI, Codex, QwenCoder
│   agent-CLI แต่ละตัวเชื่อม ACP ได้อยู่แล้ว — แยกกัน ไม่ขึ้นกัน
│
├── [MCP Client] ──── MCP Servers (stdio / sse / http)
│   เชื่อมตรง ไม่ผ่าน Gateway
│
└── ──────────────── Cloudflare (Gateway + R2)
                          │
                          ├── Modal (Python sandbox — per-call)
                          └── Vercel (Node.js sandbox — per-call + Dashboard)

AnythingLLM — RAG only (localhost:3001)
```

---

## Platform Roles

| Platform | บทบาทที่แน่นอน | สิ่งที่ไม่ใช่ |
|---|---|---|
| Obsidian Plugin | Interface + Filesystem + ACP client + MCP client | ไม่รัน agent เอง |
| ACP | Protocol กลาง | ไม่ใช่ tool ไม่ใช่ server |
| agent-CLI | Claude Code, Gemini CLI, Codex, QwenCoder | เชื่อม ACP อยู่แล้ว แยกจาก plugin |
| MCP | Tool protocol (stdio/sse/http) | ไม่ผ่าน Gateway |
| Cloudflare | Gateway + R2 + serve files to sandbox | ไม่รันโค้ด agent |
| Modal | Python sandbox per-call (Bun + Python) | ไม่ใช่ long-running |
| Vercel | Node.js sandbox per-call + Dashboard | ไม่ใช่ long-running |
| AnythingLLM | RAG เท่านั้น | local only |

---

## Tech Stack

| Layer | Package | Version | Package |
|---|---|---|---|
| ACP | `@agentclientprotocol/sdk` | `^0.13.1` | packages/obsidian |
| MCP | `@modelcontextprotocol/sdk` | `^1.0.0` | packages/obsidian |
| UI | React | `^19.1.1` | packages/obsidian |
| UI icons | lucide-react | `^0.468.0` | packages/obsidian |
| Editor | CodeMirror | `6.x` | packages/obsidian |
| Events | eventemitter3 | `^5.0.4` | packages/obsidian |
| ORM | drizzle-orm | latest | drizzle/ |
| DB | PostgreSQL + pgvector (Phase 2) | — | drizzle/ |
| Sandbox runtime | Bun + spawn | — | Modal + Vercel |
| Dashboard | Next.js + Tailwind | — | packages/vercel |
| Build | esbuild | `0.17.3` | packages/obsidian |
| Language | TypeScript | `^5.9.3` | ทุก package |
| Package manager | pnpm | — | root |

---

## Monorepo Structure

```
obsidian-acp-bl1nk/
├── packages/
│   ├── obsidian/src/
│   │   ├── main.ts                        ✅ ห้ามแก้
│   │   ├── core/                          ✅ ห้ามแก้
│   │   │   ├── ACPManager.ts
│   │   │   ├── ContextEnricher.ts
│   │   │   ├── HookManager.ts
│   │   │   ├── KnowledgeManager.ts
│   │   │   ├── ProjectManager.ts
│   │   │   └── ToolManager.ts
│   │   ├── integrations/                  ✅ ห้ามแก้
│   │   │   ├── AirtableClient.ts
│   │   │   ├── ClickUpClient.ts
│   │   │   ├── GatewayClient.ts
│   │   │   ├── MCPToolAdapter.ts
│   │   │   └── NotionClient.ts
│   │   ├── services/                      ✅ ห้ามแก้
│   │   │   ├── EventBus.ts
│   │   │   └── Logger.ts
│   │   ├── types/                         ✅ เพิ่ม Drizzle table ต่อท้ายได้
│   │   │   ├── acp.types.ts
│   │   │   ├── mcp.types.ts
│   │   │   ├── project.types.ts
│   │   │   ├── session.types.ts
│   │   │   ├── skill.types.ts
│   │   │   ├── store.types.ts
│   │   │   ├── tool.types.ts
│   │   │   └── index.types.ts
│   │   ├── shared/                        🔲 ต้องสร้าง
│   │   │   ├── AdapterRegistry.ts         Map<viewId, AcpAdapter>
│   │   │   ├── ChatViewRegistry.ts        sidebar + floating view
│   │   │   └── settings-validator.ts      validateAndMigrate()
│   │   └── ui/                            ✅ แก้ได้
│   ├── cloudflare/src/                    🔲 ต้องสร้าง
│   │   ├── index.ts                       Worker entry
│   │   └── r2.ts                          serve files from R2
│   └── vercel/src/app/                    🔲 ต้องสร้าง
│       ├── api/sandbox/route.ts           Node.js sandbox endpoint
│       └── page.tsx                       Dashboard UI
├── drizzle/                               🔲 ต้องสร้าง
│   ├── drizzle.config.ts
│   └── migrations/                        gen อัตโนมัติ
├── scripts/                               ✅ พร้อมใช้
├── templates/                             ✅ พร้อมใช้
├── .vscode/                               ✅ พร้อมใช้
├── SPEC.md                                ✅ (ไฟล์นี้)
├── CHANGELOG.md                           ✅
├── CHANGELOG.json                         ✅
├── AGENTS.md                              ✅
├── TODO.md                                ✅
└── README.md                              ✅
```

---

## Database Schema

- **ORM:** Drizzle + PostgreSQL
- **Schema source:** `packages/obsidian/src/types/*.types.ts`
- **Migration output:** `drizzle/migrations/`
- **pgvector:** Phase 2 เท่านั้น

```typescript
// drizzle/drizzle.config.ts
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./packages/obsidian/src/types/*.types.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

| JSON Schema | Tables |
|---|---|
| `osa/settings` | `settings` |
| `osa/project` | `projects`, `hooks` |
| `osa/session` | `sessions`, `messages`, `tools_used` |
| `osa/tool` | `tools`, `tool_parameters` |
| `osa/skill` | `skills`, `skill_variables` |
| `osa/mcp-server` | `mcp_servers` |

---

## กฎที่ห้ามลืม (AI ต้องอ่านทุกข้อ)

### โค้ด
1. ไฟล์ใน `packages/obsidian/src/core/`, `integrations/`, `services/` **ห้ามแก้เด็ดขาด**
2. `types/*.types.ts` — เพิ่ม Drizzle table ต่อท้ายได้ ห้ามแก้ interface เดิม
3. `shared/` — สร้างใหม่ทั้งหมด ไม่ต้องอ้างอิงของเดิม
4. JSDoc และ comment **เขียนภาษาไทยเท่านั้น**
5. `extend` อย่า `override`

### ACP / MCP
6. `ACP` คือ protocol — ไม่ใช่ tool ไม่ใช่ server ไม่ใช่ library ที่เรียกตรง
7. `MCP` เชื่อมตรงจาก plugin หรือ CLI — **ไม่ผ่าน Gateway**
8. `defaultAgentId` — ไม่ใช่ `activeAgentId`
9. `acpSessionId` (SDK จัดการ) แยกจาก plugin `session.id` (เราจัดการ)

### Sandbox
10. Modal และ Vercel รัน **per-call** 5-10 วินาที — ไม่ใช่ long-running process
11. Cloudflare **ไม่รันโค้ด** — serve files จาก R2 ไปให้ sandbox เท่านั้น

### Database
12. อย่าเพิ่ม pgvector ใน Phase 1
13. gen migration ด้วย `npx drizzle-kit generate` — ไม่เขียน SQL เอง

---

## Naming Conventions

| สิ่ง | รูปแบบ |
|---|---|
| Class file | `PascalCase.ts` |
| Type file | `camelCase.types.ts` |
| Utility file | `kebab-case.ts` |
| JSDoc | ภาษาไทย |
| Comment inline | ภาษาไทย |
| Variable/Function/Type | อังกฤษ camelCase / PascalCase |

---

*SPEC version: 2.0.0 | Phase: 1 — Personal Prototype | อัปเดต: 2026-02-26*
