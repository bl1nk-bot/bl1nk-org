# Obsidian Smart Assistant — Project Blueprint

> ไฟล์นี้คือ source of truth ของโปรเจ็กต์  
> ก่อนเขียนโค้ดใดๆ ให้อ่านไฟล์นี้ก่อนเสมอ

---

## 1. Tech Stack

| Layer | Package |
|---|---|
| Plugin runtime | Obsidian Plugin API |
| ACP client | `@agentclientprotocol/sdk` |
| MCP client | `@modelcontextprotocol/sdk` |
| RAG / Knowledge | AnythingLLM REST API (HTTP only) |
| Language | TypeScript |
| Build | esbuild (ตาม obsidian-agent-client) |

---

## 2. โครงสร้างไฟล์ (src/)

```
src/
├── main.ts                        # Plugin entry point
├── settings.ts                    # DEFAULT_SETTINGS + loadSettings/saveSettings

├── types/
│   ├── acp.types.ts               # ACPAgentConfig, PluginSettings, DEFAULT_SETTINGS
│   ├── project.types.ts           # Project, Hook
│   ├── session.types.ts           # SessionRecord, ChatMessage
│   ├── tool.types.ts              # Tool, ToolParameter
│   ├── skill.types.ts             # Skill, SkillVariable
│   ├── mcp.types.ts               # MCPServer
│   ├── store.types.ts             # PluginStore (root of data.json) + resolvers
│   └── index.ts                   # re-export ทั้งหมด

├── core/
│   ├── ACPManager.ts              # spawn/kill subprocess, ส่ง prompt ผ่าน SDK
│   ├── ContextEnricher.ts         # รวม active note + RAG ก่อนส่ง ACP
│   ├── ToolManager.ts             # validate + รัน tool
│   ├── ProjectManager.ts          # CRUD project, resolve scope
│   └── KnowledgeManager.ts        # คุย AnythingLLM REST API

├── services/
│   ├── EventBus.ts                # internal event bus
│   └── Logger.ts                  # เก็บ log ใน data.json

├── integrations/
│   ├── NotionClient.ts            # MCP-based Notion integration
│   ├── AirtableClient.ts          # MCP-based Airtable integration
│   └── ClickUpClient.ts           # MCP-based ClickUp integration

└── ui/
    ├── SettingsTab.ts
    └── views/
        ├── ChatView.ts
        ├── KnowledgeView.ts
        └── ToolTemplateView.ts
```

---

## 3. data.json Structure (PluginStore)

```
data.json
├── version: string
├── settings: PluginSettings
├── projects: Project[]
├── sessions: SessionRecord[]
├── tools: Tool[]          ← global + project-scoped
├── skills: Skill[]        ← global + project-scoped
├── mcpServers: MCPServer[] ← global + project-scoped
└── logs: LogEntry[]
```

### Scoping Rules

| Entity | Global | Project-scoped |
|---|---|---|
| tool | ✅ | ✅ override ได้ |
| mcp | ✅ | ✅ override ได้ |
| skill | ✅ | ✅ override ได้ |
| session | ❌ | ✅ เสมอ |
| hook | ❌ | ✅ เสมอ |

---

## 4. JSON Schema Draft-07

### 4.1 Settings Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "osa/settings",
  "title": "PluginSettings",
  "type": "object",
  "required": ["version", "acp", "rag", "integrations"],
  "additionalProperties": false,
  "properties": {
    "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "acp": {
      "type": "object",
      "required": ["nodePath", "defaultAgentId", "agents"],
      "properties": {
        "nodePath": { "type": "string" },
        "defaultAgentId": { "type": "string" },
        "agents": { "type": "array", "items": { "$ref": "#/definitions/ACPAgentConfig" } },
        "contextMode": {
          "type": "string",
          "enum": ["active_note", "rag_enriched", "manual"],
          "default": "rag_enriched"
        }
      }
    },
    "rag": {
      "type": "object",
      "required": ["enabled"],
      "properties": {
        "enabled": { "type": "boolean" },
        "provider": { "type": "string", "enum": ["anythingllm"] },
        "endpoint": { "type": "string", "format": "uri" },
        "apiKey": { "type": "string" },
        "defaultWorkspace": { "type": "string" },
        "topK": { "type": "integer", "minimum": 1, "maximum": 20, "default": 5 },
        "injectMode": {
          "type": "string",
          "enum": ["prepend", "append", "system_prompt"],
          "default": "prepend"
        }
      }
    },
    "integrations": {
      "type": "object",
      "properties": {
        "notion":   { "$ref": "#/definitions/CredentialConfig" },
        "airtable": { "$ref": "#/definitions/CredentialConfig" },
        "clickup":  { "$ref": "#/definitions/CredentialConfig" }
      }
    }
  },
  "definitions": {
    "ACPAgentConfig": {
      "type": "object",
      "required": ["id", "name", "type", "executablePath"],
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "type": {
          "type": "string",
          "enum": ["claude-code","codex","gemini","goose","cline","openhands","fast-agent","custom"]
        },
        "executablePath": { "type": "string" },
        "apiKey": { "type": "string" },
        "enabled": { "type": "boolean", "default": true },
        "capabilities": {
          "type": "array",
          "items": { "type": "string", "enum": ["coding","terminal","file_edit","chat"] }
        }
      }
    },
    "CredentialConfig": {
      "type": "object",
      "properties": {
        "apiKey": { "type": "string" },
        "enabled": { "type": "boolean", "default": false }
      }
    }
  }
}
```

### 4.2 Project Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "osa/project",
  "title": "Project",
  "type": "object",
  "required": ["id", "name", "createdAt"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "description": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "vaultPath": { "type": "string" },
    "activeAgentId": { "type": "string" },
    "ragWorkspace": { "type": "string" },
    "toolIds": { "type": "array", "items": { "type": "string" } },
    "mcpIds": { "type": "array", "items": { "type": "string" } },
    "skillIds": { "type": "array", "items": { "type": "string" } },
    "hooks": { "type": "array", "items": { "$ref": "#/definitions/Hook" } },
    "metadata": { "type": "object", "additionalProperties": { "type": "string" } }
  },
  "definitions": {
    "Hook": {
      "type": "object",
      "required": ["id", "event", "action"],
      "additionalProperties": false,
      "properties": {
        "id": { "type": "string" },
        "enabled": { "type": "boolean", "default": true },
        "event": {
          "type": "string",
          "enum": [
            "on_note_save","on_note_open","on_note_close","on_note_create",
            "on_session_start","on_session_end","on_tool_complete","on_agent_response"
          ]
        },
        "action": {
          "type": "string",
          "enum": ["run_skill","run_tool","send_to_agent","notify"]
        },
        "targetId": { "type": "string" },
        "condition": { "type": "string" }
      }
    }
  }
}
```

### 4.3 Session Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "osa/session",
  "title": "SessionRecord",
  "type": "object",
  "required": ["id", "projectId", "agentId", "startedAt", "status", "messages"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string" },
    "acpSessionId": { "type": "string" },
    "projectId": { "type": "string" },
    "agentId": { "type": "string" },
    "status": { "type": "string", "enum": ["active","ended","error"] },
    "startedAt": { "type": "string", "format": "date-time" },
    "endedAt": { "type": "string", "format": "date-time" },
    "noteContext": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "path": { "type": "string" },
        "content": { "type": "string" }
      }
    },
    "ragContext": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "excerpt": { "type": "string" },
          "score": { "type": "number" }
        }
      }
    },
    "messages": {
      "type": "array",
      "items": { "$ref": "#/definitions/ChatMessage" }
    },
    "toolsUsed": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "toolId": { "type": "string" },
          "calledAt": { "type": "string", "format": "date-time" },
          "result": { "type": "string" }
        }
      }
    }
  },
  "definitions": {
    "ChatMessage": {
      "type": "object",
      "required": ["id", "role", "content", "timestamp", "agentId"],
      "properties": {
        "id": { "type": "string" },
        "role": { "type": "string", "enum": ["user","assistant","system"] },
        "content": { "type": "string" },
        "timestamp": { "type": "string", "format": "date-time" },
        "agentId": { "type": "string" },
        "streaming": { "type": "boolean" }
      }
    }
  }
}
```

### 4.4 Tool Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "osa/tool",
  "title": "Tool",
  "type": "object",
  "required": ["id", "name", "actionType", "scope", "parameters"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "description": { "type": "string" },
    "version": { "type": "string", "default": "1.0.0" },
    "scope": { "type": "string", "enum": ["global","project"] },
    "actionType": {
      "type": "string",
      "enum": ["acp_slash","notion","airtable","clickup","javascript"]
    },
    "parameters": {
      "type": "array",
      "items": { "$ref": "#/definitions/ToolParameter" }
    },
    "acpConfig": { "$ref": "#/definitions/ACPToolConfig" },
    "javascriptCode": { "type": "string" }
  },
  "if": { "properties": { "actionType": { "const": "acp_slash" } } },
  "then": { "required": ["acpConfig"] },
  "definitions": {
    "ToolParameter": {
      "type": "object",
      "required": ["name", "type"],
      "properties": {
        "name": { "type": "string" },
        "type": { "type": "string", "enum": ["string","number","boolean","dropdown"] },
        "required": { "type": "boolean" },
        "description": { "type": "string" },
        "default": {},
        "options": { "type": "array", "items": { "type": "string" } }
      }
    },
    "ACPToolConfig": {
      "type": "object",
      "required": ["agentId", "slashCommand"],
      "properties": {
        "agentId": { "type": "string" },
        "slashCommand": { "type": "string" },
        "passActiveNote": { "type": "boolean", "default": true },
        "passRagContext": { "type": "boolean", "default": false }
      }
    }
  }
}
```

### 4.5 Skill Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "osa/skill",
  "title": "Skill",
  "type": "object",
  "required": ["id", "name", "scope", "prompt"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "description": { "type": "string" },
    "version": { "type": "string", "default": "1.0.0" },
    "scope": { "type": "string", "enum": ["global","project"] },
    "prompt": { "type": "string" },
    "variables": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "source"],
        "properties": {
          "name": { "type": "string" },
          "source": {
            "type": "string",
            "enum": ["user_input","active_note","rag_result","static"]
          },
          "default": { "type": "string" }
        }
      }
    },
    "targetAgentType": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["claude-code","codex","gemini","goose","openhands","custom"]
      }
    },
    "slashCommand": { "type": "string" }
  }
}
```

### 4.6 MCPServer Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "osa/mcp-server",
  "title": "MCPServer",
  "type": "object",
  "required": ["id", "name", "transport", "scope"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "description": { "type": "string" },
    "enabled": { "type": "boolean", "default": true },
    "scope": { "type": "string", "enum": ["global","project"] },
    "transport": { "type": "string", "enum": ["stdio","sse","http"] },
    "stdio": {
      "type": "object",
      "required": ["command"],
      "properties": {
        "command": { "type": "string" },
        "args": { "type": "array", "items": { "type": "string" } },
        "env": { "type": "object", "additionalProperties": { "type": "string" } }
      }
    },
    "http": {
      "type": "object",
      "required": ["endpoint"],
      "properties": {
        "endpoint": { "type": "string", "format": "uri" },
        "apiKey": { "type": "string" }
      }
    },
    "capabilities": { "type": "array", "items": { "type": "string" } }
  },
  "if": { "properties": { "transport": { "const": "stdio" } } },
  "then": { "required": ["stdio"] },
  "else": { "required": ["http"] }
}
```

---

## 5. TypeScript Types

### src/types/acp.types.ts

```typescript
import type {
  ClientSideConnection,
  NewSessionRequest,
  NewSessionResponse,
  LoadSessionRequest,
  PromptRequest,
  PromptResponse,
  InitializeRequest,
  InitializeResponse,
  SetSessionModeRequest,
} from "@agentclientprotocol/sdk";

export type {
  ClientSideConnection,
  NewSessionRequest,
  NewSessionResponse,
  LoadSessionRequest,
  PromptRequest,
  PromptResponse,
  InitializeRequest,
  InitializeResponse,
  SetSessionModeRequest,
};

export type ACPAgentType =
  | "claude-code" | "codex" | "gemini" | "goose"
  | "cline" | "openhands" | "fast-agent" | "custom";

export interface ACPAgentConfig {
  id: string;
  name: string;
  type: ACPAgentType;
  executablePath: string;
  apiKey?: string;
  enabled: boolean;
  capabilities: Array<"coding" | "terminal" | "file_edit" | "chat">;
}

export type ContextMode = "active_note" | "rag_enriched" | "manual";

export interface ACPSettings {
  nodePath: string;
  defaultAgentId: string;
  agents: ACPAgentConfig[];
  contextMode: ContextMode;
}

export interface RAGSettings {
  enabled: boolean;
  provider: "anythingllm";
  endpoint: string;
  apiKey?: string;
  defaultWorkspace?: string;
  topK: number;
  injectMode: "prepend" | "append" | "system_prompt";
}

export interface IntegrationCredential {
  apiKey: string;
  enabled: boolean;
}

export interface IntegrationsSettings {
  notion?: IntegrationCredential;
  airtable?: IntegrationCredential;
  clickup?: IntegrationCredential;
}

export interface PluginSettings {
  version: string;
  acp: ACPSettings;
  rag: RAGSettings;
  integrations: IntegrationsSettings;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  version: "1.0.0",
  acp: {
    nodePath: "",
    defaultAgentId: "",
    agents: [],
    contextMode: "rag_enriched",
  },
  rag: {
    enabled: false,
    provider: "anythingllm",
    endpoint: "http://localhost:3001/api/v1",
    topK: 5,
    injectMode: "prepend",
  },
  integrations: {},
};
```

### src/types/project.types.ts

```typescript
export type HookEvent =
  | "on_note_save" | "on_note_open" | "on_note_close" | "on_note_create"
  | "on_session_start" | "on_session_end" | "on_tool_complete" | "on_agent_response";

export type HookAction = "run_skill" | "run_tool" | "send_to_agent" | "notify";

export interface Hook {
  id: string;
  enabled: boolean;
  event: HookEvent;
  action: HookAction;
  targetId: string;
  condition?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  vaultPath?: string;
  activeAgentId?: string;
  ragWorkspace?: string;
  toolIds: string[];
  mcpIds: string[];
  skillIds: string[];
  hooks: Hook[];
  metadata?: Record<string, string>;
}
```

### src/types/session.types.ts

```typescript
export interface NoteContext {
  title: string;
  path: string;
  content?: string;
}

export interface RAGSource {
  title: string;
  excerpt: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  agentId: string;
  streaming?: boolean;
  noteContext?: NoteContext;
  ragSources?: RAGSource[];
}

export type SessionStatus = "active" | "ended" | "error";

export interface SessionRecord {
  id: string;
  acpSessionId?: string;
  projectId: string;
  agentId: string;
  status: SessionStatus;
  startedAt: string;
  endedAt?: string;
  noteContext?: NoteContext;
  ragContext?: RAGSource[];
  messages: ChatMessage[];
  toolsUsed: Array<{
    toolId: string;
    calledAt: string;
    result?: string;
  }>;
}
```

### src/types/tool.types.ts

```typescript
export type ToolActionType = "acp_slash" | "notion" | "airtable" | "clickup" | "javascript";
export type ToolScope = "global" | "project";

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "dropdown";
  required?: boolean;
  description?: string;
  default?: unknown;
  options?: string[];
}

export interface ACPToolConfig {
  agentId: string;
  slashCommand: string;
  passActiveNote: boolean;
  passRagContext: boolean;
}

export interface Tool {
  id: string;
  name: string;
  description?: string;
  version: string;
  scope: ToolScope;
  actionType: ToolActionType;
  parameters: ToolParameter[];
  acpConfig?: ACPToolConfig;
  javascriptCode?: string;
}
```

### src/types/skill.types.ts

```typescript
import type { ACPAgentType } from "./acp.types";

export type SkillScope = "global" | "project";
export type SkillVariableSource = "user_input" | "active_note" | "rag_result" | "static";

export interface SkillVariable {
  name: string;
  source: SkillVariableSource;
  default?: string;
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
  version: string;
  scope: SkillScope;
  prompt: string;
  variables: SkillVariable[];
  targetAgentType?: ACPAgentType[];
  slashCommand?: string;
}
```

### src/types/mcp.types.ts

```typescript
export type MCPTransport = "stdio" | "sse" | "http";
export type MCPScope = "global" | "project";

export interface MCPStdioConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface MCPHttpConfig {
  endpoint: string;
  apiKey?: string;
}

export interface MCPServer {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  scope: MCPScope;
  transport: MCPTransport;
  stdio?: MCPStdioConfig;
  http?: MCPHttpConfig;
  capabilities?: string[];
}
```

### src/types/store.types.ts

```typescript
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
```

### src/types/index.ts

```typescript
export * from "./acp.types";
export * from "./project.types";
export * from "./session.types";
export * from "./tool.types";
export * from "./skill.types";
export * from "./mcp.types";
export * from "./store.types";
```

---

## 6. กฎสำคัญที่ห้ามลืม

1. **`defaultAgentId`** — ไม่ใช่ `activeAgentId` (rename จาก SDK v0.6.2+)
2. **`acpSessionId`** แยกจาก plugin `session.id` — SDK จัดการ lifecycle ของ ACP session เอง
3. **MCP servers** ส่งเข้าได้ตอน `newSession` ผ่าน `NewSessionRequest` ของ SDK โดยตรง
4. **API Key** เก็บใน `settings` ของ plugin ปกติ (`plugin.saveData()`) — ไม่ต้องมี CredentialManager แยก
5. **OAuth** agent จัดการเองผ่าน browser — plugin ไม่ต้องแตะ
6. **AnythingLLM** เป็น RAG เท่านั้น — ACP จัดการ AI ทั้งหมด
7. **Hook และ Session** ผูกกับ project เสมอ — ไม่มี global

---

*Blueprint version: 1.0.0 — อัปเดตทุกครั้งที่ตัดสินใจเปลี่ยน design*
