import { type App, PluginSettingTab, Setting } from "obsidian"
import type SmartAssistantPlugin from "../main"

export class SmartAssistantSettingsTab extends PluginSettingTab {
  plugin: SmartAssistantPlugin

  constructor(app: App, plugin: SmartAssistantPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    containerEl.createEl("h2", { text: "Obsidian Smart Assistant Settings" })

    new Setting(containerEl)
      .setName("Node.js Path")
      .setDesc("Path to your Node.js executable")
      .addText((text) =>
        text
          .setPlaceholder("/usr/local/bin/node")
          .setValue(this.plugin.settings.acp.nodePath || "")
          .onChange(async (value) => {
            this.plugin.settings.acp.nodePath = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName("Context Mode")
      .setDesc("How context is enriched for the AI")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("active_note", "Active Note")
          .addOption("rag_enriched", "RAG Enriched")
          .addOption("manual", "Manual")
          .setValue(this.plugin.settings.acp.contextMode)
          .onChange(async (value: any) => {
            this.plugin.settings.acp.contextMode = value
            await this.plugin.saveSettings()
          })
      )

    containerEl.createEl("h3", { text: "AnythingLLM (RAG) Settings" })

    new Setting(containerEl)
      .setName("Enable RAG")
      .setDesc("Enable retrieval augmented generation using AnythingLLM")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.rag.enabled).onChange(async (value) => {
          this.plugin.settings.rag.enabled = value
          await this.plugin.saveSettings()
        })
      )

    new Setting(containerEl)
      .setName("AnythingLLM Endpoint")
      .setDesc("URL of your AnythingLLM instance")
      .addText((text) =>
        text
          .setPlaceholder("http://localhost:3001")
          .setValue(this.plugin.settings.rag.endpoint)
          .onChange(async (value) => {
            this.plugin.settings.rag.endpoint = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName("AnythingLLM API Key")
      .setDesc("Your AnythingLLM API key")
      .addText((text) =>
        text
          .setPlaceholder("Enter API Key")
          .setValue(this.plugin.settings.rag.apiKey || "")
          .onChange(async (value) => {
            this.plugin.settings.rag.apiKey = value
            await this.plugin.saveSettings()
          })
      )

    containerEl.createEl("h3", { text: "Integrations" })

    new Setting(containerEl)
      .setName("Notion Integration")
      .setDesc("Enable Notion integration via MCP Gateway")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.integrations.notion?.enabled || false)
          .onChange(async (value) => {
            this.plugin.settings.integrations.notion = {
              ...this.plugin.settings.integrations.notion,
              enabled: value,
            }
            await this.plugin.saveSettings()
          })
      )
  }
}
