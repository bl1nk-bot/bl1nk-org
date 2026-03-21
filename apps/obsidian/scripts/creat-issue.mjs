#!/usr/bin/env node
/**
 * create-issue.mjs
 * สร้าง GitHub issue จาก template
 * ตรวจสอบ gh CLI อัตโนมัติ และแนะนำวิธีติดตั้งถ้าไม่มี
 *
 * วิธีใช้:
 *   node scripts/create-issue.mjs "ชื่อ issue" --type bug
 *   node scripts/create-issue.mjs "สร้าง AdapterRegistry" --type feature
 *   node scripts/create-issue.mjs "ตรวจสอบ Drizzle migration" --type task
 *
 * --type: bug | feature | task | refactor (default: task)
 * --label: label เพิ่มเติม (optional)
 */

import { execSync, spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import fs from "node:fs/promises"
import path from "node:path"

const ROOT = process.cwd()
const args = process.argv.slice(2)
const typeIndex = args.indexOf("--type")
const labelIndex = args.indexOf("--label")

const type = typeIndex !== -1 ? args[typeIndex + 1] : "task"
const label = labelIndex !== -1 ? args[labelIndex + 1] : null
const title = args
  .filter(
    (a, i) => a !== "--type" && i !== typeIndex + 1 && a !== "--label" && i !== labelIndex + 1
  )
  .join(" ")

const TYPE_LABEL = {
  bug: "🐛 bug",
  feature: "✨ feature",
  task: "📋 task",
  refactor: "♻️ refactor",
}

const TYPE_TEMPLATE = {
  bug: (title) =>
    `## 🐛 Bug Report\n\n**ชื่อ:** ${title}\n\n**พฤติกรรมที่เกิด:**\n\n\n**พฤติกรรมที่ควรเกิด:**\n\n\n**ขั้นตอนการ reproduce:**\n1. \n\n**Environment:**\n- OS:\n- Node:\n- Package version:\n`,
  feature: (title) =>
    `## ✨ Feature Request\n\n**ชื่อ:** ${title}\n\n**ทำไมต้องการ feature นี้:**\n\n\n**Acceptance Criteria:**\n- [ ] \n- [ ] \n\n**Notes:**\n`,
  task: (title) =>
    `## 📋 Task\n\n**ชื่อ:** ${title}\n\n**รายละเอียด:**\n\n\n**Checklist:**\n- [ ] \n- [ ] \n\n**เกี่ยวข้องกับ:**\n`,
  refactor: (title) =>
    `## ♻️ Refactor\n\n**ชื่อ:** ${title}\n\n**ย้ายจาก:**\n\n\n**เป็น:**\n\n\n**เหตุผล:**\n\n\n**ไฟล์ที่กระทบ:**\n`,
}

function checkGh() {
  const result = spawnSync("gh", ["--version"], { encoding: "utf-8" })
  return result.status === 0
}

function checkGhAuth() {
  const result = spawnSync("gh", ["auth", "status"], { encoding: "utf-8" })
  return result.status === 0
}

function _detectPkgManager() {
  if (existsSync(path.join(ROOT, "pnpm-lock.yaml"))) return "pnpm"
  if (existsSync(path.join(ROOT, "bun.lockb"))) return "bun"
  if (existsSync(path.join(ROOT, "yarn.lock"))) return "yarn"
  return "npm"
}

async function createIssue() {
  if (!title) {
    console.error(
      '❌ ต้องระบุชื่อ issue\nตัวอย่าง: node scripts/create-issue.mjs "สร้าง AdapterRegistry" --type task'
    )
    process.exit(1)
  }

  // ตรวจสอบ gh CLI
  if (!checkGh()) {
    console.log("⚠️  ไม่พบ GitHub CLI (gh)")
    console.log("\n📦 วิธีติดตั้ง:")
    console.log("   macOS:   brew install gh")
    console.log("   Linux:   https://github.com/cli/cli/releases")
    console.log("   Windows: winget install --id GitHub.cli\n")
    console.log("หลังติดตั้งแล้วรัน: gh auth login")

    // บันทึก issue ลงไฟล์ local แทน
    const localDir = path.join(ROOT, ".issues")
    await fs.mkdir(localDir, { recursive: true })
    const filename = `${Date.now()}_${title.replace(/\s+/g, "-").toLowerCase()}.md`
    const body = TYPE_TEMPLATE[type]?.(title) ?? TYPE_TEMPLATE.task(title)
    await fs.writeFile(path.join(localDir, filename), `# ${title}\n\n${body}`)
    console.log(`\n💾 บันทึก issue ลง .issues/${filename} ไว้ก่อน`)
    console.log("   เมื่อติดตั้ง gh แล้วสามารถ push ได้ภายหลัง")
    return
  }

  // ตรวจสอบ auth
  if (!checkGhAuth()) {
    console.log("⚠️  ยังไม่ได้ login GitHub CLI")
    console.log("รัน: gh auth login")
    process.exit(1)
  }

  // สร้าง body
  const body = TYPE_TEMPLATE[type]?.(title) ?? TYPE_TEMPLATE.task(title)
  const labels = [TYPE_LABEL[type], label].filter(Boolean).join(",")

  try {
    const result = spawnSync(
      "gh",
      ["issue", "create", "--title", title, "--body", body, "--label", labels],
      { encoding: "utf-8", stdio: "pipe" }
    )

    if (result.status === 0) {
      const url = result.stdout.trim()
      console.log(`✅ สร้าง issue สำเร็จ`)
      console.log(`🔗 ${url}`)

      // บันทึกลง changelog
      execSync(`node scripts/update-changelog.mjs "สร้าง issue: ${title}" --type added`, {
        cwd: ROOT,
      })
    } else {
      console.error("❌ สร้าง issue ล้มเหลว:", result.stderr)
    }
  } catch (err) {
    console.error("❌ Error:", err.message)
  }
}

createIssue().catch(console.error)
