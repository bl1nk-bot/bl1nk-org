import { App, TFile } from "obsidian";
import { PluginSettings } from "../types/acp.types";
import { KnowledgeManager } from "./KnowledgeManager";

export class ContextEnricher {
  constructor(
    private app: App,
    private settings: PluginSettings,
    private knowledgeManager: KnowledgeManager,
  ) {}

  async enrich(text: string, activeFile: TFile | null): Promise<string> {
    let context = "";

    if (this.settings.acp.contextMode === "active_note" && activeFile) {
      const content = await this.app.vault.read(activeFile);
      context += `--- ACTIVE NOTE: ${activeFile.basename} ---\n${content}\n\n`;
    }

    if (
      this.settings.acp.contextMode === "rag_enriched" &&
      this.settings.rag.enabled
    ) {
      const ragResults = await this.knowledgeManager.query({ query: text });
      if (ragResults.length > 0) {
        const ragText = ragResults
          .map((r) => `- ${r.title}: ${r.excerpt}`)
          .join("\n");
        context += `--- KNOWLEDGE BASE CONTEXT ---\n${ragText}\n\n`;
      }
    }

    if (this.settings.rag.injectMode === "prepend") {
      return `${context}${text}`;
    } else if (this.settings.rag.injectMode === "append") {
      return `${text}\n\n${context}`;
    } else {
      return `${context}${text}`;
    }
  }
}
