#!/usr/bin/env node
/**
 * update-changelog.mjs
 * บันทึกการตัดสินใจและการเปลี่ยนแปลงลง CHANGELOG.json และ CHANGELOG.md
 * อัปเดต SPEC.md version อัตโนมัติ
 *
 * วิธีใช้:
 *   node scripts/update-changelog.mjs "ย้ายโครงสร้างเป็น monorepo packages/"
 *   node scripts/update-changelog.mjs "เพิ่ม Drizzle" --type decision
 *   node scripts/update-changelog.mjs "สร้าง AdapterRegistry.ts" --type added
 *   node scripts/update-changelog.mjs "ลบ V8 sandbox ออก" --type removed
 *
 * --type: added | removed | changed | decision | fixed (default: changed)
 */

import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";

const ROOT = process.cwd();
const CHANGELOG_JSON = path.join(ROOT, "CHANGELOG.json");
const CHANGELOG_MD = path.join(ROOT, "CHANGELOG.md");
const SPEC_MD = path.join(ROOT, "SPEC.md");

const args = process.argv.slice(2);
const typeIndex = args.indexOf("--type");
const type = typeIndex !== -1 ? args[typeIndex + 1] : "changed";
const summary = args.filter((a, i) => a !== "--type" && i !== typeIndex + 1).join(" ");

const TYPE_EMOJI = {
  added: "✅",
  removed: "🗑️",
  changed: "🔄",
  decision: "🧭",
  fixed: "🐛",
};

async function readJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  return JSON.parse(await fs.readFile(file, "utf-8"));
}

async function updateChangelog() {
  if (!summary) {
    console.error("❌ ต้องระบุ summary\nตัวอย่าง: node scripts/update-changelog.mjs \"ย้าย monorepo\"");
    process.exit(1);
  }

  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().slice(0, 5);

  const entry = {
    id: Date.now(),
    date,
    time,
    type,
    summary,
    emoji: TYPE_EMOJI[type] ?? "📝",
  };

  // อัปเดต CHANGELOG.json
  const changelog = await readJson(CHANGELOG_JSON, []);
  changelog.push(entry);
  await fs.writeFile(CHANGELOG_JSON, JSON.stringify(changelog, null, 2));
  console.log(`✅ บันทึกลง CHANGELOG.json`);

  // อัปเดต CHANGELOG.md
  let md = existsSync(CHANGELOG_MD) ? await fs.readFile(CHANGELOG_MD, "utf-8") : "# CHANGELOG\n\n";

  // หาหรือสร้าง section ของวันนี้
  const dateHeader = `## ${date}`;
  if (!md.includes(dateHeader)) {
    md += `\n${dateHeader}\n`;
  }
  const insertLine = `- ${entry.emoji} **[${type.toUpperCase()}]** ${summary} _(${time})_`;
  md = md.replace(dateHeader, `${dateHeader}\n${insertLine}`);
  await fs.writeFile(CHANGELOG_MD, md);
  console.log(`✅ บันทึกลง CHANGELOG.md`);

  // อัปเดต version ใน SPEC.md
  if (existsSync(SPEC_MD)) {
    let spec = await fs.readFile(SPEC_MD, "utf-8");
    const versionMatch = spec.match(/Blueprint version: (\d+)\.(\d+)\.(\d+)/);
    if (versionMatch) {
      const [, major, minor, patch] = versionMatch.map(Number);
      const newPatch = patch + 1;
      const newVersion = `${major}.${minor}.${newPatch}`;
      spec = spec.replace(
        /Blueprint version: \d+\.\d+\.\d+.*/,
        `Blueprint version: ${newVersion} — อัปเดต ${date}`
      );
      await fs.writeFile(SPEC_MD, spec);
      console.log(`✅ อัปเดต SPEC.md version → ${newVersion}`);
    }
  }

  console.log(`\n📝 บันทึก: ${entry.emoji} [${type}] ${summary}`);
}

updateChangelog().catch(console.error);
