/**
 * Agent Skill Manager
 * Handles loading, registering, and executing agent skills from local paths and GitHub URLs
 */

import { normalizePath } from "obsidian"
import type SmartAssistantPlugin from "../main"

export interface SkillDefinition {
  id: string
  name: string
  description: string
  version: string
  author?: string
  icon?: string
  parameters?: Array<{
    name: string
    type: "string" | "number" | "boolean" | "array"
    description?: string
    required?: boolean
    default?: any
  }>
  execute: (input: string, params?: Record<string, any>) => Promise<string>
}

export interface SkillSource {
  type: "local" | "github"
  path: string
  lastUpdated?: Date
}

export class SkillManager {
  private plugin: SmartAssistantPlugin
  private skills: Map<string, SkillDefinition> = new Map()
  private skillSources: Map<string, SkillSource> = new Map()
  private readonly STORAGE_KEY = "acp-skills-config"

  constructor(plugin: SmartAssistantPlugin) {
    this.plugin = plugin
    this.loadSkillConfig()
  }

  /**
   * Load skill configuration from plugin storage
   */
  private async loadSkillConfig(): Promise<void> {
    const saved = (await this.plugin.loadData())?.[this.STORAGE_KEY]
    if (saved?.sources) {
      this.skillSources = new Map(Object.entries(saved.sources))
    }
  }

  /**
   * Save skill configuration to plugin storage
   */
  private async saveSkillConfig(): Promise<void> {
    const allPluginData = (await this.plugin.loadData()) || {}
    allPluginData[this.STORAGE_KEY] = {
      sources: Object.fromEntries(this.skillSources),
    }
    await this.plugin.saveData(allPluginData)
  }

  /**
   * Register a built-in skill
   */
  registerBuiltInSkill(skill: SkillDefinition): void {
    this.skills.set(skill.id, skill)
  }

  /**
   * Load a skill from a local path
   */
  async loadSkillFromPath(skillPath: string): Promise<SkillDefinition> {
    try {
      const normalizedPath = normalizePath(skillPath)
      const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath)

      if (!file || file.constructor.name !== "TFile") {
        throw new Error(`Skill file not found: ${skillPath}`)
      }

      const content = await this.plugin.app.vault.read(file as any)
      const skill = this.parseSkillDefinition(content, skillPath)

      this.skills.set(skill.id, skill)
      this.skillSources.set(skill.id, {
        type: "local",
        path: skillPath,
        lastUpdated: new Date(),
      })

      await this.saveSkillConfig()
      return skill
    } catch (error) {
      throw new Error(`Failed to load skill from ${skillPath}: ${error}`)
    }
  }

  /**
   * Load a skill from a GitHub URL
   */
  async loadSkillFromGitHub(githubUrl: string, branch: string = "main"): Promise<SkillDefinition> {
    try {
      // Parse GitHub URL to extract owner, repo, and path
      const urlMatch = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)(?:\/blob\/[^/]+)?\/(.+)/)
      if (!urlMatch) {
        throw new Error("Invalid GitHub URL format")
      }

      const [, owner, repo, filePath] = urlMatch
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`

      const response = await fetch(rawUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch skill from GitHub: ${response.statusText}`)
      }

      const content = await response.text()
      const skill = this.parseSkillDefinition(content, githubUrl)

      this.skills.set(skill.id, skill)
      this.skillSources.set(skill.id, {
        type: "github",
        path: githubUrl,
        lastUpdated: new Date(),
      })

      await this.saveSkillConfig()
      return skill
    } catch (error) {
      throw new Error(`Failed to load skill from GitHub: ${error}`)
    }
  }

  /**
   * Parse skill definition from Markdown or JSON content
   */
  private parseSkillDefinition(content: string, _source: string): SkillDefinition {
    try {
      // Try to parse as JSON first
      try {
        const json = JSON.parse(content)
        return this.validateSkillDefinition(json)
      } catch {
        // Fall back to Markdown parsing
        return this.parseMarkdownSkill(content)
      }
    } catch (error) {
      throw new Error(`Invalid skill definition format: ${error}`)
    }
  }

  /**
   * Parse skill definition from Markdown format
   */
  private parseMarkdownSkill(content: string): SkillDefinition {
    const lines = content.split("\n")
    const skill: any = {}

    let currentSection = ""
    let parametersText = ""

    for (const line of lines) {
      if (line.startsWith("# ")) {
        skill.name = line.replace("# ", "").trim()
        skill.id = skill.name.toLowerCase().replace(/\s+/g, "-")
      } else if (line.startsWith("## Description")) {
        currentSection = "description"
      } else if (line.startsWith("## Parameters")) {
        currentSection = "parameters"
      } else if (line.startsWith("## ")) {
        currentSection = ""
      } else if (currentSection === "description" && line.trim()) {
        skill.description = line.trim()
      } else if (currentSection === "parameters" && line.trim()) {
        parametersText += `${line}\n`
      }
    }

    // Parse parameters from markdown table or list
    if (parametersText) {
      skill.parameters = this.parseParametersFromMarkdown(parametersText)
    }

    skill.version = "1.0.0"
    skill.execute = async (input: string) => input // Default implementation

    return this.validateSkillDefinition(skill)
  }

  /**
   * Parse parameters from Markdown table or list
   */
  private parseParametersFromMarkdown(text: string): Array<{
    name: string
    type: string
    description?: string
    required?: boolean
  }> {
    const parameters: Array<{
      name: string
      type: string
      description?: string
      required?: boolean
    }> = []
    const lines = text.split("\n").filter((l) => l.trim())

    for (const line of lines) {
      if (line.includes("|")) {
        // Table format
        const cells = line.split("|").map((c) => c.trim())
        if (cells.length >= 3) {
          parameters.push({
            name: cells[1],
            type: cells[2] || "string",
            description: cells[3],
            required: cells[4]?.toLowerCase() === "yes",
          })
        }
      } else if (line.startsWith("- ")) {
        // List format
        const match = line.match(/- \*\*(\w+)\*\*\s*\((\w+)\):\s*(.*)/)
        if (match) {
          parameters.push({
            name: match[1],
            type: match[2],
            description: match[3],
          })
        }
      }
    }

    return parameters
  }

  /**
   * Validate skill definition has required fields
   */
  private validateSkillDefinition(skill: any): SkillDefinition {
    if (!skill.name || !skill.id) {
      throw new Error("Skill must have name and id")
    }

    return {
      id: skill.id,
      name: skill.name,
      description: skill.description || "",
      version: skill.version || "1.0.0",
      author: skill.author,
      icon: skill.icon,
      parameters: skill.parameters,
      execute: skill.execute || (async (input: string) => input),
    }
  }

  /**
   * Get a registered skill by ID
   */
  getSkill(skillId: string): SkillDefinition | undefined {
    return this.skills.get(skillId)
  }

  /**
   * Get all registered skills
   */
  getAllSkills(): SkillDefinition[] {
    return Array.from(this.skills.values())
  }

  /**
   * Get skill suggestions based on input
   */
  getSkillSuggestions(input: string, limit: number = 5): SkillDefinition[] {
    const query = input.toLowerCase()
    return Array.from(this.skills.values())
      .filter(
        (skill) =>
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query)
      )
      .slice(0, limit)
  }

  /**
   * Execute a skill with given input and parameters
   */
  async executeSkill(
    skillId: string,
    input: string,
    params?: Record<string, any>
  ): Promise<string> {
    const skill = this.skills.get(skillId)
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`)
    }

    try {
      return await skill.execute(input, params)
    } catch (error) {
      throw new Error(`Skill execution failed: ${error}`)
    }
  }

  /**
   * Reload a skill from its source
   */
  async reloadSkill(skillId: string): Promise<SkillDefinition> {
    const source = this.skillSources.get(skillId)
    if (!source) {
      throw new Error(`No source found for skill: ${skillId}`)
    }

    if (source.type === "local") {
      return this.loadSkillFromPath(source.path)
    } else if (source.type === "github") {
      return this.loadSkillFromGitHub(source.path)
    }

    throw new Error(`Unknown skill source type: ${source.type}`)
  }

  /**
   * Remove a skill
   */
  async removeSkill(skillId: string): Promise<void> {
    this.skills.delete(skillId)
    this.skillSources.delete(skillId)
    await this.saveSkillConfig()
  }
}

/**
 * Built-in docs-writer skill
 */
export function createDocsWriterSkill(): SkillDefinition {
  return {
    id: "docs-writer",
    name: "Documentation Writer",
    description:
      "Generate and refine documentation for your code and projects. Helps create clear, well-structured documentation.",
    version: "1.0.0",
    author: "Manus AI",
    icon: "📝",
    parameters: [
      {
        name: "style",
        type: "string",
        description: "Documentation style: technical, casual, formal",
        default: "technical",
      },
      {
        name: "language",
        type: "string",
        description: "Output language",
        default: "en",
      },
      {
        name: "includeExamples",
        type: "boolean",
        description: "Include code examples",
        default: true,
      },
    ],
    execute: async (input: string, params?: Record<string, any>) => {
      // This would be implemented to call the actual docs-writer agent
      const style = params?.style || "technical"
      const language = params?.language || "en"
      const includeExamples = params?.includeExamples ?? true

      return `# Documentation Generated\n\nInput: ${input}\n\nStyle: ${style}\nLanguage: ${language}\nInclude Examples: ${includeExamples}`
    },
  }
}

/**
 * Built-in code-review skill
 */
export function createCodeReviewSkill(): SkillDefinition {
  return {
    id: "code-review",
    name: "Code Reviewer",
    description: "Review code for quality issues, best practices, and potential improvements.",
    version: "1.0.0",
    author: "Manus AI",
    icon: "🔍",
    parameters: [
      {
        name: "language",
        type: "string",
        description: "Programming language",
        required: true,
      },
      {
        name: "focusAreas",
        type: "array",
        description: "Areas to focus on: performance, security, readability",
      },
    ],
    execute: async (input: string, params?: Record<string, any>) => {
      const language = params?.language || "unknown"
      const focusAreas = params?.focusAreas || ["readability"]

      return `# Code Review\n\nLanguage: ${language}\nFocus Areas: ${focusAreas.join(", ")}\n\nCode:\n${input}`
    },
  }
}

/**
 * Built-in summarize skill
 */
export function createSummarizeSkill(): SkillDefinition {
  return {
    id: "summarize",
    name: "Summarizer",
    description: "Summarize text content into concise, key points.",
    version: "1.0.0",
    author: "Manus AI",
    icon: "📋",
    parameters: [
      {
        name: "length",
        type: "string",
        description: "Summary length: short, medium, long",
        default: "medium",
      },
      {
        name: "format",
        type: "string",
        description: "Output format: bullet-points, paragraph, outline",
        default: "bullet-points",
      },
    ],
    execute: async (input: string, params?: Record<string, any>) => {
      const length = params?.length || "medium"
      const format = params?.format || "bullet-points"

      return `# Summary\n\nLength: ${length}\nFormat: ${format}\n\nContent:\n${input.substring(0, 200)}...`
    },
  }
}
