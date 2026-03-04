import type { EventBus } from "../services/EventBus"
import type { Logger } from "../services/Logger"
import { type Hook, HookAction, type HookEvent, Project } from "../types/index.types"
import type { PluginStore } from "../types/store.types"
import type { ProjectManager } from "./ProjectManager"
import type { ToolExecutionContext, ToolManager } from "./ToolManager"

export class HookManager {
  constructor(
    private store: PluginStore,
    private eventBus: EventBus,
    private projectManager: ProjectManager,
    private toolManager: ToolManager,
    private logger: Logger
  ) {
    this.registerEventListeners()
  }

  private registerEventListeners(): void {
    this.eventBus.on("note:saved", async ({ path, content }) => {
      await this.triggerHooks("on_note_save", { path, content })
    })

    this.eventBus.on("tool:executed", async ({ toolId, result, sessionId }) => {
      await this.triggerHooks("on_tool_complete", {
        toolId,
        result,
        sessionId,
      })
    })

    this.eventBus.on("session:started", async ({ projectId, sessionId }) => {
      await this.triggerHooks("on_session_start", { projectId, sessionId })
    })
  }

  private async triggerHooks(event: HookEvent, context: Record<string, unknown>): Promise<void> {
    const hooks = this.store.projects
      .flatMap((p) => p.hooks.filter((h) => h.event === event && h.enabled))
      .filter((h) => !h.condition || this.evaluateCondition(h.condition, context))

    for (const hook of hooks) {
      await this.executeHookAction(hook, context)
    }
  }

  private async executeHookAction(hook: Hook, context: Record<string, unknown>): Promise<void> {
    try {
      switch (hook.action) {
        case "run_tool":
          await this.runToolAction(hook, context)
          break
        case "run_skill":
          break
        case "send_to_agent":
          break
        case "notify":
          this.logger.info(`Hook notify: ${hook.targetId}`)
          break
      }

      this.eventBus.emit("hook:triggered", {
        hookId: hook.id,
        projectId: context.projectId as string,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error("Hook execution failed", {
        hookId: hook.id,
        error: errorMessage,
      })
    }
  }

  private async runToolAction(hook: Hook, context: Record<string, unknown>): Promise<void> {
    const tool = this.store.tools.find((t) => t.id === hook.targetId)
    if (!tool) {
      throw new Error(`Tool not found: ${hook.targetId}`)
    }

    const execContext: ToolExecutionContext = {
      sessionId: context.sessionId as string,
      projectId: context.projectId as string,
    }

    await this.toolManager.execute(tool, {}, execContext)
  }

  private evaluateCondition(condition: string, context: Record<string, unknown>): boolean {
    try {
      const fn = new Function("context", `return ${condition}`)
      return fn(context) === true
    } catch {
      return false
    }
  }
}
