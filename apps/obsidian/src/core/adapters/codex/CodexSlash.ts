/**
 * CodexSlash.ts
 * จัดการ custom slash commands สำหรับ Codex agent
 * รองรับ named arguments ($ARG) และ positional arguments ($1, $2)
 */

/** นิยาม custom prompt สำหรับ slash command */
export interface CodexCustomPrompt {
  /** ชื่อ command เช่น "review-pr" */
  name: string
  /** template ที่มี placeholder เช่น "$PR_NUMBER" */
  content: string
  /** คำอธิบายสั้นๆ */
  description?: string
  /** hint สำหรับ argument เช่น "PR_NUMBER=123" */
  argumentHint?: string
}

/** ผลลัพธ์จากการ parse slash command */
export interface ParsedSlashCommand {
  /** ชื่อ command ไม่มี "/" */
  name: string
  /** arguments ที่ตามมา */
  args: string
}

/**
 * parse slash command จาก message
 * รับ "/command-name ARG1=value" แล้วแยก name และ args
 *
 * @param message - ข้อความจาก user
 * @returns parsed command หรือ null ถ้าไม่ใช่ slash command
 */
export function parseSlashCommand(message: string): ParsedSlashCommand | null {
  const trimmed = message.trim()
  if (!trimmed.startsWith("/")) return null

  const spaceIdx = trimmed.indexOf(" ")
  if (spaceIdx === -1) {
    // เป็น "/" ตามด้วยชื่อเฉยๆ ไม่มี args
    return { name: trimmed.slice(1), args: "" }
  }

  return {
    name: trimmed.slice(1, spaceIdx),
    args: trimmed.slice(spaceIdx + 1).trim(),
  }
}

/**
 * แทนที่ named placeholder ใน template ด้วย argument values
 * รองรับ pattern: KEY=value KEY2="value with space"
 *
 * @param template - template string ที่มี $KEY
 * @param argsString - argument string เช่น "PR_NUMBER=123 AUTHOR=alice"
 */
export function expandNamedArgs(template: string, argsString: string): string {
  // parse "KEY=value" หรือ 'KEY="value with space"'
  const pairs = argsString.matchAll(/(\w+)=(?:"([^"]*)"|(\S+))/g)
  const argMap: Record<string, string> = {}

  for (const match of pairs) {
    const key = match[1]
    const value = match[2] ?? match[3] ?? ""
    argMap[key] = value
  }

  // แทนที่ $KEY ด้วย value
  let result = template
  for (const [key, value] of Object.entries(argMap)) {
    result = result.replaceAll(`$${key}`, value)
  }

  // แทนที่ $ARGUMENTS ด้วย args string ทั้งหมด
  result = result.replaceAll("$ARGUMENTS", argsString)

  return result
}

/**
 * แทนที่ positional placeholder ใน template
 * รองรับ $1, $2, $3 และ $ARGUMENTS
 *
 * @param template - template string ที่มี $1, $2
 * @param args - array ของ arguments
 */
export function expandPositionalArgs(template: string, args: string[]): string {
  let result = template

  // แทนที่ $1, $2, $3...
  args.forEach((arg, idx) => {
    result = result.replaceAll(`$${idx + 1}`, arg)
  })

  // แทนที่ $ARGUMENTS ด้วยทั้งหมด
  result = result.replaceAll("$ARGUMENTS", args.join(" "))

  return result
}

/**
 * ขยาย slash command เป็น prompt จริง
 * ค้นหา command ใน customPrompts แล้ว expand arguments
 *
 * @param message - ข้อความจาก user
 * @param customPrompts - รายการ custom prompts ที่กำหนดไว้
 * @returns expanded prompt หรือ null ถ้าไม่ match
 */
export function expandSlashCommand(
  message: string,
  customPrompts: CodexCustomPrompt[]
): string | null {
  const parsed = parseSlashCommand(message)
  if (!parsed) return null

  const prompt = customPrompts.find((p) => p.name === parsed.name)
  if (!prompt) return null

  // ลอง named args ก่อน ถ้ามี "=" ใน args
  if (parsed.args.includes("=")) {
    return expandNamedArgs(prompt.content, parsed.args)
  }

  // ถ้าไม่มี "=" ใช้ positional args
  const positionalArgs = parsed.args ? parsed.args.split(/\s+/) : []
  return expandPositionalArgs(prompt.content, positionalArgs)
}
