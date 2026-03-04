#!/usr/bin/env node

/**
 * progress.mjs
 * ติดตามความคืบหน้าโปรเจ็คจาก CHANGELOG.json และโครงสร้างจริง
 * แสดง: phase ปัจจุบัน, งานที่เสร็จ, งานที่ค้าง, การตัดสินใจล่าสุด
 *
 * วิธีใช้:
 *   node scripts/progress.mjs
 *   node scripts/progress.mjs --json   (output เป็น JSON)
 */

import { existsSync } from "node:fs"
import fs from "node:fs/promises"
import path from "node:path"

const ROOT = process.cwd()
const JSON_MODE = process.argv.includes("--json")

// ไฟล์ที่ถือว่า "เสร็จแล้ว" ตาม SPEC
const DONE_FILES = [
  "packages/obsidian/src/main.ts",
  "packages/obsidian/src/core/ACPManager.ts",
  "packages/obsidian/src/core/ContextEnricher.ts",
  "packages/obsidian/src/core/HookManager.ts",
  "packages/obsidian/src/core/KnowledgeManager.ts",
  "packages/obsidian/src/core/ProjectManager.ts",
  "packages/obsidian/src/core/ToolManager.ts",
  "packages/obsidian/src/integrations/AirtableClient.ts",
  "packages/obsidian/src/integrations/ClickUpClient.ts",
  "packages/obsidian/src/integrations/GatewayClient.ts",
  "packages/obsidian/src/integrations/MCPToolAdapter.ts",
  "packages/obsidian/src/integrations/NotionClient.ts",
  "packages/obsidian/src/services/EventBus.ts",
  "packages/obsidian/src/services/Logger.ts",
  "packages/obsidian/src/types/acp.types.ts",
  "packages/obsidian/src/types/mcp.types.ts",
  "packages/obsidian/src/types/project.types.ts",
  "packages/obsidian/src/types/session.types.ts",
  "packages/obsidian/src/types/skill.types.ts",
  "packages/obsidian/src/types/store.types.ts",
  "packages/obsidian/src/types/tool.types.ts",
  "packages/obsidian/src/types/index.types.ts",
]

const PENDING_FILES = [
  "packages/obsidian/src/shared/AdapterRegistry.ts",
  "packages/obsidian/src/shared/ChatViewRegistry.ts",
  "packages/obsidian/src/shared/settings-validator.ts",
  "packages/cloudflare/src/index.ts",
  "packages/cloudflare/src/r2.ts",
  "packages/vercel/src/app/api/sandbox/route.ts",
  "packages/vercel/src/app/page.tsx",
  "drizzle/drizzle.config.ts",
  "SPEC.md",
  "CHANGELOG.md",
  "AGENTS.md",
]

async function loadChangelog() {
  const file = path.join(ROOT, "CHANGELOG.json")
  if (!existsSync(file)) return []
  const raw = await fs.readFile(file, "utf-8")
  return JSON.parse(raw)
}

async function progress() {
  const changelog = await loadChangelog()
  const latestEntry = changelog[changelog.length - 1] ?? null

  // ตรวจสอบไฟล์จริง
  const doneReal = DONE_FILES.filter((f) => existsSync(path.join(ROOT, f)))
  const pendingReal = PENDING_FILES.filter((f) => !existsSync(path.join(ROOT, f)))
  const pendingDone = PENDING_FILES.filter((f) => existsSync(path.join(ROOT, f)))

  const total = DONE_FILES.length + PENDING_FILES.length
  const completed = doneReal.length + pendingDone.length
  const pct = Math.round((completed / total) * 100)

  if (JSON_MODE) {
    console.log(
      JSON.stringify(
        {
          phase: "1 — Personal Prototype",
          progress: { completed, total, percent: pct },
          done: doneReal,
          pending: pendingReal,
          latestDecision: latestEntry,
        },
        null,
        2
      )
    )
    return
  }

  console.log("\n📊 ความคืบหน้าโปรเจ็ค obsidian-acp-bl1nk\n")
  console.log(`  Phase: 1 — Personal Prototype`)
  console.log(`  คืบหน้า: ${completed}/${total} ไฟล์ (${pct}%)`)

  // progress bar
  const bar = "█".repeat(Math.round(pct / 5)) + "░".repeat(20 - Math.round(pct / 5))
  console.log(`  [${bar}] ${pct}%\n`)

  console.log(`  ✅ เสร็จแล้ว (${doneReal.length + pendingDone.length} ไฟล์)`)
  doneReal.forEach((f) => console.log(`     • ${f}`))
  pendingDone.forEach((f) => console.log(`     • ${f} [NEW ✅]`))

  if (pendingReal.length > 0) {
    console.log(`\n  🔲 ยังค้างอยู่ (${pendingReal.length} ไฟล์)`)
    pendingReal.forEach((f) => console.log(`     • ${f}`))
  }

  if (latestEntry) {
    console.log(`\n  📝 การตัดสินใจล่าสุด (${latestEntry.date})`)
    console.log(`     ${latestEntry.summary}`)
  } else {
    console.log(`\n  📝 ยังไม่มีบันทึกการตัดสินใจ — รัน update-changelog.mjs เพื่อเริ่มต้น`)
  }

  console.log()
}

progress().catch(console.error)
