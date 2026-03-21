import { create } from "zustand"

export type AgentStatus = "idle" | "running" | "paused" | "error"

export interface AgentTask {
  id: string
  name: string
  status: AgentStatus
  progress: number
  output?: string
}

interface AgentState {
  agents: AgentTask[]
  activeAgentId: string | null
  addAgent: (agent: AgentTask) => void
  updateAgent: (id: string, updates: Partial<AgentTask>) => void
  removeAgent: (id: string) => void
  setActiveAgent: (id: string | null) => void
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  activeAgentId: null,
  addAgent: (agent) => set((state) => ({ agents: [...state.agents, agent] })),
  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),
  removeAgent: (id) => set((state) => ({ agents: state.agents.filter((a) => a.id !== id) })),
  setActiveAgent: (activeAgentId) => set({ activeAgentId }),
}))
