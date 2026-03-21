import type { Logger } from "../services/Logger"
import type { RAGSettings } from "../types/acp.types"

export interface RAGQuery {
  query: string
  workspace?: string
  topK?: number
}

export interface RAGResult {
  title: string
  excerpt: string
  score: number
  metadata?: Record<string, unknown>
}

export class KnowledgeManager {
  private endpoint: string
  private apiKey?: string
  private defaultWorkspace?: string

  constructor(
    private settings: RAGSettings,
    private logger: Logger
  ) {
    this.endpoint = settings.endpoint || "http://localhost:3001/api/v1"
    this.apiKey = settings.apiKey
    this.defaultWorkspace = settings.defaultWorkspace
  }

  async query(input: RAGQuery): Promise<RAGResult[]> {
    if (!this.settings.enabled) {
      this.logger.warn("RAG is disabled, returning empty results")
      return []
    }

    try {
      const workspace = input.workspace || this.defaultWorkspace || "default"
      const _topK = input.topK || this.settings.topK || 5

      const response = await fetch(`${this.endpoint}/workspaces/${workspace}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { "x-api-key": this.apiKey } : {}),
        },
        body: JSON.stringify({
          message: input.query,
          mode: "query",
        }),
      })

      if (!response.ok) {
        throw new Error(`AnythingLLM API error: ${response.statusText}`)
      }

      const data = await response.json()

      const results: RAGResult[] = (data.sources || []).map((source: any) => ({
        title: source.name || "Unknown",
        excerpt: source.excerpt || source.text || "",
        score: source.similarity || 0,
        metadata: source.metadata,
      }))

      this.logger.info("RAG query successful", {
        query: input.query,
        resultCount: results.length,
      })

      return results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error("RAG query failed", {
        query: input.query,
        error: errorMessage,
      })
      return []
    }
  }

  isAvailable(): boolean {
    return this.settings.enabled && !!this.endpoint
  }

  updateSettings(newSettings: Partial<RAGSettings>): void {
    Object.assign(this.settings, newSettings)
    this.endpoint = this.settings.endpoint || this.endpoint
    this.apiKey = this.settings.apiKey
    this.defaultWorkspace = this.settings.defaultWorkspace
    this.logger.info("RAG settings updated")
  }
}
