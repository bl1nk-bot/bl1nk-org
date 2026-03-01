/**
 * packages/obsidian/src/core/adapter/codex/index.ts
 * export หลักสำหรับ Codex adapter
 */

export { CodexAdapter } from "./CodexAdapter";
export type { CodexAdapterConfig } from "./CodexAdapter";
export { buildAcpContent, textBlock, fileBlock, imageBlock } from "./CodexContent";
export type { AcpContentBlock } from "./CodexContent";
export {
  expandSlashCommand,
  expandNamedArgs,
  expandPositionalArgs,
  parseSlashCommand,
} from "./CodexSlash";
export type { CodexCustomPrompt, ParsedSlashCommand } from "./CodexSlash";
