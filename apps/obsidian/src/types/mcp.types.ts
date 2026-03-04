// src/types/mcp.types.ts
export type MCPTransport = "stdio" | "sse" | "http"
export type MCPScope = "global" | "project"

export interface MCPStdioConfig {
  command: string
  args?: string[]
  env?: Record<string, string>
}

export interface MCPHttpConfig {
  endpoint: string
  apiKey?: string
}

export interface MCPServer {
  id: string
  name: string
  description?: string
  enabled: boolean
  scope: MCPScope
  transport: MCPTransport
  stdio?: MCPStdioConfig
  http?: MCPHttpConfig
  capabilities?: string[]
}
