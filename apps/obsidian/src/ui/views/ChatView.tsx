import { ItemView, WorkspaceLeaf, TFile } from "obsidian";
import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { createRoot, Root } from "react-dom/client";
import {
  Send,
  User,
  Bot,
  AlertCircle,
  Loader2,
  Wrench,
  AtSign,
  Slash,
} from "lucide-react";

import type SmartAssistantPlugin from "../../main";
import type { ChatMessage } from "../../types/session.types";
import type { ACPToolCall } from "../../services/EventBus";

export const VIEW_TYPE_ENHANCED_CHAT = "enhanced-chat";

interface ToolCallInfo {
  toolCallId: string;
  title: string;
  status: string;
}

interface FileMention {
  path: string;
  name: string;
}

interface CommandSuggestion {
  name: string;
  description: string;
  icon: string;
}

const EnhancedChatComponent: React.FC<{ plugin: SmartAssistantPlugin }> = ({
  plugin,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [agentInfo, setAgentInfo] = useState<{
    name: string;
    version: string;
  } | null>(null);
  const [toolCalls, setToolCalls] = useState<ToolCallInfo[]>([]);

  // File mention state
  const [showFileSuggestions, setShowFileSuggestions] = useState(false);
  const [fileSuggestions, setFileSuggestions] = useState<FileMention[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  // Command state
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const [commandSuggestions, setCommandSuggestions] = useState<CommandSuggestion[]>([]);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingRef = useRef<string>("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Load available files from vault
  const loadVaultFiles = useCallback((): FileMention[] => {
    const files: FileMention[] = [];
    const vault = plugin.app.vault;

    const traverse = (folder: any) => {
      if (!folder) return;

      if (folder.children) {
        folder.children.forEach((item: any) => {
          if (item instanceof TFile) {
            files.push({
              path: item.path,
              name: item.basename,
            });
          } else if (item.children) {
            traverse(item);
          }
        });
      }
    };

    traverse(vault.getRoot());
    return files;
  }, [plugin.app.vault]);

  // Handle @ mention detection
  const handleAtMention = useCallback(
    (text: string, cursorPos: number) => {
      const beforeCursor = text.substring(0, cursorPos);
      const lastAtIndex = beforeCursor.lastIndexOf("@");

      if (lastAtIndex === -1) {
        setShowFileSuggestions(false);
        return;
      }

      const query = beforeCursor.substring(lastAtIndex + 1).toLowerCase();
      const allFiles = loadVaultFiles();

      const filtered = allFiles.filter((file) =>
        file.name.toLowerCase().includes(query)
      );

      setFileSuggestions(filtered.slice(0, 5));
      setShowFileSuggestions(filtered.length > 0);
      setSelectedFileIndex(0);
    },
    [loadVaultFiles]
  );

  // Handle / command detection
  const handleSlashCommand = useCallback((text: string, cursorPos: number) => {
    const beforeCursor = text.substring(0, cursorPos);

    // Only show commands if / is at the start of a line
    if (!beforeCursor.match(/^\/|[\n]\//)) {
      setShowCommandSuggestions(false);
      return;
    }

    const lastSlashIndex = beforeCursor.lastIndexOf("/");
    const query = beforeCursor.substring(lastSlashIndex + 1).toLowerCase();

    const availableCommands: CommandSuggestion[] = [
      {
        name: "docs-writer",
        description: "Generate and refine documentation",
        icon: "📝",
      },
      {
        name: "code-review",
        description: "Review code for quality issues",
        icon: "🔍",
      },
      {
        name: "summarize",
        description: "Summarize content",
        icon: "📋",
      },
      {
        name: "translate",
        description: "Translate text to different languages",
        icon: "🌐",
      },
      {
        name: "explain",
        description: "Explain concepts in detail",
        icon: "💡",
      },
    ];

    const filtered = availableCommands.filter((cmd) =>
      cmd.name.toLowerCase().includes(query)
    );

    setCommandSuggestions(filtered);
    setShowCommandSuggestions(filtered.length > 0);
    setSelectedCommandIndex(0);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;

    setInput(text);
    handleAtMention(text, cursorPos);
    handleSlashCommand(text, cursorPos);
  };

  const insertFileMention = (file: FileMention) => {
    const cursorPos = inputRef.current?.selectionStart || input.length;
    const beforeCursor = input.substring(0, cursorPos);
    const lastAtIndex = beforeCursor.lastIndexOf("@");

    if (lastAtIndex === -1) return;

    const newInput =
      input.substring(0, lastAtIndex) +
      `@[${file.name}](${file.path})` +
      input.substring(cursorPos);

    setInput(newInput);
    setShowFileSuggestions(false);

    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const insertCommand = (command: CommandSuggestion) => {
    const cursorPos = inputRef.current?.selectionStart || input.length;
    const beforeCursor = input.substring(0, cursorPos);
    const lastSlashIndex = beforeCursor.lastIndexOf("/");

    if (lastSlashIndex === -1) return;

    const newInput =
      input.substring(0, lastSlashIndex) +
      `/${command.name} ` +
      input.substring(cursorPos);

    setInput(newInput);
    setShowCommandSuggestions(false);

    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  useEffect(() => {
    const eventBus = plugin.acpManager.getEventBus();

    const handleConnected = (data: {
      agentName: string;
      agentVersion: string;
    }) => {
      setAgentInfo({ name: data.agentName, version: data.agentVersion });
      setError(null);
    };

    const handleDisconnected = () => {
      setAgentInfo(null);
    };

    const handleMessageChunk = (data: { text?: string }) => {
      if (data.text) {
        streamingRef.current += data.text;
        setStreamingText(streamingRef.current);
      }
    };

    const handleToolCall = (data: ACPToolCall) => {
      setToolCalls((prev) => {
        const existing = prev.find((t) => t.toolCallId === data.toolCallId);
        if (existing) {
          return prev.map((t) =>
            t.toolCallId === data.toolCallId
              ? { ...t, status: data.status, title: data.title || t.title }
              : t
          );
        }
        return [
          ...prev,
          {
            toolCallId: data.toolCallId,
            title: data.title,
            status: data.status,
          },
        ];
      });
    };

    const handleError = (data: { error: string }) => {
      setError(data.error);
      setIsLoading(false);
    };

    eventBus.on("acp:connected", handleConnected);
    eventBus.on("acp:disconnected", handleDisconnected);
    eventBus.on("acp:message_chunk", handleMessageChunk);
    eventBus.on("acp:tool_call", handleToolCall);
    eventBus.on("acp:error", handleError);

    const info = plugin.acpManager.getAgentInfo();
    if (info) {
      setAgentInfo({
        name: info.agentInfo?.name || "unknown",
        version: info.agentInfo?.version || "0.0.0",
      });
    } else {
      setError(
        "ACP Agent ยังไม่ได้เชื่อมต่อ กรุณาไปที่ Settings → เปิดใช้งาน agent ก่อน"
      );
    }

    return () => {
      eventBus.off("acp:connected", handleConnected);
      eventBus.off("acp:disconnected", handleDisconnected);
      eventBus.off("acp:message_chunk", handleMessageChunk);
      eventBus.off("acp:tool_call", handleToolCall);
      eventBus.off("acp:error", handleError);
    };
  }, [plugin.acpManager]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!plugin.acpManager.isActive()) {
      setError("ACP Agent ยังไม่ได้เชื่อมต่อ");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStreamingText("");
    streamingRef.current = "";
    setToolCalls([]);

    try {
      let currentSessionId = sessionId;

      if (!currentSessionId) {
        const cwd = plugin.app.vault.getRoot().path;
        currentSessionId = await plugin.acpManager.createSession(cwd);
        setSessionId(currentSessionId);
      }

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
        timestamp: new Date().toISOString(),
        agentId: "user",
      };

      setMessages((prev) => [...prev, userMessage]);

      const currentInput = input.trim();
      setInput("");

      const result = await plugin.acpManager.prompt(currentSessionId, [
        { type: "text", text: currentInput },
      ]);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: streamingRef.current || "[No response]",
        timestamp: new Date().toISOString(),
        agentId: agentInfo?.name || "assistant",
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingText("");
      streamingRef.current = "";
      setToolCalls([]);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการส่งข้อความ");
      console.error("ACP prompt error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      // If suggestions are open, select the highlighted one
      if (showFileSuggestions && fileSuggestions.length > 0) {
        insertFileMention(fileSuggestions[selectedFileIndex]);
        return;
      }

      if (showCommandSuggestions && commandSuggestions.length > 0) {
        insertCommand(commandSuggestions[selectedCommandIndex]);
        return;
      }

      handleSend();
    } else if (e.key === "ArrowDown" && (showFileSuggestions || showCommandSuggestions)) {
      e.preventDefault();
      if (showFileSuggestions) {
        setSelectedFileIndex((prev) =>
          Math.min(prev + 1, fileSuggestions.length - 1)
        );
      } else if (showCommandSuggestions) {
        setSelectedCommandIndex((prev) =>
          Math.min(prev + 1, commandSuggestions.length - 1)
        );
      }
    } else if (e.key === "ArrowUp" && (showFileSuggestions || showCommandSuggestions)) {
      e.preventDefault();
      if (showFileSuggestions) {
        setSelectedFileIndex((prev) => Math.max(prev - 1, 0));
      } else if (showCommandSuggestions) {
        setSelectedCommandIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  };

  return (
    <div className="osa-chat-view flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="osa-chat-header flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold truncate">Smart Assistant</h2>
          {agentInfo && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
              {agentInfo.name} v{agentInfo.version}
            </span>
          )}
        </div>
      </div>

      <div className="osa-chat-messages flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex gap-2 text-red-600 dark:text-red-400">
            <AlertCircle size={20} />
            <div>{error}</div>
          </div>
        )}

        {messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 dark:text-zinc-400">
            <Bot size={48} className="mx-auto mb-4 opacity-30" />
            <p>พร้อมใช้งาน</p>
            <p className="text-sm mt-1">พิมพ์ข้อความเพื่อส่งไปยัง ACP Agent</p>
            <p className="text-xs mt-3 opacity-60">
              ใช้ @ เพื่อ mention ไฟล์ หรือ / เพื่อใช้ commands
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-blue-500 text-white rounded-tr-none"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-tl-none"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              <div
                className={`text-[10px] mt-1 opacity-50 ${msg.role === "user" ? "text-right" : "text-left"}`}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {streamingText && (
          <div className="flex gap-3 flex-row">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              <Bot size={16} />
            </div>
            <div className="max-w-[80%] p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-tl-none">
              <div className="text-sm whitespace-pre-wrap">{streamingText}</div>
            </div>
          </div>
        )}

        {toolCalls.length > 0 && (
          <div className="flex flex-col gap-1">
            {toolCalls.map((tc) => (
              <div
                key={tc.toolCallId}
                className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 px-2"
              >
                <Wrench size={12} />
                <span>{tc.title}</span>
                <span
                  className={`px-1 rounded ${
                    tc.status === "completed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : tc.status === "error"
                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}
                >
                  {tc.status}
                </span>
              </div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="osa-chat-input p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="relative">
          {/* File Suggestions Dropdown */}
          {showFileSuggestions && fileSuggestions.length > 0 && (
            <div className="absolute bottom-full mb-2 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50">
              {fileSuggestions.map((file, index) => (
                <div
                  key={file.path}
                  className={`px-3 py-2 cursor-pointer ${
                    index === selectedFileIndex
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                  onClick={() => insertFileMention(file)}
                >
                  <div className="flex items-center gap-2">
                    <AtSign size={14} />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <div className="text-xs text-zinc-500 ml-6">{file.path}</div>
                </div>
              ))}
            </div>
          )}

          {/* Command Suggestions Dropdown */}
          {showCommandSuggestions && commandSuggestions.length > 0 && (
            <div className="absolute bottom-full mb-2 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50">
              {commandSuggestions.map((cmd, index) => (
                <div
                  key={cmd.name}
                  className={`px-3 py-2 cursor-pointer ${
                    index === selectedCommandIndex
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                  onClick={() => insertCommand(cmd)}
                >
                  <div className="flex items-center gap-2">
                    <Slash size={14} />
                    <span className="text-sm font-medium">{cmd.name}</span>
                  </div>
                  <div className="text-xs text-zinc-500 ml-6">{cmd.description}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="พิมพ์ข้อความที่นี่... (ใช้ @ สำหรับไฟล์, / สำหรับคำสั่ง)"
              disabled={isLoading}
              className="w-full p-3 pr-12 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] max-h-[200px]"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
        {isLoading && (
          <div className="text-xs text-zinc-500 mt-1 pl-1">
            กำลังประมวลผล...
          </div>
        )}
      </div>
    </div>
  );
};

export class EnhancedChatView extends ItemView {
  private root: Root | null = null;
  private plugin: SmartAssistantPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: SmartAssistantPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_ENHANCED_CHAT;
  }

  getDisplayText(): string {
    return "Smart Assistant Chat (Enhanced)";
  }

  getIcon(): string {
    return "message-square";
  }

  async onOpen() {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();

    this.root = createRoot(container);
    this.root.render(
      React.createElement(EnhancedChatComponent, { plugin: this.plugin })
    );
  }

  async onClose() {
    this.root?.unmount();
    this.root = null;
  }
}