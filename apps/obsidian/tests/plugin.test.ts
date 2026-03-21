/**
 * Comprehensive Test Suite for Obsidian ACP Bl1nk Plugin
 * Tests cover: AI Providers, Auth Manager, Skill Manager, and Chat View
 */

import { beforeEach, describe, expect, it } from "@jest/globals"
import { AuthManager } from "../src/core/AuthManager"
import {
  createCodeReviewSkill,
  createDocsWriterSkill,
  createSummarizeSkill,
  SkillManager,
} from "../src/core/SkillManager"
import {
  CloudShellProvider,
  createAIProvider,
  GeminiAIProvider,
  QwenAIProvider,
  VertexAIProvider,
} from "../src/integrations/AIProvider"

// ============================================================================
// AI Provider Tests
// ============================================================================

describe("AI Providers", () => {
  describe("QwenAIProvider", () => {
    let provider: QwenAIProvider

    beforeEach(() => {
      provider = new QwenAIProvider({
        type: "qwen",
        apiKey: "sk-test-key-12345",
      })
    })

    it("should initialize with valid API key", async () => {
      await expect(provider.initialize()).resolves.not.toThrow()
      expect(provider.isConnected()).toBe(true)
    })

    it("should throw error without API key", async () => {
      const invalidProvider = new QwenAIProvider({
        type: "qwen",
      })
      await expect(invalidProvider.initialize()).rejects.toThrow("Qwen API key is required")
    })

    it("should return provider info", () => {
      const info = provider.getInfo()
      expect(info.name).toBe("Qwen")
      expect(info.model).toBe("qwen-code")
    })

    it("should disconnect properly", async () => {
      await provider.initialize()
      await provider.disconnect()
      expect(provider.isConnected()).toBe(false)
    })
  })

  describe("GeminiAIProvider", () => {
    let provider: GeminiAIProvider

    beforeEach(() => {
      provider = new GeminiAIProvider({
        type: "gemini",
        apiKey: "AIzaSyD1234567890abcdefghijklmnopqrst",
      })
    })

    it("should initialize with valid API key", async () => {
      await expect(provider.initialize()).resolves.not.toThrow()
      expect(provider.isConnected()).toBe(true)
    })

    it("should return provider info", () => {
      const info = provider.getInfo()
      expect(info.name).toBe("Gemini")
      expect(info.model).toBe("gemini-2.5-flash")
    })
  })

  describe("VertexAIProvider", () => {
    let provider: VertexAIProvider

    beforeEach(() => {
      provider = new VertexAIProvider({
        type: "vertex",
        apiKey: "test-token-12345",
        projectId: "test-project-123",
        region: "us-central1",
      })
    })

    it("should require both API key and project ID", async () => {
      const invalidProvider = new VertexAIProvider({
        type: "vertex",
        apiKey: "test-token",
      })
      await expect(invalidProvider.initialize()).rejects.toThrow(
        "Vertex AI requires both API key and project ID"
      )
    })

    it("should initialize with valid credentials", async () => {
      await expect(provider.initialize()).resolves.not.toThrow()
      expect(provider.isConnected()).toBe(true)
    })

    it("should return provider info", () => {
      const info = provider.getInfo()
      expect(info.name).toBe("Vertex AI")
      expect(info.model).toBe("text-bison")
    })
  })

  describe("CloudShellProvider", () => {
    let provider: CloudShellProvider

    beforeEach(() => {
      provider = new CloudShellProvider({
        type: "cloudshell",
        authToken: "test-auth-token-12345",
      })
    })

    it("should require auth token", async () => {
      const invalidProvider = new CloudShellProvider({
        type: "cloudshell",
      })
      await expect(invalidProvider.initialize()).rejects.toThrow(
        "CloudShell auth token is required"
      )
    })

    it("should initialize with valid auth token", async () => {
      await expect(provider.initialize()).resolves.not.toThrow()
      expect(provider.isConnected()).toBe(true)
    })

    it("should return provider info", () => {
      const info = provider.getInfo()
      expect(info.name).toBe("CloudShell")
      expect(info.model).toBe("cloudshell")
    })
  })

  describe("createAIProvider factory", () => {
    it("should create Qwen provider", () => {
      const provider = createAIProvider({
        type: "qwen",
        apiKey: "sk-test",
      })
      expect(provider).toBeInstanceOf(QwenAIProvider)
    })

    it("should create Gemini provider", () => {
      const provider = createAIProvider({
        type: "gemini",
        apiKey: "test-key",
      })
      expect(provider).toBeInstanceOf(GeminiAIProvider)
    })

    it("should create Vertex provider", () => {
      const provider = createAIProvider({
        type: "vertex",
        apiKey: "test-key",
        projectId: "test-project",
      })
      expect(provider).toBeInstanceOf(VertexAIProvider)
    })

    it("should create CloudShell provider", () => {
      const provider = createAIProvider({
        type: "cloudshell",
        authToken: "test-token",
      })
      expect(provider).toBeInstanceOf(CloudShellProvider)
    })

    it("should throw error for unknown provider type", () => {
      expect(() =>
        createAIProvider({
          type: "unknown" as any,
        })
      ).toThrow("Unknown AI provider type")
    })
  })
})

// ============================================================================
// Auth Manager Tests
// ============================================================================

describe("AuthManager", () => {
  let authManager: AuthManager
  let mockPlugin: any

  beforeEach(() => {
    mockPlugin = {
      data: {},
      saveData: jest.fn().mockResolvedValue(undefined),
    }
    authManager = new AuthManager(mockPlugin)
  })

  describe("Provider Configuration", () => {
    it("should set provider config", async () => {
      await authManager.setProviderConfig("qwen", {
        apiKey: "sk-test-key",
      })

      const config = authManager.getProviderConfig("qwen")
      expect(config?.apiKey).toBe("sk-test-key")
    })

    it("should get all provider configs without sensitive data", async () => {
      await authManager.setProviderConfig("qwen", {
        apiKey: "sk-test-key",
      })
      await authManager.setProviderConfig("vertex", {
        apiKey: "test-key",
        projectId: "test-project",
      })

      const configs = authManager.getAllProviderConfigs()
      expect(configs.qwen).toBeDefined()
      expect(configs.vertex).toBeDefined()
      expect(configs.qwen.apiKey).toBeUndefined() // Sensitive data excluded
    })

    it("should check if provider is configured", async () => {
      await authManager.setProviderConfig("qwen", {
        apiKey: "sk-test-key",
      })

      expect(authManager.isProviderConfigured("qwen")).toBe(true)
      expect(authManager.isProviderConfigured("gemini")).toBe(false)
    })
  })

  describe("Active Provider", () => {
    it("should set and get active provider", async () => {
      await authManager.setProviderConfig("qwen", {
        apiKey: "sk-test-key",
      })
      await authManager.setActiveProvider("qwen")

      expect(authManager.getActiveProvider()).toBe("qwen")
    })

    it("should throw error setting unconfigured provider as active", async () => {
      await expect(authManager.setActiveProvider("unconfigured")).rejects.toThrow(
        "Provider unconfigured not configured"
      )
    })
  })

  describe("API Key Validation", () => {
    it("should validate Qwen API key format", () => {
      expect(authManager.validateApiKey("qwen", "sk-valid-key")).toBe(true)
      expect(authManager.validateApiKey("qwen", "invalid-key")).toBe(false)
    })

    it("should validate Gemini API key format", () => {
      expect(authManager.validateApiKey("gemini", "abcdefghijklmnopqrst1234567890")).toBe(true)
      expect(authManager.validateApiKey("gemini", "short")).toBe(false)
    })

    it("should validate Vertex API key format", () => {
      expect(authManager.validateApiKey("vertex", "a".repeat(51))).toBe(true)
      expect(authManager.validateApiKey("vertex", "short")).toBe(false)
    })

    it("should validate CloudShell token format", () => {
      expect(authManager.validateApiKey("cloudshell", "header.payload.signature")).toBe(true)
      expect(authManager.validateApiKey("cloudshell", "no-dots")).toBe(false)
    })
  })

  describe("Auth Clearing", () => {
    it("should clear all authentication", async () => {
      await authManager.setProviderConfig("qwen", {
        apiKey: "sk-test-key",
      })
      await authManager.clearAllAuth()

      expect(authManager.getProviderConfig("qwen")).toBeNull()
    })

    it("should clear specific provider auth", async () => {
      await authManager.setProviderConfig("qwen", {
        apiKey: "sk-test-key",
      })
      await authManager.setProviderConfig("gemini", {
        apiKey: "test-key",
      })

      await authManager.clearProviderAuth("qwen")

      expect(authManager.getProviderConfig("qwen")).toBeNull()
      expect(authManager.getProviderConfig("gemini")).toBeDefined()
    })
  })
})

// ============================================================================
// Skill Manager Tests
// ============================================================================

describe("SkillManager", () => {
  let skillManager: SkillManager
  let mockPlugin: any

  beforeEach(() => {
    mockPlugin = {
      data: {},
      saveData: jest.fn().mockResolvedValue(undefined),
      app: {
        vault: {
          getAbstractFileByPath: jest.fn(),
          read: jest.fn(),
        },
      },
    }
    skillManager = new SkillManager(mockPlugin)
  })

  describe("Built-in Skills", () => {
    it("should register docs-writer skill", () => {
      const skill = createDocsWriterSkill()
      skillManager.registerBuiltInSkill(skill)

      const registered = skillManager.getSkill("docs-writer")
      expect(registered).toBeDefined()
      expect(registered?.name).toBe("Documentation Writer")
    })

    it("should register code-review skill", () => {
      const skill = createCodeReviewSkill()
      skillManager.registerBuiltInSkill(skill)

      const registered = skillManager.getSkill("code-review")
      expect(registered).toBeDefined()
      expect(registered?.name).toBe("Code Reviewer")
    })

    it("should register summarize skill", () => {
      const skill = createSummarizeSkill()
      skillManager.registerBuiltInSkill(skill)

      const registered = skillManager.getSkill("summarize")
      expect(registered).toBeDefined()
      expect(registered?.name).toBe("Summarizer")
    })
  })

  describe("Skill Retrieval", () => {
    beforeEach(() => {
      skillManager.registerBuiltInSkill(createDocsWriterSkill())
      skillManager.registerBuiltInSkill(createCodeReviewSkill())
    })

    it("should get skill by ID", () => {
      const skill = skillManager.getSkill("docs-writer")
      expect(skill).toBeDefined()
      expect(skill?.id).toBe("docs-writer")
    })

    it("should get all skills", () => {
      const skills = skillManager.getAllSkills()
      expect(skills.length).toBeGreaterThanOrEqual(2)
    })

    it("should get skill suggestions", () => {
      const suggestions = skillManager.getSkillSuggestions("doc")
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0].id).toBe("docs-writer")
    })
  })

  describe("Skill Execution", () => {
    beforeEach(() => {
      skillManager.registerBuiltInSkill(createDocsWriterSkill())
    })

    it("should execute skill with input", async () => {
      const result = await skillManager.executeSkill("docs-writer", "Test input")
      expect(result).toContain("Documentation Generated")
    })

    it("should execute skill with parameters", async () => {
      const result = await skillManager.executeSkill("docs-writer", "Test", {
        style: "casual",
        language: "th",
      })
      expect(result).toContain("casual")
      expect(result).toContain("th")
    })

    it("should throw error for unknown skill", async () => {
      await expect(skillManager.executeSkill("unknown-skill", "input")).rejects.toThrow(
        "Skill not found"
      )
    })
  })

  describe("Skill Removal", () => {
    beforeEach(() => {
      skillManager.registerBuiltInSkill(createDocsWriterSkill())
    })

    it("should remove skill", async () => {
      await skillManager.removeSkill("docs-writer")
      expect(skillManager.getSkill("docs-writer")).toBeUndefined()
    })
  })
})

// ============================================================================
// Integration Tests
// ============================================================================

describe("Plugin Integration", () => {
  it("should initialize all managers without errors", () => {
    const mockPlugin = {
      data: {},
      saveData: jest.fn().mockResolvedValue(undefined),
      app: {
        vault: {
          getAbstractFileByPath: jest.fn(),
          read: jest.fn(),
        },
      },
    }

    const authManager = new AuthManager(mockPlugin)
    const skillManager = new SkillManager(mockPlugin)

    expect(authManager).toBeDefined()
    expect(skillManager).toBeDefined()
  })

  it("should handle multiple providers simultaneously", async () => {
    const qwenProvider = createAIProvider({
      type: "qwen",
      apiKey: "sk-test",
    })
    const geminiProvider = createAIProvider({
      type: "gemini",
      apiKey: "test-key",
    })

    await qwenProvider.initialize()
    await geminiProvider.initialize()

    expect(qwenProvider.isConnected()).toBe(true)
    expect(geminiProvider.isConnected()).toBe(true)

    await qwenProvider.disconnect()
    await geminiProvider.disconnect()

    expect(qwenProvider.isConnected()).toBe(false)
    expect(geminiProvider.isConnected()).toBe(false)
  })
})
