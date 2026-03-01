# Obsidian Smart Assistant — Project Blueprint

> ไฟล์นี้คือ source of truth ของโปรเจ็กต์  
> ก่อนเขียนโค้ดใดๆ ให้อ่านไฟล์นี้ก่อนเสมอ

---

## 0. Development Phase

### Phase 1 — Personal Prototype (ปัจจุบัน)
**เป้าหมาย:** ทดสอบว่าแนวคิดทำงานได้จริงหรือไม่ ก่อนเปิดให้ใครใช้

ตัวชี้วัดที่ต้องพิสูจน์:
- Cloudflare sandbox รันโค้ดได้จริงหรือแค่ marketing
- tool token cost จริง — 1,000 token/request คุ้มหรือเปลือง
- ความปลอดภัยของ sandbox — escape ได้มั้ย, ข้อมูลรั่วมั้ย
- Vercel sandbox (preview) ใช้ได้จริงแค่ไหนในช่วง free

**ข้อจำกัดของ Phase นี้:**
- ผู้ใช้คนเดียว (owner เท่านั้น)
- ไม่มี multi-user, ไม่มี auth ซับซ้อน
- OAuth ทำครั้งเดียวผ่าน browser แล้วเก็บ token ไว้
- ยังไม่ต้อง deploy จริง — รันบน localhost ได้

### Phase 2 — Production (หลังพิสูจน์แนวคิดแล้ว)
เปิดให้ผู้ใช้อื่นใช้ได้ — ออกแบบ multi-user, billing, rate limiting

---

## 1. Full Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Obsidian Plugin                             │
│                                                                 │
│  ChatView │ KnowledgeView │ ToolView │ SettingsTab             │
│                        │                                        │
│              ACPManager (ACP subprocess)                        │
│              ContextEnricher (note + RAG)                       │
│              IntegrationManager (เรียก Gateway ผ่าน MCP)       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP / SSE
                           │ (MCP over HTTP transport)
┌──────────────────────────▼──────────────────────────────────────┐
│              Cloudflare Workers — MCP Gateway                   │
│                                                                 │
│  MCPGateway (entry point)                                       │
│  OAuth handler (Cloudflare Access / Workers OAuth Provider)     │
│  clients/: NotionClient, AirtableClient, ClickUpClient, ...    │
│  sandbox/: DynamicWorkerLoader (V8 isolate)                     │
│  unified-spec.json (merged OpenAPI tool specs)                  │
│                                                                 │
│  ⚠️ Phase 1: วัด token cost จริง — ตัวชี้วัดหลัก              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│              Vercel — Dashboard + Sandbox UI                    │
│                                                                 │
│  Next.js 14                                                     │
│  /api/mcp/auth/* (connect / callback / finish / disconnect)     │
│  /api/mcp/tool/* (list / call)                                  │
│  sandbox preview UI (Vercel free tier ช่วง preview)            │
└─────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│              AnythingLLM — RAG only                             │
│              localhost:3001 (local, ไม่ผ่าน Gateway)           │
└─────────────────────────────────────────────────────────────────┘
```

### บทบาทแต่ละ Platform

| Platform | บทบาท | หมายเหตุ Phase 1 |
|---|---|---|
| **Obsidian Plugin** | AI agent host, context, RAG | ACP subprocess + AnythingLLM |
| **Cloudflare Workers** | MCP Gateway, OAuth, V8 sandbox | tool execution จริง |
| **Vercel** | Dashboard UI, OAuth client | Next.js, free tier ช่วง preview |
| **AnythingLLM** | RAG / Knowledge Base เท่านั้น | HTTP REST, local เท่านั้น |

### Sandbox — สิ่งที่มีและไม่มีใน Cloudflare V8 isolate

| Feature | มี | หมายเหตุ |
|---|---|---|
| `fetch` | ✅ จำกัด domain | ผ่าน allowlist เท่านั้น |
| `console` | ✅ | debug log |
| `setTimeout/clearTimeout` | ✅ | |
| `crypto` | ✅ | `crypto.randomUUID()`, `crypto.subtle` |
| `TextEncoder/TextDecoder` | ✅ | แทน Buffer |
| `atob/btoa` | ✅ | |
| `Buffer` | ❌ | ใช้ TextEncoder แทน |
| `require` | ❌ | ไม่มี Node.js module system |
| `fs` | ❌ | ไม่มี filesystem |
| `process/env` | ❌ | tokens inject ผ่าน client objects |
| network unrestricted | ❌ | จำกัด domain ใน allowlist |

---

## 2. Tech Stack

| Layer | Package | ใช้ที่ไหน |
|---|---|---|
| Plugin runtime | Obsidian Plugin API | Obsidian |
| ACP client | `@agentclientprotocol/sdk` | Obsidian |
| MCP client | `@modelcontextprotocol/sdk` | Obsidian → Gateway |
| Cloudflare Gateway | `@cloudflare/agents-sdk` | Cloudflare Workers |
| Sandbox | `DynamicWorkerLoader` (V8 isolate) | Cloudflare Workers |
| Dashboard | Next.js 14 + Tailwind | Vercel |
| RAG | AnythingLLM REST API | Local |
| Language | TypeScript | ทุก layer |
| Build (plugin) | esbuild | Obsidian |
| Build (gateway) | wrangler | Cloudflare |

---

## 3. โครงสร้างไฟล์ทั้งระบบ

> มี 3 repo แยกกัน วางไว้ใน monorepo หรือแยก repo ก็ได้

### 3.1 obsidian-plugin/ (Obsidian Plugin)

```
obsidian-plugin/
├── src/
│   ├── main.ts                        # Plugin entry point
│   ├── settings.ts                    # DEFAULT_SETTINGS + loadSettings/saveSettings
│   │
│   ├── types/
│   │   ├── acp.types.ts               # ACPAgentConfig, PluginSettings, DEFAULT_SETTINGS
│   │   ├── project.types.ts           # Project, Hook
│   │   ├── session.types.ts           # SessionRecord, ChatMessage
│   │   ├── tool.types.ts              # Tool, ToolParameter
│   │   ├── skill.types.ts             # Skill, SkillVariable
│   │   ├── mcp.types.ts               # MCPServer
│   │   ├── store.types.ts             # PluginStore (root of data.json) + resolvers
│   │   └── index.ts                   # re-export ทั้งหมด
│   │
│   ├── core/
│   │   ├── ACPManager.ts              # spawn/kill ACP subprocess
│   │   ├── ContextEnricher.ts         # รวม active note + RAG ก่อนส่ง ACP
│   │   ├── ToolManager.ts             # validate + รัน tool
│   │   ├── ProjectManager.ts          # CRUD project, resolve scope
│   │   └── KnowledgeManager.ts        # คุย AnythingLLM REST API
│   │
│   ├── services/
│   │   ├── EventBus.ts
│   │   └── Logger.ts                  # เก็บ log ใน data.json
│   │
│   ├── integrations/
│   │   └── GatewayClient.ts           # MCPClient → Cloudflare Gateway (HTTP/SSE)
│   │
│   └── ui/
│       ├── SettingsTab.ts
│       └── views/
│           ├── ChatView.ts
│           ├── KnowledgeView.ts
│           └── ToolTemplateView.ts
├── manifest.json
├── package.json
├── tsconfig.json
└── esbuild.config.mjs
```

### 3.2 cf-gateway/ (Cloudflare Workers — MCP Gateway)

```
cf-gateway/
├── src/
│   ├── index.ts                   # MCPGateway entry, OAuth setup
│   ├── clients/
│   │   ├── index.ts               # createServiceClients(tokens)
│   │   ├── notion.ts              # NotionClient
│   │   ├── airtable.ts            # AirtableClient
│   │   ├── clickup.ts             # ClickUpClient
│   │   └── ...                    # เพิ่มได้ตามต้องการ
│   ├── sandbox/
│   │   └── loader.ts              # DynamicWorkerLoader setup + allowlist
│   └── unified-spec.json          # merged OpenAPI specs ของทุก service
├── wrangler.toml
├── package.json
├── tsconfig.json
└── .env.example
```

### 3.3 vercel-dashboard/ (Vercel — Dashboard + OAuth Client)

```
vercel-dashboard/
├── src/
│   └── app/
│       ├── api/
│       │   └── mcp/
│       │       ├── auth/
│       │       │   ├── connect/route.ts
│       │       │   ├── callback/route.ts
│       │       │   ├── finish/route.ts
│       │       │   └── disconnect/route.ts
│       │       └── tool/
│       │           ├── list/route.ts
│       │           └── call/route.ts
│       └── page.tsx               # Dashboard UI
├── src/lib/
│   ├── oauth-client.ts            # MCPOAuthClient
│   └── session-store.ts           # เก็บ token ชั่วคราว
├── next.config.js
├── package.json
└── .env.local.example
```

---

## 4. data.json Structure (PluginStore — obsidian-plugin เท่านั้น)

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

## 5. JSON Schema Draft-07

### 5.1 Settings Schema

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

### 5.2 Project Schema

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

### 5.3 Session Schema

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

### 5.4 Tool Schema

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

### 5.5 Skill Schema

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

### 5.6 MCPServer Schema

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

## 6. TypeScript Types (obsidian-plugin)

> Types ด้านล่างนี้ใช้ใน obsidian-plugin เท่านั้น  
> cf-gateway ใช้ types จาก `@cloudflare/agents-sdk` โดยตรง  
> vercel-dashboard ใช้ types จาก `@modelcontextprotocol/sdk` โดยตรง

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

## 7. กฎสำคัญที่ห้ามลืม

### Plugin (Obsidian)
1. **`defaultAgentId`** — ไม่ใช่ `activeAgentId` (rename จาก SDK v0.6.2+)
2. **`acpSessionId`** แยกจาก plugin `session.id` — SDK จัดการ lifecycle ของ ACP session เอง
3. **MCP servers** ส่งเข้าได้ตอน `newSession` ผ่าน `NewSessionRequest` ของ SDK โดยตรง
4. **API Key** เก็บใน `settings` ของ plugin (`plugin.saveData()`) — ไม่ต้องมี CredentialManager แยก
5. **OAuth** agent จัดการเองผ่าน browser — plugin ไม่ต้องแตะ
6. **AnythingLLM** เป็น RAG เท่านั้น — ACP จัดการ AI ทั้งหมด
7. **Hook และ Session** ผูกกับ project เสมอ — ไม่มี global
8. **GatewayClient** ใช้ MCP over HTTP transport เชื่อม Cloudflare Gateway

### Cloudflare Gateway
9. **Sandbox allowlist** — ต้องระบุ domain ทุกตัวที่ client จะ fetch ไป ไม่งั้น throw error
10. **ไม่มี Buffer** ใน V8 isolate — ใช้ `TextEncoder/TextDecoder` แทนเสมอ
11. **token cost** — วัดทุก request ใน Phase 1, log ไว้ทุกครั้ง
12. **secrets** — ใช้ `wrangler secret put` ห้าม hardcode ใน wrangler.toml

### Vercel Dashboard
13. **Gateway URL** ตั้งค่าผ่าน `NEXT_PUBLIC_GATEWAY_URL` env var เท่านั้น
14. **OAuth callback** redirect URI ต้องตรงกับที่ลงทะเบียนใน service (Notion, Vercel, etc.)
15. **session-store** เก็บ token ชั่วคราว — Phase 1 ใช้ memory store ได้ ไม่ต้องใช้ DB

---

*Blueprint version: 1.1.0 — เพิ่ม Cloudflare Gateway + Vercel layer + Phase structure*
