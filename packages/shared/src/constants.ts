/**
 * Shared Constants for bl1nk-workspace
 */

// ─── API & Protocol ───────────────────────────────────
export const ACP_VERSION = "2.0"
export const JSONRPC_VERSION = "2.0"

export const ACP_METHODS = {
  AGENT_EXECUTE: "agent.execute",
  AGENT_STATUS: "agent.status",
  AGENT_CANCEL: "agent.cancel",
  TASK_SUBMIT: "task.submit",
  TASK_STATUS: "task.status",
  TOOL_CALL: "tool.call",
  SKILL_LOAD: "skill.load",
  MEMORY_EXTRACT: "memory.extract",
  MEMORY_CONFIRM: "memory.confirm",
} as const

export const ACP_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  SERVER_ERROR_START: -32099,
  SERVER_ERROR_END: -32000,
  AGENT_NOT_FOUND: -32001,
  TASK_NOT_FOUND: -32002,
  UNAUTHORIZED: -32003,
  RESOURCE_EXHAUSTED: -32004,
} as const

// ─── Agent Status ─────────────────────────────────────
export const AGENT_STATUSES = {
  IDLE: "idle",
  THINKING: "thinking",
  EXECUTING: "executing",
  ERROR: "error",
  PAUSED: "paused",
} as const

// ─── Task Status ──────────────────────────────────────
export const TASK_STATUSES = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const

// ─── Memory Status ────────────────────────────────────
export const MEMORY_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
  ARCHIVED: "archived",
} as const

// ─── AI Models ────────────────────────────────────────
export const AI_MODELS = {
  CLAUDE: "claude-3-5-sonnet",
  GEMINI: "gemini-2-0-flash",
  OPENAI: "gpt-4o",
} as const

export const AI_MODEL_DEFAULTS = {
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7,
  TIMEOUT: 60000, // 60 seconds
} as const

// ─── WebSocket Events ─────────────────────────────────
export const WEBSOCKET_EVENTS = {
  COMMAND_EXECUTE: "command:execute",
  FILE_READ: "file:read",
  FILE_WRITE: "file:write",
  TERMINAL_RUN: "terminal:run",
  BROWSER_NAVIGATE: "browser:navigate",
  AGENT_THINKING: "agent:thinking",
  AGENT_OUTPUT: "agent:output",
  AGENT_ERROR: "agent:error",
  FILE_CHANGED: "file:changed",
  TERMINAL_OUTPUT: "terminal:output",
} as const

// ─── Built-in Tools ───────────────────────────────────
export const BUILTIN_TOOLS = {
  ASK_USER: "ask-user",
  EXECUTE_CODE: "execute-code",
  READ_FILE: "read-file",
  WRITE_FILE: "write-file",
  SEARCH_FILES: "search-files",
  BROWSER_ACTION: "browser-action",
  GITHUB_ACTION: "github-action",
  SKILL_CREATE: "skill-create",
  SKILL_UPDATE: "skill-update",
} as const

// ─── Timeouts & Limits ────────────────────────────────
export const LIMITS = {
  MAX_MESSAGE_SIZE: 1024 * 1024, // 1MB
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_MEMORY_ITEMS: 1000,
  MAX_SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  MAX_TASK_RETRIES: 3,
  TASK_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  AGENT_IDLE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
} as const

// ─── File Types ───────────────────────────────────────
export const FILE_TYPES = {
  CODE: ["js", "ts", "tsx", "jsx", "py", "java", "cpp", "go", "rs"],
  DOCUMENT: ["md", "txt", "pdf", "docx"],
  CONFIG: ["json", "yaml", "toml", "env"],
  IMAGE: ["png", "jpg", "jpeg", "gif", "svg"],
  DATA: ["csv", "xlsx", "xml"],
} as const

// ─── Artifact Types ───────────────────────────────────
export const ARTIFACT_TYPES = {
  CODE: "code",
  FILE: "file",
  IMAGE: "image",
  DOCUMENT: "document",
  DATA: "data",
  LOG: "log",
} as const

// ─── Message Roles ────────────────────────────────────
export const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
  TOOL: "tool",
} as const

// ─── Browser Commands ─────────────────────────────────
export const BROWSER_COMMANDS = {
  NAVIGATE: "navigate",
  CLICK: "click",
  TYPE: "type",
  SCREENSHOT: "screenshot",
  EXTRACT: "extract",
  FILL_FORM: "fill_form",
  WAIT: "wait",
} as const

// ─── GitHub Integration ───────────────────────────────
export const GITHUB_EVENTS = {
  PULL_REQUEST: "pull_request",
  PUSH: "push",
  ISSUES: "issues",
  ISSUE_COMMENT: "issue_comment",
} as const

// ─── Storage & CDN ────────────────────────────────────
export const STORAGE_CONFIG = {
  R2_BUCKET: process.env.R2_BUCKET || "bl1nk-artifacts",
  R2_REGION: process.env.R2_REGION || "auto",
  CDN_PREFIX: process.env.CDN_PREFIX || "https://cdn.bl1nk.dev",
  ARTIFACT_RETENTION_DAYS: 30,
} as const

// ─── Skill System ─────────────────────────────────────
export const SKILL_CONFIG = {
  SKILL_DIR: process.env.SKILL_DIR || "./src/skills",
  BUILTIN_SKILL_DIR: "./src/skills/core",
  SKILL_FILE_EXTENSIONS: [".md", ".json"],
  MAX_SKILL_SIZE: 1024 * 1024, // 1MB
} as const

// ─── Database ─────────────────────────────────────────
export const DB_CONFIG = {
  CONNECTION_TIMEOUT: 10000,
  QUERY_TIMEOUT: 30000,
  MAX_CONNECTIONS: 10,
} as const

// ─── Logging ──────────────────────────────────────────
export const LOG_LEVELS = {
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
} as const

// ─── Pagination ───────────────────────────────────────
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// ─── Cache ────────────────────────────────────────────
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const

// ─── Regex Patterns ───────────────────────────────────
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  FILE_PATH: /^[a-zA-Z0-9._/-]+$/,
  SKILL_NAME: /^[a-z0-9-]+$/,
} as const

// ─── HTTP Status Codes ────────────────────────────────
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const
