# obsidian-acp-bl1nk

>v0.0.2

> Obsidian plugin ที่เชื่อม ACP, MCP, และ sandboxed runtimes เข้าด้วยกัน

## Overview

Plugin สำหรับใช้ AI agents ภายใน Obsidian โดยรองรับ:
- **ACP Protocol** — เชื่อมกับ Claude Code, Gemini CLI, Codex, QwenCoder
- **MCP Protocol** — เชื่อม tools ผ่าน stdio / sse / http
- **Sandbox** — Modal (Python) และ Vercel (Node.js) per-call execution
- **RAG** — AnythingLLM integration

---

## โครงสร้างโปรเจ็ค

```
packages/
├── obsidian/    # Obsidian Plugin
├── cloudflare/  # Gateway + R2 Storage
└── vercel/      # Node.js Sandbox + Dashboard
drizzle/         # Shared database schema
scripts/         # Project management scripts
templates/       # File templates
```

---

## เริ่มต้นใช้งาน

```bash
pnpm install
pnpm dev
```

---

## Scripts

```bash
pnpm check:structure        # ตรวจโครงสร้างโฟลเดอร์
pnpm check:structure:fix    # สร้างโฟลเดอร์ที่ขาดอัตโนมัติ
pnpm progress               # ดูความคืบหน้า
pnpm changelog "..." --type decision   # บันทึกการตัดสินใจ
pnpm create:issue "..." --type task    # สร้าง GitHub issue
pnpm update:docs            # อัปเดต README + AGENTS.md
```

---

## เอกสาร

| ไฟล์ | เนื้อหา |
|---|---|
| `SPEC.md` | Architecture, การตัดสินใจ, กฎสำคัญ |
| `AGENTS.md` | คู่มือสำหรับ AI agent |
| `CHANGELOG.md` | บันทึกการเปลี่ยนแปลง |
| `scripts/README.md` | วิธีใช้ scripts ทั้งหมด |

---

## การเปลี่ยนแปลงล่าสุด

- 🧭 ย้ายโครงสร้างเป็น monorepo `packages/`
- 🧭 ใช้ Modal เป็น Python sandbox
- 🧭 ใช้ Vercel เป็น Node.js sandbox + Dashboard
- 🧭 MCP เชื่อมตรง ไม่ผ่าน Gateway
- ✅ สร้าง scripts สำหรับนำทางโปรเจ็ค

---

_อัปเดตอัตโนมัติด้วย `pnpm update:docs`_