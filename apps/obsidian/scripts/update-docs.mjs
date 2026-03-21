#!/usr/bin/env node

/**
 * update-docs.mjs
 * อัปเดต README.md และสร้าง AGENTS.md จาก SPEC และโครงสร้างจริง
 *
 * วิธีใช้:
 *   node scripts/update-docs.mjs           (อัปเดตทั้งคู่)
 *   node scripts/update-docs.mjs --readme  (เฉพาะ README)
 *   node scripts/update-docs.mjs --agents  (เฉพาะ AGENTS.md)
 */

import { existsSync } from "node:fs"
import fs from "node:fs/promises"
import path from "node:path"

const ROOT = process.cwd()
const ONLY_README = process.argv.includes("--readme")
const ONLY_AGENTS = process.argv.includes("--agents")
const DO_README = !ONLY_AGENTS
const DO_AGENTS = !ONLY_README

// อ่าน package.json
async function readPkg() {
  const file = path.join(ROOT, "package.json")
  if (!existsSync(file)) return { name: "obsidian-acp-bl1nk", version: "0.2.0" }
  return JSON.parse(await fs.readFile(file, "utf-8"))
}

// อ่าน CHANGELOG.json เพื่อดึง latest entries
async function readChangelog(n = 5) {
  const file = path.join(ROOT, "CHANGELOG.json")
  if (!existsSync(file)) return []
  const all = JSON.parse(await fs.readFile(file, "utf-8"))
  return all.slice(-n).reverse()
}

// ตรวจโครงสร้างจริง
function _countFiles(dir) {
  if (!existsSync(path.join(ROOT, dir))) return 0
  try {
    const result = require("node:child_process").execSync(
      `find ${path.join(ROOT, dir)} -name "*.ts" | wc -l`,
      { encoding: "utf-8" }
    )
    return parseInt(result.trim(), 10)
  } catch {
    return "?"
  }
}

async function updateReadme(pkg, changelog) {
  const date = new Date().toISOString().split("T")[0]
  const recentChanges = changelog.map((e) => `- ${e.emoji} ${e.summary} _(${e.date})_`).join("\n")

  const content = `# ${pkg.name} v${pkg.version}

> Obsidian plugin ที่เชื่อม ACP, MCP, และ sandboxed runtimes เข้าด้วยกัน

## Overview

Plugin สำหรับใช้ AI agents ภายใน Obsidian โดยรองรับ:
- **ACP Protocol** — เชื่อมกับ Claude Code, Gemini CLI, Codex, QwenCoder
- **MCP Protocol** — เชื่อม tools ผ่าน stdio / sse / http
- **Sandbox** — Modal (Python) และ Vercel (Node.js) per-call execution
- **RAG** — AnythingLLM integration

## โครงสร้างโปรเจ็ค

\`\`\`
packages/
├── obsidian/    # Obsidian Plugin
├── cloudflare/  # Gateway + R2 Storage
└── vercel/      # Node.js Sandbox + Dashboard
drizzle/         # Shared database schema
\`\`\`

## เริ่มต้นใช้งาน

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## Scripts

| คำสั่ง | ทำอะไร |
|---|---|
| \`pnpm check:structure\` | ตรวจโครงสร้างโฟลเดอร์ |
| \`pnpm progress\` | ดูความคืบหน้า |
| \`pnpm create:issue\` | สร้าง GitHub issue |
| \`pnpm changelog\` | บันทึกการเปลี่ยนแปลง |
| \`pnpm update:docs\` | อัปเดต README + AGENTS |

## การเปลี่ยนแปลงล่าสุด

${recentChanges || "- ยังไม่มีบันทึก"}

---

_อัปเดตอัตโนมัติ: ${date}_
`

  await fs.writeFile(path.join(ROOT, "README.md"), content)
  console.log("✅ อัปเดต README.md")
}

async function createAgentsMd() {
  const date = new Date().toISOString().split("T")[0]

  const content = `# AGENTS.md
> คู่มือสำหรับ AI agent ที่จะทำงานในโปรเจ็คนี้
> อัปเดต: ${date}

## สิ่งที่ต้องอ่านก่อนทำงาน

1. อ่าน \`SPEC.md\` — source of truth ของโปรเจ็ค
2. อ่าน \`CHANGELOG.md\` — การตัดสินใจล่าสุด
3. รัน \`node scripts/check-structure.mjs\` — ตรวจโครงสร้างก่อนเริ่ม

## กฎที่ต้องปฏิบัติ

### ห้ามแก้โค้ดเดิม
- ไฟล์ใน \`packages/obsidian/src/\` ที่ทดสอบแล้ว **ห้ามแก้**
- ให้เพิ่มต่อท้าย หรือสร้างไฟล์ใหม่เท่านั้น
- Drizzle table definitions เพิ่มต่อท้ายใน \`*.types.ts\`

### ACP vs MCP
- **ACP** = protocol เชื่อม plugin กับ agent-CLI — ไม่ใช่ tool ไม่ใช่ server
- **MCP** = tool protocol เชื่อมตรงถึง MCP servers (stdio/sse/http)
- agent-CLI แต่ละตัวเชื่อม ACP อยู่แล้ว แยกกับ plugin ของเรา

### Sandbox
- Modal = Python sandbox — per-call 5-10 วินาที
- Vercel = Node.js sandbox — per-call, Bun + spawn
- Cloudflare = Gateway + R2 เท่านั้น ไม่รันโค้ด

### Database
- Schema อยู่ใน \`packages/obsidian/src/types/*.types.ts\`
- Gen migration: \`npx drizzle-kit generate\`
- pgvector เพิ่มใน Phase 2

## โครงสร้างสำคัญ

\`\`\`
packages/obsidian/src/
├── core/          # managers ที่ทดสอบแล้ว — ห้ามแก้
├── integrations/  # clients ที่ทดสอบแล้ว — ห้ามแก้
├── services/      # EventBus, Logger — ห้ามแก้
├── types/         # TypeScript types + Drizzle schema
├── shared/        # NEW — AdapterRegistry, ChatViewRegistry
└── ui/            # UI components
\`\`\`

## Naming Conventions

- ไฟล์: \`PascalCase.ts\` สำหรับ class, \`camelCase.types.ts\` สำหรับ types
- JSDoc: **เขียนเป็นภาษาไทย**
- Comment: ภาษาไทย
- Variable/Function: ภาษาอังกฤษ

## ตัวอย่าง JSDoc ที่ถูกต้อง

\`\`\`typescript
/**
 * จัดการ ACP session สำหรับ view แต่ละตัว
 * แต่ละ view มี adapter เป็นของตัวเองเพื่อรองรับ multi-session
 * @param viewId - ID ของ ChatView ที่ต้องการ adapter
 */
getOrCreate(viewId: string): AcpAdapter {
  // ...
}
\`\`\`

## Scripts ที่ใช้บ่อย

\`\`\`bash
node scripts/check-structure.mjs      # ตรวจโครงสร้าง
node scripts/progress.mjs             # ดูความคืบหน้า
node scripts/update-changelog.mjs "..." --type decision  # บันทึกการตัดสินใจ
node scripts/create-issue.mjs "..."   # สร้าง issue
\`\`\`
`

  await fs.writeFile(path.join(ROOT, "AGENTS.md"), content)
  console.log("✅ สร้าง AGENTS.md")
}

async function main() {
  const pkg = await readPkg()
  const changelog = await readChangelog(5)

  if (DO_README) await updateReadme(pkg, changelog)
  if (DO_AGENTS) await createAgentsMd()

  console.log("\n📄 อัปเดตเอกสารเสร็จแล้ว")
}

main().catch(console.error)
