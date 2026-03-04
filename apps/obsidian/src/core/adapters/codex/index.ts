/**
 * packages/obsidian/src/core/adapter/codex/index.ts
 * export หลักสำหรับ Codex adapter
 */

export type { CodexAdapterConfig } from "./CodexAdapter"
export { CodexAdapter } from "./CodexAdapter"
export type { AcpContentBlock } from "./CodexContent"
export { buildAcpContent, fileBlock, imageBlock, textBlock } from "./CodexContent"
export type { CodexCustomPrompt, ParsedSlashCommand } from "./CodexSlash"
export {
  expandNamedArgs,
  expandPositionalArgs,
  expandSlashCommand,
  parseSlashCommand,
} from "./CodexSlash"
