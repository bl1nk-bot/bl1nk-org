/**
 * Shared Type Definitions for bl1nk-workspace
 * Used across all packages and applications
 */

import { z } from "zod";

// ─── AI Models ────────────────────────────────────────
export type AIModel = "claude-3-5-sonnet" | "gemini-2-0-flash" | "gpt-4o";

export interface AIModelConfig {
  id: string;
  model: AIModel;
  apiKey: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

// ─── Agent Protocol (ACP) ────────────────────────────
export interface ACPRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface ACPResponse<T = unknown> {
  jsonrpc: "2.0";
  id: string | number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface ACPError {
  code: number;
  message: string;
  data?: unknown;
}

// ─── Agent & Session ──────────────────────────────────
export type AgentStatus = "idle" | "thinking" | "executing" | "error" | "paused";

export interface Agent {
  id: string;
  name: string;
  description?: string;
  model: AIModel;
  systemPrompt?: string;
  tools: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentSession {
  id: string;
  agentId: string;
  userId: string;
  status: AgentStatus;
  context: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}

// ─── Tasks & Execution ────────────────────────────────
export type TaskStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface Task {
  id: string;
  sessionId: string;
  agentId: string;
  command: string;
  status: TaskStatus;
  input?: Record<string, unknown>;
  output?: unknown;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// ─── Messages & Chat ──────────────────────────────────
export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  toolCalls?: ToolCall[];
  artifacts?: Artifact[];
  createdAt: Date;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

// ─── Artifacts ────────────────────────────────────────
export type ArtifactType =
  | "code"
  | "file"
  | "image"
  | "document"
  | "data"
  | "log";

export interface Artifact {
  id: string;
  taskId?: string;
  type: ArtifactType;
  name: string;
  content?: string;
  url?: string;
  mimeType?: string;
  size?: number;
  createdAt: Date;
}

// ─── Skills ───────────────────────────────────────────
export interface SkillMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  tags?: string[];
  tools: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill extends SkillMetadata {
  content: string; // SKILL.md or JSON content
  filePath: string;
}

// ─── Memory & Context ─────────────────────────────────
export type MemoryStatus = "pending" | "confirmed" | "rejected" | "archived";

export interface PendingContext {
  id: string;
  sessionId: string;
  content: string;
  extractedAt: Date;
  status: MemoryStatus;
  confirmedAt?: Date;
}

export interface Memory {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  importance: "low" | "medium" | "high";
  createdAt: Date;
  accessedAt: Date;
}

// ─── File Operations ──────────────────────────────────
export interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  language?: string;
  size?: number;
}

export interface FileContent {
  path: string;
  content: string;
  language?: string;
  encoding?: string;
}

// ─── GitHub Integration ───────────────────────────────
export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body?: string;
  url: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeReviewComment {
  id: string;
  prId: number;
  file: string;
  line: number;
  content: string;
  author: string;
  createdAt: Date;
}

// ─── Browser Automation ───────────────────────────────
export type BrowserCommand =
  | "navigate"
  | "click"
  | "type"
  | "screenshot"
  | "extract"
  | "fill_form"
  | "wait";

export interface BrowserAction {
  id: string;
  command: BrowserCommand;
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
  result?: unknown;
}

// ─── WebSocket Events ─────────────────────────────────
export type WebSocketEventType =
  | "command:execute"
  | "file:read"
  | "file:write"
  | "terminal:run"
  | "browser:navigate"
  | "agent:thinking"
  | "agent:output"
  | "agent:error"
  | "file:changed"
  | "terminal:output";

export interface WebSocketEvent {
  type: WebSocketEventType;
  sessionId: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

// ─── API Response Wrapper ─────────────────────────────
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: Date;
}

// ─── Pagination ───────────────────────────────────────
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─── User & Auth ──────────────────────────────────────
export interface User {
  id: string;
  openId: string;
  email?: string;
  name?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

// ─── Zod Schemas for Validation ───────────────────────
export const AIModelSchema = z.enum([
  "claude-3-5-sonnet",
  "gemini-2-0-flash",
  "gpt-4o",
]);

export const TaskStatusSchema = z.enum([
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled",
]);

export const MessageRoleSchema = z.enum(["user", "assistant", "system", "tool"]);

export const ACPRequestSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string(), z.number()]),
  method: z.string(),
  params: z.record(z.unknown()).optional(),
});

export const ACPResponseSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string(), z.number()]),
  result: z.unknown().optional(),
  error: z
    .object({
      code: z.number(),
      message: z.string(),
      data: z.unknown().optional(),
    })
    .optional(),
});