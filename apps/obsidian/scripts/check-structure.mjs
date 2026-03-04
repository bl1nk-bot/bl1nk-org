#!/usr/bin/env node

/**
 * check-structure.mjs
 * ตรวจสอบว่าโครงสร้างโฟลเดอร์จริงตรงกับ SPEC.md หรือไม่
 * แสดงผล: ✅ มีแล้ว | ❌ ขาด | ⚠️ เกิน SPEC
 *
 * วิธีใช้:
 *   node scripts/check-structure.mjs
 *   node scripts/check-structure.mjs --fix   (สร้างโฟลเดอร์/ไฟล์ที่ขาดอัตโนมัติ)
 */

import { existsSync } from "node:fs"
import fs from "node:fs/promises"
import path from "node:path"

const ROOT = process.cwd()
const FIX = process.argv.includes("--fix")

// โครงสร้างที่ควรมีตาม SPEC
const EXPECTED = [
  // packages/obsidian
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
  // shared — ยังไม่มี (NEW)
  "packages/obsidian/src/shared/AdapterRegistry.ts",
  "packages/obsidian/src/shared/ChatViewRegistry.ts",
  "packages/obsidian/src/shared/settings-validator.ts",
  // packages/cloudflare
  "packages/cloudflare/src/index.ts",
  "packages/cloudflare/src/r2.ts",
  // packages/vercel
  "packages/vercel/src/app/api/sandbox/route.ts",
  "packages/vercel/src/app/page.tsx",
  // drizzle
  "drizzle/drizzle.config.ts",
  // root
  "SPEC.md",
  "CHANGELOG.md",
  "AGENTS.md",
  "package.json",
  "tsconfig.json",
]

const NEW_FILES = [
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

async function checkStructure() {
  console.log("\n📁 ตรวจสอบโครงสร้างโปรเจ็ค\n")

  const missing = []
  const found = []

  for (const file of EXPECTED) {
    const full = path.join(ROOT, file)
    const exists = existsSync(full)
    const isNew = NEW_FILES.includes(file)

    if (exists) {
      found.push(file)
      console.log(`  ✅ ${file}`)
    } else {
      missing.push({ file, isNew })
      const tag = isNew ? "[NEW]" : "[MISSING]"
      console.log(`  ❌ ${file} ${tag}`)
    }
  }

  console.log(`\n📊 สรุป: พบ ${found.length}/${EXPECTED.length} ไฟล์`)

  if (missing.length > 0) {
    console.log(`\n⚠️  ขาด ${missing.length} ไฟล์:`)
    missing.forEach(({ file, isNew }) => {
      console.log(`   - ${file}${isNew ? " (ต้องสร้างใหม่)" : " (หายไป!)"}`)
    })

    if (FIX) {
      console.log("\n🔧 กำลังสร้างโฟลเดอร์ที่ขาด...")
      for (const { file } of missing) {
        const dir = path.dirname(path.join(ROOT, file))
        await fs.mkdir(dir, { recursive: true })
        console.log(`   📂 สร้าง ${path.dirname(file)}/`)
      }
      console.log("\n✅ สร้างโฟลเดอร์เสร็จแล้ว รัน script อื่นเพื่อ gen ไฟล์ครับ")
    } else {
      console.log("\n💡 รัน --fix เพื่อสร้างโฟลเดอร์ที่ขาดอัตโนมัติ")
    }
  } else {
    console.log("\n✅ โครงสร้างครบถ้วนตาม SPEC")
  }
}

checkStructure().catch(console.error)
