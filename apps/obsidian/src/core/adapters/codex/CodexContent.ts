/**
 * CodexContent.ts
 * สร้าง content block ที่ Codex ACP ต้องการ
 * รองรับ text, image, และ EmbeddedResource (@-mention ไฟล์)
 */

import type { AdapterContentBlock } from "../BaseAdapter"

/** ContentBlock format ที่ ACP SDK ต้องการ */
export type AcpContentBlock =
  | { type: "text"; text: string; meta?: null }
  | { type: "image"; data: string; mimeType: string; meta?: null }
  | {
      type: "resource"
      resource: {
        uri: string
        text: string
        mimeType?: string
      }
      meta?: null
    }

/**
 * แปลง AdapterContentBlock → AcpContentBlock
 * ที่ Codex และ ACP SDK เข้าใจ
 *
 * @param blocks - content blocks จาก adapter layer
 * @returns content blocks ที่พร้อมส่งผ่าน ACP SDK
 */
export function buildAcpContent(blocks: AdapterContentBlock[]): AcpContentBlock[] {
  return blocks.map((block) => {
    switch (block.type) {
      case "text":
        return {
          type: "text" as const,
          text: block.text ?? "",
        }

      case "image":
        return {
          type: "image" as const,
          data: block.data ?? "",
          mimeType: block.mimeType ?? "image/png",
        }

      case "file":
        // EmbeddedResource — ใช้สำหรับ @-mention ไฟล์ใน Obsidian vault
        return {
          type: "resource" as const,
          resource: {
            uri: `file://${block.filePath ?? ""}`,
            text: block.fileText ?? "",
            mimeType: guessMimeType(block.filePath ?? ""),
          },
        }
    }
  })
}

/**
 * สร้าง text block จาก string ธรรมดา
 * shorthand สำหรับกรณีที่ส่งแค่ text
 *
 * @param text - ข้อความที่ต้องการส่ง
 */
export function textBlock(text: string): AdapterContentBlock {
  return { type: "text", text }
}

/**
 * สร้าง file block จาก path และ content ของไฟล์
 * ใช้สำหรับ @-mention note ใน Obsidian
 *
 * @param filePath - path ของไฟล์ใน vault
 * @param fileText - เนื้อหาของไฟล์
 */
export function fileBlock(filePath: string, fileText: string): AdapterContentBlock {
  return { type: "file", filePath, fileText }
}

/**
 * สร้าง image block จาก base64 data
 *
 * @param data - base64 encoded image
 * @param mimeType - mime type ของรูป
 */
export function imageBlock(data: string, mimeType = "image/png"): AdapterContentBlock {
  return { type: "image", data, mimeType }
}

/**
 * เดา MIME type จาก file extension
 * สำหรับ EmbeddedResource ที่ต้องระบุ mimeType
 *
 * @param filePath - path ของไฟล์
 */
function guessMimeType(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? ""
  const map: Record<string, string> = {
    md: "text/markdown",
    ts: "text/typescript",
    js: "text/javascript",
    json: "application/json",
    py: "text/x-python",
    rs: "text/x-rust",
    txt: "text/plain",
    html: "text/html",
    css: "text/css",
  }
  return map[ext] ?? "text/plain"
}
