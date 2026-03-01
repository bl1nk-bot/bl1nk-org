import { LogEntry, PluginStore } from "../types/store.types";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export class Logger {
  constructor(
    private store: PluginStore,
    private maxLogs: number = 1000,
  ) {}

  private log(
    level: "info" | "warn" | "error",
    message: string,
    context?: Record<string, unknown>,
  ): void {
    const entry: LogEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    this.store.logs.push(entry);

    if (this.store.logs.length > this.maxLogs) {
      this.store.logs = this.store.logs.slice(-this.maxLogs);
    }

    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
      `[${level.toUpperCase()}] ${message}`,
      context,
    );
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log("error", message, context);
  }

  getLogs(filter?: {
    level?: string;
    since?: Date;
    limit?: number;
  }): LogEntry[] {
    let logs = [...this.store.logs];

    if (filter?.level) {
      logs = logs.filter((l) => l.level === filter.level);
    }

    if (filter?.since) {
      const sinceTime = filter.since.getTime();
      logs = logs.filter((l) => new Date(l.timestamp).getTime() >= sinceTime);
    }

    if (filter?.limit) {
      logs = logs.slice(-filter.limit);
    }

    return logs;
  }

  clearLogs(): void {
    this.store.logs = [];
  }
}
