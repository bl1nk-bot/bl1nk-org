// src/types/tool.types.ts
export type ToolActionType = "acp_slash" | "notion" | "airtable" | "clickup" | "javascript"
export type ToolScope = "global" | "project"

export interface ToolParameter {
  name: string
  type: "string" | "number" | "boolean" | "dropdown"
  required?: boolean
  description?: string
  default?: unknown
  options?: string[]
}

export interface ACPToolConfig {
  agentId: string
  slashCommand: string
  passActiveNote: boolean
  passRagContext: boolean
}

export interface Tool {
  id: string
  name: string
  description?: string
  version: string
  scope: ToolScope
  actionType: ToolActionType
  parameters: ToolParameter[]
  acpConfig?: ACPToolConfig
  javascriptCode?: string
}
