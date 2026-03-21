import { ItemView, Setting, TextAreaComponent, type WorkspaceLeaf } from "obsidian"
import type SmartAssistantPlugin from "../../main"
import type { Tool, ToolActionType } from "../../types/tool.types"

export const TOOL_TEMPLATE_VIEW_TYPE = "obsidian-agent-tool-template"

export class ToolTemplateView extends ItemView {
  private toolName?: string
  private toolDescription?: string
  private toolActionType: ToolActionType = "javascript"
  private toolCode?: string

  constructor(
    leaf: WorkspaceLeaf,
    private plugin: SmartAssistantPlugin
  ) {
    super(leaf)
  }

  getViewType(): string {
    return TOOL_TEMPLATE_VIEW_TYPE
  }

  getDisplayText(): string {
    return "Tool Templates"
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1] as HTMLElement
    container.empty()

    container.createEl("h2", { text: "Create Tool Template" })

    new Setting(container as HTMLElement).setName("Tool Name").addText((text) => {
      text.setPlaceholder("my-tool")
      text.onChange((value) => {
        this.toolName = value
      })
    })

    new Setting(container as HTMLElement).setName("Description").addText((text) => {
      text.setPlaceholder("Describe what this tool does")
      text.onChange((value) => {
        this.toolDescription = value
      })
    })

    new Setting(container as HTMLElement).setName("Action Type").addDropdown((dropdown) => {
      dropdown
        .addOption("javascript", "JavaScript")
        .addOption("notion", "Notion")
        .addOption("airtable", "Airtable")
        .addOption("clickup", "ClickUp")
        .addOption("acp_slash", "ACP Slash Command")
        .setValue(this.toolActionType)
        .onChange((value: string) => {
          this.toolActionType = value as ToolActionType
        })
    })

    const codeDiv = container.createDiv("tool-code")
    const codeArea = new TextAreaComponent(codeDiv)
    codeArea.setPlaceholder("// Enter JavaScript code here\n// Available: params, context, console")
    codeArea.onChange((value) => {
      this.toolCode = value
    })

    new Setting(container as HTMLElement).addButton((btn) => {
      btn.setButtonText("Create Tool")
      btn.onClick(async () => {
        await this.createTool()
      })
    })

    this.plugin.logger.info("ToolTemplateView opened")
  }

  private async createTool(): Promise<void> {
    if (!this.toolName) {
      this.plugin.logger.warn("Tool name is required")
      return
    }

    const tool: Tool = {
      id: `tool-${Date.now()}`,
      name: this.toolName,
      description: this.toolDescription,
      version: "1.0.0",
      scope: "global",
      actionType: this.toolActionType,
      parameters: [],
      javascriptCode: this.toolCode,
    }

    this.plugin.store.tools.push(tool)
    await this.plugin.saveSettings()

    this.plugin.logger.info("Tool created", {
      toolId: tool.id,
      name: tool.name,
    })
  }

  async onClose(): Promise<void> {
    this.plugin.logger.info("ToolTemplateView closed")
  }
}
