import { type ChildProcess, spawn } from "node:child_process"
import { Readable, Writable } from "node:stream"
import type { Agent, Client } from "@agentclientprotocol/sdk"
import { ClientSideConnection, ndJsonStream, PROTOCOL_VERSION } from "@agentclientprotocol/sdk"
import { EventBus } from "../services/EventBus"
import type { ACPAgentConfig } from "../types/acp.types"

export interface ACPInitializeResult {
  protocolVersion: number
  agentInfo: {
    name: string
    title: string
    version: string
  }
  authMethods?: Array<{
    id: string
    name: string
    description: string
    type: string
    args: string[]
  }>
  modes?: {
    currentModeId: string
    availableModes: Array<{
      id: string
      name: string
      description: string
    }>
  }
  agentCapabilities?: {
    loadSession?: boolean
    promptCapabilities?: {
      image?: boolean
      audio?: boolean
      embeddedContext?: boolean
    }
  }
}

export interface ACPSessionInfo {
  sessionId: string
  cwd: string
}

export class ACPManager {
  private activeProcess: ChildProcess | null = null
  private connection: ClientSideConnection | null = null
  private eventBus: EventBus
  private currentSessionId: string | null = null
  private agentInfo: ACPInitializeResult | null = null

  constructor(_nodePath: string = "node", eventBus?: EventBus) {
    this.eventBus = eventBus || new EventBus()
  }

  async connect(config: ACPAgentConfig): Promise<ACPInitializeResult> {
    if (this.isActive()) {
      await this.disconnect()
    }

    switch (config.transportType ?? "stdio") {
      case "stdio":
        return await this.spawnStdioAgent(config)
      case "http":
      case "sse":
        throw new Error(`Transport ${config.transportType} not yet implemented`)
      default:
        throw new Error(`Unknown transport type: ${config.transportType}`)
    }
  }

  private async spawnStdioAgent(config: ACPAgentConfig): Promise<ACPInitializeResult> {
    return new Promise((resolve, reject) => {
      try {
        const command = config.executablePath
        if (!command) {
          throw new Error("ACPAgentConfig must have executablePath")
        }

        const args = config.args || ["--acp"]
        if (!args.includes("--acp")) {
          args.unshift("--acp")
        }

        const env = { ...process.env, ...(config.env || {}) }

        this.activeProcess = spawn(command, args, {
          env,
          shell: false,
          stdio: ["pipe", "pipe", "pipe"],
        })

        const stdin = this.activeProcess.stdin!
        const stdout = this.activeProcess.stdout!
        const stderr = this.activeProcess.stderr!

        stderr.on("data", (data) => {
          console.error("[ACP stderr]", data.toString())
        })

        const outputStream = Writable.toWeb(stdin) as WritableStream<Uint8Array>
        const inputStream = Readable.toWeb(stdout) as ReadableStream<Uint8Array>

        const stream = ndJsonStream(outputStream, inputStream)

        const toClient = (_agent: Agent): Client => ({
          requestPermission: async (params: any) => {
            this.eventBus.emit("acp:permission_request", {
              sessionId: this.currentSessionId || "",
              toolCallId: params.toolCall?.toolCallId || "",
              title: params.toolCall?.title || "Permission Request",
              options:
                params.options?.map((o: any) => ({
                  optionId: o.optionId,
                  name: o.name,
                  kind: o.kind,
                })) || [],
            })
            return { outcome: { outcome: "accepted" } } as any
          },
          sessionUpdate: async (params: any) => {
            this.handleSessionUpdate(params)
          },
        })

        this.connection = new ClientSideConnection(toClient, stream)

        this.connection
          .initialize({
            protocolVersion: PROTOCOL_VERSION,
            clientCapabilities: {
              fs: { readTextFile: true, writeTextFile: true },
              terminal: true,
            },
            clientInfo: {
              name: "obsidian-acp-bl1nk",
              version: "0.1.0",
            },
          })
          .then((initResponse: any) => {
            this.agentInfo = initResponse
            this.eventBus.emit("acp:connected", {
              agentName: initResponse.agentInfo?.name || "unknown",
              agentVersion: initResponse.agentInfo?.version || "0.0.0",
            })
            resolve(initResponse)
          })
          .catch(reject)

        this.activeProcess.on("error", (err) => {
          this.eventBus.emit("acp:error", { error: err.message })
          reject(err)
        })

        this.activeProcess.on("exit", (code) => {
          console.log(`[ACP] Process exited with code ${code}`)
          this.eventBus.emit("acp:disconnected", {
            reason: `Process exited with code ${code}`,
          })
          this.activeProcess = null
          this.connection = null
          this.agentInfo = null
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  private handleSessionUpdate(params: any): void {
    const update = params?.update
    if (!update) return

    switch (update.sessionUpdate) {
      case "agent_message_chunk":
        if (update.content?.type === "text") {
          this.eventBus.emit("acp:message_chunk", {
            sessionId: this.currentSessionId || "",
            type: "text",
            text: update.content.text,
          })
        } else if (update.content?.type === "image") {
          this.eventBus.emit("acp:message_chunk", {
            sessionId: this.currentSessionId || "",
            type: "image",
            data: update.content.data,
            mimeType: update.content.mimeType,
          })
        }
        break

      case "tool_call":
        this.eventBus.emit("acp:tool_call", {
          sessionId: this.currentSessionId || "",
          toolCallId: update.toolCallId,
          title: update.title,
          status: update.status,
        })
        break

      case "tool_call_update":
        this.eventBus.emit("acp:tool_call", {
          sessionId: this.currentSessionId || "",
          toolCallId: update.toolCallId,
          title: "",
          status: update.status,
          output: update.output,
        })
        break

      case "agent_thought_chunk":
      case "plan":
      case "user_message_chunk":
        break

      default:
        break
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      this.connection = null
    }
    if (this.activeProcess) {
      this.activeProcess.kill()
      this.activeProcess = null
    }
    this.agentInfo = null
    this.currentSessionId = null
  }

  isActive(): boolean {
    return this.connection !== null && this.activeProcess !== null
  }

  getAgentInfo(): ACPInitializeResult | null {
    return this.agentInfo
  }

  async createSession(cwd: string, mcpServers: any[] = []): Promise<string> {
    if (!this.connection) throw new Error("Agent not connected")
    const result = await this.connection.newSession({ cwd, mcpServers })
    this.currentSessionId = result.sessionId
    return result.sessionId
  }

  async prompt(
    sessionId: string,
    prompt:
      | string
      | Array<{
          type: string
          text?: string
          data?: string
          mimeType?: string
        }>
  ): Promise<{ stopReason: string }> {
    if (!this.connection) throw new Error("Agent not connected")

    this.currentSessionId = sessionId

    const promptContent = typeof prompt === "string" ? [{ type: "text", text: prompt }] : prompt

    const result = await this.connection.prompt({
      sessionId,
      prompt: promptContent as any,
    })

    return { stopReason: result.stopReason }
  }

  async loadSession(sessionId: string, cwd: string, mcpServers: any[] = []): Promise<any> {
    if (!this.connection) throw new Error("Agent not connected")
    return await this.connection.loadSession({ sessionId, cwd, mcpServers })
  }

  async setSessionMode(sessionId: string, modeId: string): Promise<void> {
    if (!this.connection) throw new Error("Agent not connected")
    await this.connection.setSessionMode({ sessionId, modeId })
  }

  async cleanup(): Promise<void> {
    await this.disconnect()
  }

  getEventBus(): EventBus {
    return this.eventBus
  }
}
