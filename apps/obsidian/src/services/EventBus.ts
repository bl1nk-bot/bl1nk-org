import { EventEmitter } from "eventemitter3";
import { ChatMessage } from "../types/session.types";

export type ACPAgentMessageChunk = {
  sessionId: string;
  type: "text" | "image" | "audio";
  text?: string;
  data?: string;
  mimeType?: string;
};

export type ACPToolCall = {
  sessionId: string;
  toolCallId: string;
  title: string;
  status: "pending" | "running" | "completed" | "error";
  output?: unknown;
};

export type ACPPermissionRequest = {
  sessionId: string;
  toolCallId: string;
  title: string;
  options: Array<{ optionId: string; name: string; kind: string }>;
};

export type EventPayload = {
  "chat:message": { projectId: string; content: string; sessionId?: string };
  "chat:response": { sessionId: string; message: ChatMessage };
  "note:saved": { path: string; content: string };
  "note:opened": { path: string };
  "tool:executed": { toolId: string; result: string; sessionId: string };
  "session:started": { projectId: string; sessionId: string };
  "session:ended": { sessionId: string };
  "hook:triggered": { hookId: string; projectId: string };
  "acp:message_chunk": ACPAgentMessageChunk;
  "acp:tool_call": ACPToolCall;
  "acp:permission_request": ACPPermissionRequest;
  "acp:connected": { agentName: string; agentVersion: string };
  "acp:disconnected": { reason?: string };
  "acp:error": { sessionId?: string; error: string };
};

export class EventBus {
  private emitter = new EventEmitter();

  on<K extends keyof EventPayload>(
    event: K,
    listener: (payload: EventPayload[K]) => void,
  ): void {
    this.emitter.on(event, listener);
  }

  off<K extends keyof EventPayload>(
    event: K,
    listener: (payload: EventPayload[K]) => void,
  ): void {
    this.emitter.off(event, listener);
  }

  emit<K extends keyof EventPayload>(event: K, payload: EventPayload[K]): void {
    this.emitter.emit(event, payload);
  }
}

export const eventBus = new EventBus();
