# scripts/

Script สำหรับนำทางและกำหนดทิศทางโปรเจ็ค

---

## 🧭 กลุ่มนำทางโปรเจ็ค (ควรรันก่อนเริ่มงาน)

### `check-structure.mjs` — ตรวจโครงสร้าง

```bash
node scripts/check-structure.mjs         # ตรวจอย่างเดียว
node scripts/check-structure.mjs --fix   # สร้างโฟลเดอร์ที่ขาดอัตโนมัติ
```

แสดง: ✅ มีแล้ว | ❌ ขาด | [NEW] ต้องสร้าง

---

### `progress.mjs` — ความคืบหน้า

```bash
node scripts/progress.mjs          # แสดงแบบ human-readable
node scripts/progress.mjs --json   # แสดงเป็น JSON (สำหรับ CI)
```

แสดง: phase, % คืบหน้า, งานค้าง, การตัดสินใจล่าสุด

---

### `update-changelog.mjs` — บันทึกการตัดสินใจ

```bash
node scripts/update-changelog.mjs "ย้ายโครงสร้างเป็น monorepo" --type decision
node scripts/update-changelog.mjs "สร้าง AdapterRegistry.ts" --type added
node scripts/update-changelog.mjs "ลบ V8 sandbox ออก" --type removed
node scripts/update-changelog.mjs "แก้ bug GatewayClient" --type fixed
```

`--type`: `added` | `removed` | `changed` | `decision` | `fixed`

อัปเดต: `CHANGELOG.json` + `CHANGELOG.md` + version ใน `SPEC.md`

---

### `create-issue.mjs` — สร้าง GitHub issue

```bash
node scripts/create-issue.mjs "สร้าง AdapterRegistry" --type task
node scripts/create-issue.mjs "แก้ bug session ค้าง" --type bug
node scripts/create-issue.mjs "เพิ่ม pgvector support" --type feature
node scripts/create-issue.mjs "ย้าย structure monorepo" --type refactor
```

`--type`: `task` | `bug` | `feature` | `refactor`

ถ้าไม่มี `gh` CLI จะแนะนำวิธีติดตั้ง และบันทึก issue ลง `.issues/` ไว้ก่อน

---

### `update-docs.mjs` — อัปเดต README + AGENTS.md

```bash
node scripts/update-docs.mjs           # อัปเดตทั้งคู่
node scripts/update-docs.mjs --readme  # เฉพาะ README.md
node scripts/update-docs.mjs --agents  # เฉพาะ AGENTS.md
```

---

## วิธีใช้ผ่าน package.json

เพิ่มใน `package.json`:

```json
{
  "scripts": {
    "check:structure": "node scripts/check-structure.mjs",
    "check:structure:fix": "node scripts/check-structure.mjs --fix",
    "progress": "node scripts/progress.mjs",
    "changelog": "node scripts/update-changelog.mjs",
    "create:issue": "node scripts/create-issue.mjs",
    "update:docs": "node scripts/update-docs.mjs"
  }
}
```

แล้วรันด้วย:

```bash
pnpm check:structure
pnpm progress
pnpm changelog "ตัดสินใจใช้ Modal เป็น Python sandbox" --type decision
pnpm create:issue "สร้าง AdapterRegistry" --type task
pnpm update:docs
```

---

## ลำดับที่แนะนำก่อนเริ่มงานทุกครั้ง

```bash
# 1. ตรวจโครงสร้าง
node scripts/check-structure.mjs

# 2. ดูความคืบหน้า
node scripts/progress.mjs

# 3. อ่าน AGENTS.md
cat AGENTS.md
```
