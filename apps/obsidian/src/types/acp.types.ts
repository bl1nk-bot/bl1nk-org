// src/types/acp.types.ts
import type {
  ClientSideConnection,
  InitializeRequest,
  InitializeResponse,
  LoadSessionRequest,
  NewSessionRequest,
  NewSessionResponse,
  PromptRequest,
  PromptResponse,
  SetSessionModeRequest,
} from "@agentclientprotocol/sdk"

export type {
  ClientSideConnection,
  InitializeRequest,
  InitializeResponse,
  LoadSessionRequest,
  NewSessionRequest,
  NewSessionResponse,
  PromptRequest,
  PromptResponse,
  SetSessionModeRequest,
}

export type ACPAgentType =
  | "claude-code"
  | "codex"
  | "gemini"
  | "qwen"
  | "goose"
  | "cline"
  | "openhands"
  | "fast-agent"
  | "custom"

export type ACPTransportType = "stdio" | "http" | "sse"

export interface ACPAgentConfig {
  id: string
  name: string
  type: ACPAgentType
  transportType: ACPTransportType // ใช้กับ ACPManager
  executablePath: string // path หรือ command
  args?: string[]
  env?: Record<string, string>
  apiKey?: string
  enabled: boolean
  capabilities: Array<"coding" | "terminal" | "file_edit" | "chat">
}

export type ContextMode = "active_note" | "rag_enriched" | "manual"

export interface MCPServerConfig {
  name: string
  transport: ACPTransportType
  command?: string
  args?: string[]
  env?: Record<string, string>
  url?: string
  headers?: Record<string, string>
}

export interface ACPSettings {
  nodePath?: string
  defaultAgentId: string
  agents: ACPAgentConfig[]
  contextMode: ContextMode
  mcpServers: MCPServerConfig[]
}

export interface RAGSettings {
  enabled: boolean
  provider: "anythingllm"
  endpoint: string
  apiKey?: string
  defaultWorkspace?: string
  topK: number
  injectMode: "prepend" | "append" | "system_prompt"
}

export interface IntegrationCredential {
  apiKey?: string
  enabled: boolean
}

export interface IntegrationsSettings {
  notion?: IntegrationCredential
  airtable?: IntegrationCredential
  clickup?: IntegrationCredential
}

export interface PluginSettings {
  version: string
  acp: ACPSettings
  rag: RAGSettings
  integrations: IntegrationsSettings
}

// ✅ DEFAULT_SETTINGS ที่ sync กับ main.ts แล้ว
export const DEFAULT_SETTINGS: PluginSettings = {
  version: "0.1.0",
  acp: {
    nodePath: "node",
    defaultAgentId: "default",
    agents: [],
    contextMode: "rag_enriched",
    mcpServers: [],
  },
  rag: {
    enabled: false,
    provider: "anythingllm",
    endpoint: "http://localhost:3001",
    apiKey: "",
    defaultWorkspace: "default",
    topK: 5,
    injectMode: "prepend",
  },
  integrations: {
    notion: { enabled: false },
    airtable: { enabled: false },
    clickup: { enabled: false },
  },
}
