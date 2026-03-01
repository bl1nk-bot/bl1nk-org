# CHANGELOG

บันทึกการตัดสินใจและการเปลี่ยนแปลงทั้งหมดของโปรเจ็ค  
อัปเดตอัตโนมัติด้วย `node scripts/update-changelog.mjs`

---

## 2026-02-26
- ✅ **[ADDED]** สร้าง scripts/ สำหรับนำทางโปรเจ็ค: check-structure, progress, update-changelog, create-issue, update-docs
- ✅ **[ADDED]** สร้าง templates/ สำหรับไฟล์ต้นแบบทั้งหมด
- ✅ **[ADDED]** สร้าง .vscode/settings.json และ extensions.json
- ✅ **[ADDED]** สร้าง SPEC.md, CHANGELOG.md, CHANGELOG.json, AGENTS.md, TODO.md

## 2026-02-23
- 🧭 **[DECISION]** ไม่ fork obsidian-agent-client — เขียนใหม่ใช้เป็น reference เท่านั้น โค้ดเดิมทดสอบแล้วห้ามแก้
- 🧭 **[DECISION]** ย้ายโครงสร้างจาก 3 repo แยก → monorepo `packages/obsidian`, `packages/cloudflare`, `packages/vercel`
- 🧭 **[DECISION]** Python sandbox: Cloudflare V8 → Modal.com — รัน Python ได้จริง per-call isolate
- 🧭 **[DECISION]** Node.js sandbox: Cloudflare V8 → Vercel + Bun + spawn — per-call background execution
- 🧭 **[DECISION]** Cloudflare role ลดเหลือ Gateway + R2 + serve files เท่านั้น — ไม่รันโค้ด agent
- 🧭 **[DECISION]** MCP เชื่อมตรงจาก plugin/CLI — ไม่ผ่าน Cloudflare Gateway ทุกกรณี
- 🧭 **[DECISION]** ACP คือ protocol กลางเท่านั้น — ไม่ใช่ tool ไม่ใช่ server
- 🧭 **[DECISION]** เพิ่ม Drizzle ORM + PostgreSQL — gen จาก `src/types/*.types.ts` ไม่เขียน schema แยก
- 🧭 **[DECISION]** pgvector เพิ่มใน Phase 2 เท่านั้น
- 🧭 **[DECISION]** Modal/Vercel sandbox อาจเป็น built-in tool หรือ MCP server ก็ได้ — ไม่ตายตัว
- 🧭 **[DECISION]** ใช้ Bun + spawn ทั้ง Modal และ Vercel เพื่อความเร็วสูงสุด
