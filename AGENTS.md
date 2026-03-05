# 🤖 AGENTS.md — Global Multi-Agent Instruction Guide

ไฟล์นี้คือ **Single Source of Truth** สำหรับ AI Agents ทุกตัว (Gemini, Claude, Qwen) เพื่อให้เข้าใจบริบท โครงสร้าง และมาตรฐานของโปรเจกต์ **bl1nk-org** อย่างเป๊ะที่สุด

---

## 🎯 Project Vision
**bl1nk** คือ Open-source AI Agent Control Plane แบบ Cloud-Native ที่ถูกออกแบบมาเพื่อ "สวมสิทธิ์" (Identity Assumption) AI Subscription ของผู้ใช้ผ่าน Cloud Browser (Playwright on Modal.com) เพื่อให้ผู้ใช้สามารถรัน Agent ได้ทุกที่โดยไม่ต้องพึ่งพา Hardware ตัวเอง

---

## 🏗️ Core Architecture & Responsibility Map



| Layer | Technology Stack | Location | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 16 + React 19 | `apps/web/` | Web Layouts, Server Actions, Route Handlers |
| **Desktop** | Tauri v2 + Rust | `apps/desktop/` | Native OS Hooks, Local Resource Management |
| **Database** | Prisma + Neon | `packages/db/` | Centralized Schema & Database Client (Singleton) |
| **UI Kit** | shared shadcn/ui | `packages/ui/` | Standard Atomic Components (Materials only) |
| **Identity** | AES-256-GCM | `packages/identity-vault/` | Secure encryption/decryption of browser sessions |
| **Worker** | Modal (Python) | `modal/workers/` | Headless Playwright & CLI Execution Nodes |
| **Protocol** | @bl1nk/sdk | `packages/sdk/` | Adapter Interfaces & Global Types |

---

## 🛠️ Strict Engineering Standards

### 1. Database & Persistence (The Prisma Rule)
- **Schema Ownership:** แก้ไขที่ `packages/db/prisma/schema.prisma` เท่านั้น
- **No Direct Access:** ห้ามติดตั้ง Prisma Client ใน `apps/` แต่ละแอปแยกกัน ให้ใช้ผ่าน `@bl1nk/db`
- **Workflow:** `Edit Schema` -> `bun run db:generate` (at root) -> `Implement Logic`

### 2. UI Development Workflow
- **Standard Components:** ดึงจาก `@bl1nk/ui` เสมอ ห้ามสร้าง Button หรือ Input ซ้ำในแอป
- **Feature Components:** ถ้า UI มีการผูก Logic (เช่น `TerminalContainer`) ให้สร้างไว้ใน `apps/web/features/[name]/components`
- **Styling:** ใช้ **Tailwind CSS v4** (CSS-first variables) ห้ามเขียน Custom CSS หากไม่จำเป็นจริงๆ

### 3. Tooling & Linter
- **Linter/Formatter:** ใช้ **Biome** เท่านั้น (ห้ามใช้ ESLint หรือ Prettier)
- **Task Runner:** ใช้ **Just** (`justfile`) สำหรับรวมคำสั่งสำคัญ
- **Package Manager:** **Bun** 1.1.0+ เท่านั้น

---

## 🔄 Critical Data Flows (The "Identity Bridge")



1. **Capture:** Modal Worker รัน Playwright เพื่อ Login และบันทึก `storage_state.json`
2. **Protect:** Backend รับไฟล์ JSON และใช้ `@bl1nk/identity-vault` เข้ารหัสแบบ AES-256-GCM
3. **Store:** บันทึก Encrypted Blob ลงใน Neon Database ผ่าน Prisma
4. **Assume Identity:** เมื่อเรียกใช้ Agent (เช่น Claude CLI) ระบบจะ Decrypt ข้าม Cloud ไปที่ Modal เพื่อสวมสิทธิ์การทำงานทันที

---

## 📜 Agent Operational Protocols

**เมื่อได้รับคำสั่งให้ทำงาน:**

1. **Vertical Discovery:** ค้นหา `AGENTS.md` ในโฟลเดอร์ย่อย (เช่น `packages/db/AGENTS.md`) เพื่อดูรายละเอียดเฉพาะทาง
2. **Schema First:** หากมีการบันทึกข้อมูล ต้องอัปเดต Prisma Schema และทำ Migration ก่อนเสมอ
3. **Atomic UI:** ตรวจสอบว่าคอมโพแนนท์ที่ต้องการมีอยู่ใน `@bl1nk/ui` หรือไม่ ถ้าไม่มีให้เพิ่มเข้าแพ็คเกจส่วนกลางก่อน
4. **Validation:** ใช้ **Zod** ตรวจสอบ Type Safety ระหว่างการส่งข้อมูลข้าม Layer (Web <-> API <-> Modal)
5. **Clean Up:** รัน `bun run lint` ทุกครั้งก่อนจบงาน

---

## 📞 Shared Context Keys
* **Primary Author:** billlzzz18 (Bill)
* **Status:** Phase 1 - Identity Bridge & Database Foundations
* **Tech Stack Focus:** Next.js 16.1.16, React 19, Prisma, Modal, Bun, Biome, Tailwind v4

---
<p align="center">"Code for many clients, Execute on one cloud, Secure every identity."</p>
