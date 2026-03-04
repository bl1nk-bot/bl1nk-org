export interface NoteContext {
  title: string
  path: string
  content?: string
}

export interface RAGSource {
  title: string
  excerpt: string
  score: number
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  agentId: string
  streaming?: boolean
  noteContext?: NoteContext
  ragSources?: RAGSource[]
}

export type SessionStatus = "active" | "ended" | "error"

export interface SessionRecord {
  id: string
  acpSessionId?: string
  projectId: string
  agentId: string
  status: SessionStatus
  startedAt: string
  endedAt?: string
  noteContext?: NoteContext
  ragContext?: RAGSource[]
  messages: ChatMessage[]
  toolsUsed: Array<{
    toolId: string
    calledAt: string
    result?: string
  }>
}
