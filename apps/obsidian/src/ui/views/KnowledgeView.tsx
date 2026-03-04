import { Database, ExternalLink, Search } from "lucide-react"
import { ItemView, type WorkspaceLeaf } from "obsidian"
import * as React from "react"
import { useState } from "react"
import { createRoot, type Root } from "react-dom/client"

import type SmartAssistantPlugin from "../../main"
import type { PluginSettings } from "../../types/acp.types"

export const VIEW_TYPE_KNOWLEDGE = "knowledge"

interface KnowledgeComponentProps {
  plugin: SmartAssistantPlugin
}

const KnowledgeComponent: React.FC<KnowledgeComponentProps> = ({ plugin }) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      // เรียกผ่าน KnowledgeManager (ยังเป็น dummy)
      console.log("🔍 Searching Knowledge Base:", query)
      // const data = await plugin.knowledgeManager.query(query);
      // setResults(data);

      // Dummy result
      setResults([
        `ผลการค้นหา: ${query} (จาก AnythingLLM)`,
        "ตัวอย่างเอกสารที่เกี่ยวข้อง 1",
        "ตัวอย่างเอกสารที่เกี่ยวข้อง 2",
      ])
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="osa-knowledge-view flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="osa-knowledge-header p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Database size={20} /> Knowledge Base
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          ค้นหาและจัดการฐานความรู้ AnythingLLM
        </p>
      </div>

      <div className="osa-knowledge-search p-4 space-y-4">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="ค้นหาในฐานความรู้..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isSearching ? "กำลังค้น..." : "ค้นหา"}
          </button>
        </div>

        <div className="osa-knowledge-results space-y-3">
          {results.length > 0 ? (
            results.map((result, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 line-clamp-3">{result}</div>
                  <button className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              <Database size={48} className="mx-auto mb-4 opacity-20" />
              <p>ยังไม่มีผลการค้นหา ลองพิมพ์คำค้นดู</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Obsidian ItemView Wrapper
export class KnowledgeView extends ItemView {
  private root: Root | null = null
  private plugin: SmartAssistantPlugin

  constructor(leaf: WorkspaceLeaf, plugin: SmartAssistantPlugin) {
    super(leaf)
    this.plugin = plugin
  }

  getViewType(): string {
    return VIEW_TYPE_KNOWLEDGE
  }

  getDisplayText(): string {
    return "Knowledge Base"
  }

  getIcon(): string {
    return "database"
  }

  async onOpen() {
    const container = this.containerEl.children[1] as HTMLElement
    container.empty()

    this.root = createRoot(container)
    this.root.render(React.createElement(KnowledgeComponent, { plugin: this.plugin }))
  }

  async onClose() {
    this.root?.unmount()
    this.root = null
  }
}
