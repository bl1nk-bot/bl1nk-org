// src/types/store.types.ts
import type { PluginSettings } from "./acp.types";
import type { Project } from "./project.types";
import type { SessionRecord } from "./session.types";
import type { Tool } from "./tool.types";
import type { Skill } from "./skill.types";
import type { MCPServer } from "./mcp.types";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  context?: Record<string, unknown>;
}

export interface PluginStore {
  version: string;
  settings: PluginSettings;
  projects: Project[];
  sessions: SessionRecord[];
  tools: Tool[];
  skills: Skill[];
  mcpServers: MCPServer[];
  logs: LogEntry[];
}

// Scope resolvers — ใช้ใน ProjectManager และ ACPManager
export function resolveTools(store: PluginStore, project: Project): Tool[] {
  const merged = new Map<string, Tool>();
  store.tools.filter(t => t.scope === "global").forEach(t => merged.set(t.id, t));
  store.tools.filter(t => project.toolIds.includes(t.id)).forEach(t => merged.set(t.id, t));
  return Array.from(merged.values());
}

export function resolveMCPServers(store: PluginStore, project: Project): MCPServer[] {
  const merged = new Map<string, MCPServer>();
  store.mcpServers.filter(m => m.scope === "global").forEach(m => merged.set(m.id, m));
  store.mcpServers.filter(m => project.mcpIds.includes(m.id)).forEach(m => merged.set(m.id, m));
  return Array.from(merged.values());
}

export function resolveSkills(store: PluginStore, project: Project): Skill[] {
  const merged = new Map<string, Skill>();
  store.skills.filter(s => s.scope === "global").forEach(s => merged.set(s.id, s));
  store.skills.filter(s => project.skillIds.includes(s.id)).forEach(s => merged.set(s.id, s));
  return Array.from(merged.values());
}