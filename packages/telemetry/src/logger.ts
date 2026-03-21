export type LogLevel = "debug" | "info" | "warn" | "error"

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: Record<string, unknown>
}

class Logger {
  private logs: LogEntry[] = []
  private minLevel: LogLevel = "info"

  constructor(minLevel: LogLevel = "info") {
    this.minLevel = minLevel
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"]
    return levels.indexOf(level) >= levels.indexOf(this.minLevel)
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
    }

    this.logs.push(entry)

    const prefix = `[${level.toUpperCase()}]`
    const ctxStr = context ? ` ${JSON.stringify(context)}` : ""

    switch (level) {
      case "debug":
        console.debug(prefix, message, ctxStr)
        break
      case "info":
        console.info(prefix, message, ctxStr)
        break
      case "warn":
        console.warn(prefix, message, ctxStr)
        break
      case "error":
        console.error(prefix, message, ctxStr)
        break
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log("debug", message, context)
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context)
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context)
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log("error", message, context)
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
  }
}

export const logger = new Logger()

export { Logger }
