/**
 * CodexAdapter.ts
 * Adapter สำหรับ Codex agent-CLI
 * implement BaseAdapter โดยใช้ ACPManager เป็น transport layer
 *
 * ไม่แก้ ACPManager.ts — ใช้เป็น dependency เท่านั้น
 */

import type { EventBus } from "../../services/EventBus"
import type { ACPAgentConfig, ACPInitializeResult } from "../../types/acp.types"
import { ACPManager } from "../ACPManager"
import type {
  AdapterContentBlock,
  AdapterPromptResult,
  AdapterSession,
  BaseAdapter,
} from "../BaseAdapter"
import { buildAcpContent } from "./CodexContent"
import { type CodexCustomPrompt, expandSlashCommand } from "./CodexSlash"

/** config เพิ่มเติมสำหรับ Codex โดยเฉพาะ */
export interface CodexAdapterConfig {
  /** custom slash commands ที่กำหนดสำหรับโปรเจ็คนี้ */
  customPrompts?: CodexCustomPrompt[]
}

/**
 * Adapter สำหรับ OpenAI Codex CLI
 * เชื่อม Codex กับ plugin ผ่าน ACP protocol
 *
 * วิธีใช้:
 * ```typescript
 * const adapter = new CodexAdapter(eventBus);
 * await adapter.connect(config);
 * const session = await adapter.createSession("/vault/project");
 * await adapter.prompt(session.acpSessionId, [textBlock("สวัสดี")]);
 * ```
 */
export class CodexAdapter implements BaseAdapter {
  readonly name = "codex"

  private manager: ACPManager
  private customPrompts: CodexCustomPrompt[]
  private activeSessions = new Map<string, AdapterSession>()

  constructor(eventBus: EventBus, config: CodexAdapterConfig = {}) {
    this.manager = new ACPManager("node", eventBus)
    this.customPrompts = config.customPrompts ?? []
  }

  /**
   * เชื่อมต่อกับ Codex agent process
   * ใช้ executablePath จาก config — ต้องเป็น path ของ codex binary
   *
   * @param config - ACP agent config จาก settings
   */
  async connect(config: ACPAgentConfig): Promise<ACPInitializeResult> {
    // เพิ่ม --acp flag ถ้ายังไม่มี (Codex ต้องการ flag นี้)
    const codexConfig: ACPAgentConfig = {
      ...config,
      args: config.args?.includes("--acp") ? config.args : ["--acp", ...(config.args ?? [])],
    }
    return await this.manager.connect(codexConfig)
  }

  /** ตัดการเชื่อมต่อและ cleanup sessions ทั้งหมด */
  async disconnect(): Promise<void> {
    this.activeSessions.clear()
    await this.manager.disconnect()
  }

  /** ตรวจสอบว่า Codex process ยังทำงานอยู่ไหม */
  isActive(): boolean {
    return this.manager.isActive()
  }

  /**
   * สร้าง session ใหม่
   * บันทึก session ไว้ใน activeSessions เพื่อ lookup ทีหลัง
   *
   * @param cwd - working directory ของ session
   * @param mcpServers - MCP servers ที่จะ attach กับ session นี้
   */
  async createSession(cwd: string, mcpServers: unknown[] = []): Promise<AdapterSession> {
    const acpSessionId = await this.manager.createSession(cwd, mcpServers)
    const session: AdapterSession = { acpSessionId, cwd }
    this.activeSessions.set(acpSessionId, session)
    return session
  }

  /**
   * โหลด session เดิมกลับมา
   *
   * @param sessionId - ACP session id ที่ต้องการโหลด
   * @param cwd - working directory
   * @param mcpServers - MCP servers
   */
  async loadSession(
    sessionId: string,
    cwd: string,
    mcpServers: unknown[] = []
  ): Promise<AdapterSession> {
    await this.manager.loadSession(sessionId, cwd, mcpServers)
    const session: AdapterSession = { acpSessionId: sessionId, cwd }
    this.activeSessions.set(sessionId, session)
    return session
  }

  /**
   * ส่ง prompt ไปยัง Codex
   * รองรับ text, image, file (@-mention) และ slash commands
   *
   * @param sessionId - ACP session id
   * @param content - content blocks ที่จะส่ง
   */
  async prompt(sessionId: string, content: AdapterContentBlock[]): Promise<AdapterPromptResult> {
    // ถ้ามี text block ตัวแรก ลองดูว่าเป็น slash command ไหม
    const firstText = content.find((b) => b.type === "text")?.text ?? ""
    const expanded = expandSlashCommand(firstText, this.customPrompts)

    // ถ้า expand ได้ ให้แทนที่ text block แรกด้วย expanded version
    const finalContent: AdapterContentBlock[] = expanded
      ? [{ type: "text", text: expanded }, ...content.filter((b) => b.type !== "text")]
      : content

    // แปลงเป็น ACP format แล้วส่งผ่าน ACPManager
    const acpContent = buildAcpContent(finalContent)
    return await this.manager.prompt(sessionId, acpContent as any)
  }

  /**
   * ยกเลิก prompt ที่กำลังรัน
   * ส่ง cancel signal ไปยัง Codex process
   *
   * @param sessionId - ACP session id ที่ต้องการยกเลิก
   */
  async cancel(sessionId: string): Promise<void> {
    // ACPManager ยังไม่มี cancel — emit event ให้ UI รับรู้แทน
    this.manager.getEventBus().emit("acp:cancelled", { sessionId })
  }

  /**
   * เปลี่ยน mode เช่น review / compact
   *
   * @param sessionId - ACP session id
   * @param modeId - mode ที่ต้องการ
   */
  async setMode(sessionId: string, modeId: string): Promise<void> {
    await this.manager.setSessionMode(sessionId, modeId)
  }

  /**
   * ดึง EventBus เพื่อ subscribe events จากภายนอก
   */
  getEventBus(): EventBus {
    return this.manager.getEventBus()
  }

  /**
   * ดึงข้อมูล session ที่ active อยู่
   *
   * @param sessionId - ACP session id
   */
  getSession(sessionId: string): AdapterSession | undefined {
    return this.activeSessions.get(sessionId)
  }

  /**
   * เพิ่ม custom prompt สำหรับ slash command
   *
   * @param prompt - custom prompt ที่ต้องการเพิ่ม
   */
  addCustomPrompt(prompt: CodexCustomPrompt): void {
    // ลบ prompt เดิมที่ชื่อซ้ำก่อน แล้วเพิ่มใหม่
    this.customPrompts = this.customPrompts.filter((p) => p.name !== prompt.name)
    this.customPrompts.push(prompt)
  }
}
