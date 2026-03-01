import type { ACPAgentConfig, ACPInitializeResult } from "../../types/acp.types";

/** ข้อมูล session ที่ adapter สร้างขึ้น */
export interface AdapterSession {
  /** session id จาก ACP SDK — ไม่ใช่ plugin session.id */
  acpSessionId: string;
  /** working directory ของ session นี้ */
  cwd: string;
}

/** content block สำหรับส่ง prompt */
export interface AdapterContentBlock {
  type: "text" | "image" | "file";
  /** สำหรับ type=text */
  text?: string;
  /** สำหรับ type=image */
  data?: string;
  mimeType?: string;
  /** สำหรับ type=file — path ของไฟล์ใน vault */
  filePath?: string;
  fileText?: string;
}

/** ผลลัพธ์จากการส่ง prompt */
export interface AdapterPromptResult {
  stopReason: string;
}

/**
 * interface กลางที่ทุก agent adapter ต้อง implement
 * เพิ่ม adapter ใหม่ได้โดยไม่แตะโค้ดเดิม
 */
export interface BaseAdapter {
  /** ชื่อ adapter เช่น "codex", "claude", "gemini" */
  readonly name: string;

  /** เชื่อมต่อกับ agent process */
  connect(config: ACPAgentConfig): Promise<ACPInitializeResult>;

  /** ตัดการเชื่อมต่อและ cleanup */
  disconnect(): Promise<void>;

  /** ตรวจสอบว่า agent ยังทำงานอยู่ไหม */
  isActive(): boolean;

  /** สร้าง session ใหม่ */
  createSession(cwd: string, mcpServers?: unknown[]): Promise<AdapterSession>;

  /** โหลด session เดิม */
  loadSession(sessionId: string, cwd: string, mcpServers?: unknown[]): Promise<AdapterSession>;

  /** ส่ง prompt ไปยัง agent */
  prompt(sessionId: string, content: AdapterContentBlock[]): Promise<AdapterPromptResult>;

  /** ยกเลิก prompt ที่กำลังรัน */
  cancel(sessionId: string): Promise<void>;

  /** เปลี่ยน mode เช่น review / compact */
  setMode?(sessionId: string, modeId: string): Promise<void>;

  /** เปลี่ยน model */
  setModel?(sessionId: string, modelId: string): Promise<void>;
}