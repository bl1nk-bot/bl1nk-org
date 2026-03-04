// src/types/project.types.ts
export type HookEvent =
  | "on_note_save"
  | "on_note_open"
  | "on_note_close"
  | "on_note_create"
  | "on_session_start"
  | "on_session_end"
  | "on_tool_complete"
  | "on_agent_response"

export type HookAction = "run_skill" | "run_tool" | "send_to_agent" | "notify"

export interface Hook {
  id: string
  enabled: boolean
  event: HookEvent
  action: HookAction
  targetId: string
  condition?: string
}

export interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt?: string
  vaultPath?: string
  activeAgentId?: string
  ragWorkspace?: string
  toolIds: string[]
  mcpIds: string[]
  skillIds: string[]
  hooks: Hook[]
  metadata?: Record<string, string>
}
