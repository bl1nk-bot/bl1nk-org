const { execSync } = require("node:child_process")

// 1. ระบุชื่อ Branch ปัจจุบัน
const branchName = process.env.VERCEL_GIT_COMMIT_REF || ""

function shouldProceedBuild() {
  // บล็อก Branch ที่ไม่ต้องการรัน Build (เช่น Branch ทดสอบอัตโนมัติ)
  const forbiddenPrefixes = ["gru/", "automatic/", "reproduction/", "test/"]
  const isForbiddenBranch =
    branchName === "lighthouse" ||
    forbiddenPrefixes.some((p) => branchName.toLowerCase().startsWith(p))

  if (isForbiddenBranch) {
    console.log(`Branch "${branchName}" is restricted from building.`)
    return false
  }

  try {
    /**
     * 2. สั่ง Git Diff ตรวจสอบความเปลี่ยนแปลง
     * สำหรับ bl1nk-org เราต้องแน่ใจว่าถ้าแก้ไฟล์ใน packages ที่เกี่ยวข้อง
     * เช่น @bl1nk/db หรือ @bl1nk/ui แอป Web ต้อง Build ใหม่
     */
    const diffCommand =
      'git diff HEAD^ HEAD --quiet -- \
      "." \
      ":!**/*.md" \
      ":!**/docs/**" \
      ":!./.github/**" \
      ":!./scripts/**" \
      ":!./biome.json" \
      ":!./justfile"'

    // --quiet จะ return 0 ถ้าไม่มีอะไรเปลี่ยน (catch จะไม่ทำงาน)
    // จะ throw error (เข้า catch) ถ้ามีการเปลี่ยนแปลงไฟล์ที่ไม่ได้อยู่ใน ignore list
    execSync(diffCommand)

    return false // ไม่มีการเปลี่ยนที่สำคัญ -> ยกเลิก Build
  } catch (_error) {
    return true // มีการเปลี่ยนไฟล์สำคัญ -> เริ่ม Build
  }
}

const shouldBuild = shouldProceedBuild()

if (shouldBuild) {
  console.log("✅ - Changes detected in core logic or apps. Proceeding with build...")
  process.exit(1)
} else {
  console.log("🛑 - No critical changes detected or branch is restricted. Build cancelled.")
  process.exit(0)
}
