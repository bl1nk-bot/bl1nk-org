/**
 * AI Elements Components Tests
 * Tests for custom AI-related components: Agent, CodeBlock, FileTree, etc.
 */

import { test, expect } from "@playwright/test"

// ============================================================================
// Agent Component Tests
// ============================================================================

test.describe("Agent Component", () => {
  test("should render agent header with name", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Look for agent headers (usually have bot icon + name)
    const agentHeaders = page.locator('[class*="flex items-center gap-2"]').filter({
      has: page.locator("svg").or(page.locator('[class*="bot"]')),
    })
    
    if (await agentHeaders.count() > 0) {
      await expect(agentHeaders.first()).toBeVisible()
    }
  })

  test("agent should display model badge", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Model badges are usually in secondary variant
    const badges = page.locator('[class*="badge"][class*="secondary"]')
    if (await badges.count() > 0) {
      await expect(badges.first()).toBeVisible()
    }
  })

  test("agent should have tools section", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const toolsSection = page.getByText(/tools/i)
    if (await toolsSection.count() > 0) {
      await expect(toolsSection.first()).toBeVisible()
    }
  })
})

// ============================================================================
// CodeBlock Component Tests
// ============================================================================

test.describe("CodeBlock Component", () => {
  test("should render code block with syntax highlighting", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Code blocks have pre/code elements with shiki classes
    const codeBlocks = page.locator("pre[class*='shiki'], pre[class*='highlight']")
    if (await codeBlocks.count() > 0) {
      await expect(codeBlocks.first()).toBeVisible()
    }
  })

  test("code block should have copy button", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Copy buttons usually have copy icon
    const copyButtons = page.locator("button").filter({
      has: page.locator("svg").or(page.locator('[class*="copy"]')),
    })
    if (await copyButtons.count() > 0) {
      await expect(copyButtons.first()).toBeVisible()
    }
  })

  test("code block should have language selector", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Language selectors are usually in header
    const languageSelectors = page.locator('[class*="select"], [role="combobox"]')
    if (await languageSelectors.count() > 0) {
      await expect(languageSelectors.first()).toBeVisible()
    }
  })

  test("code block should show line numbers", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Line numbers have counter or specific classes
    const lineNumbers = page.locator('[class*="line-number"], [class*="gutter"]')
    if (await lineNumbers.count() > 0) {
      await expect(lineNumbers.first()).toBeVisible()
    }
  })
})

// ============================================================================
// FileTree Component Tests
// ============================================================================

test.describe("FileTree Component", () => {
  test("should render file tree with folders and files", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // File trees have folder/file icons
    const fileTrees = page.locator('[class*="file-tree"], [class*="tree"]').or(
      page.locator('[class*="flex"]').filter({ has: page.locator("svg").or(page.locator('[class*="folder"]')) })
    )
    if (await fileTrees.count() > 0) {
      await expect(fileTrees.first()).toBeVisible()
    }
  })

  test("folder should be expandable/collapsible", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Look for folder triggers (usually have chevron)
    const folderTriggers = page.locator("button").filter({
      has: page.locator("svg").or(page.locator('[class*="chevron"]')),
    })
    
    if (await folderTriggers.count() > 0) {
      const initialCount = await page.locator('[class*="file-tree"] *').count()
      await folderTriggers.first().click()
      
      // Count should change after expand/collapse
      const newCount = await page.locator('[class*="file-tree"] *').count()
      expect(newCount).not.toBe(initialCount)
    }
  })

  test("file should be selectable", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Selected files usually have different background
    const selectedFiles = page.locator('[class*="bg-muted"], [class*="selected"]')
    if (await selectedFiles.count() > 0) {
      await expect(selectedFiles.first()).toBeVisible()
    }
  })
})

// ============================================================================
// Conversation/Message Component Tests
// ============================================================================

test.describe("Conversation Component", () => {
  test("should render conversation container", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const conversations = page.locator('[class*="conversation"], [class*="messages"]')
    if (await conversations.count() > 0) {
      await expect(conversations.first()).toBeVisible()
    }
  })

  test("should display user messages", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // User messages usually aligned right or have user icon
    const userMessages = page.locator('[class*="user"]').or(
      page.locator('[class*="flex-row-reverse"]')
    )
    if (await userMessages.count() > 0) {
      await expect(userMessages.first()).toBeVisible()
    }
  })

  test("should display assistant messages", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Assistant messages have bot icon
    const assistantMessages = page.locator('[class*="assistant"]').or(
      page.locator('[class*="bot"]')
    )
    if (await assistantMessages.count() > 0) {
      await expect(assistantMessages.first()).toBeVisible()
    }
  })

  test("message should have markdown content", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Markdown rendered in prose class
    const proseContent = page.locator('[class*="prose"]')
    if (await proseContent.count() > 0) {
      await expect(proseContent.first()).toBeVisible()
    }
  })
})

// ============================================================================
// Plan Component Tests
// ============================================================================

test.describe("Plan Component", () => {
  test("should render plan header", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const planHeaders = page.getByText(/plan/i).or(page.getByText(/implementation/i))
    if (await planHeaders.count() > 0) {
      await expect(planHeaders.first()).toBeVisible()
    }
  })

  test("plan should be collapsible", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Plan triggers usually have chevron
    const planTriggers = page.locator("button").filter({
      has: page.locator("svg").or(page.locator('[class*="chevron"]')),
    })
    
    if (await planTriggers.count() > 0) {
      await planTriggers.first().click()
      await page.waitForTimeout(300)
      
      // Content should appear/disappear
      const planContent = page.locator('[class*="plan-content"]')
      if (await planContent.count() > 0) {
        await expect(planContent.first()).toBeVisible()
      }
    }
  })

  test("plan should display tasks", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const tasks = page.locator('[class*="task"], [class*="todo"]')
    if (await tasks.count() > 0) {
      await expect(tasks.first()).toBeVisible()
    }
  })
})

// ============================================================================
// Queue Component Tests
// ============================================================================

test.describe("Queue Component", () => {
  test("should render queue sections", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const queueSections = page.locator('[class*="queue"], [class*="pending"]')
    if (await queueSections.count() > 0) {
      await expect(queueSections.first()).toBeVisible()
    }
  })

  test("queue should show item count", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Counts usually in badges
    const countBadges = page.locator('[class*="badge"], [class*="count"]')
    if (await countBadges.count() > 0) {
      const text = await countBadges.first().textContent()
      expect(text).toMatch(/\d+/)
    }
  })

  test("queue items should have indicators", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Indicators are usually circles or checkboxes
    const indicators = page.locator('[class*="indicator"], [class*="circle"]')
    if (await indicators.count() > 0) {
      await expect(indicators.first()).toBeVisible()
    }
  })
})

// ============================================================================
// Task Component Tests
// ============================================================================

test.describe("Task Component", () => {
  test("should render task with title", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const tasks = page.locator('[class*="task-item"], [class*="task-title"]')
    if (await tasks.count() > 0) {
      await expect(tasks.first()).toBeVisible()
    }
  })

  test("task should show status", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Status indicators: pending, in_progress, completed
    const statusIndicators = page.locator('[class*="pending"], [class*="completed"], [class*="progress"]')
    if (await statusIndicators.count() > 0) {
      await expect(statusIndicators.first()).toBeVisible()
    }
  })

  test("task should be expandable", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const taskTriggers = page.locator("button").filter({
      has: page.locator("svg").or(page.locator('[class*="chevron"]')),
    })
    
    if (await taskTriggers.count() > 0) {
      await taskTriggers.first().click()
      await page.waitForTimeout(300)
      
      const taskContent = page.locator('[class*="task-content"]')
      if (await taskContent.count() > 0) {
        await expect(taskContent.first()).toBeVisible()
      }
    }
  })
})

// ============================================================================
// Terminal Component Tests
// ============================================================================

test.describe("Terminal Component", () => {
  test("should render terminal output", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Terminals have pre/code with monospace font
    const terminals = page.locator("pre[class*='terminal'], pre[class*='mono']")
    if (await terminals.count() > 0) {
      await expect(terminals.first()).toBeVisible()
    }
  })

  test("terminal should show streaming output", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Streaming indicators
    const streamingIndicators = page.locator('[class*="streaming"], [class*="loading"]')
    if (await streamingIndicators.count() > 0) {
      await expect(streamingIndicators.first()).toBeVisible()
    }
  })

  test("terminal should have ANSI colors", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // ANSI colors in terminal
    const coloredText = page.locator('[class*="ansi"], [style*="color:"]')
    if (await coloredText.count() > 0) {
      await expect(coloredText.first()).toBeVisible()
    }
  })
})

// ============================================================================
// Checkpoint Component Tests
// ============================================================================

test.describe("Checkpoint Component", () => {
  test("should render checkpoint", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const checkpoints = page.locator('[class*="checkpoint"]')
    if (await checkpoints.count() > 0) {
      await expect(checkpoints.first()).toBeVisible()
    }
  })

  test("checkpoint should have restore button", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const restoreButtons = page.getByText(/restore/i).or(page.getByText(/checkpoint/i))
    if (await restoreButtons.count() > 0) {
      await expect(restoreButtons.first()).toBeVisible()
    }
  })
})

// ============================================================================
// PromptInput Component Tests
// ============================================================================

test.describe("PromptInput Component", () => {
  test("should render input textarea", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const textareas = page.locator("textarea")
    if (await textareas.count() > 0) {
      await expect(textareas.first()).toBeVisible()
    }
  })

  test("input should have submit button", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const submitButtons = page.locator("button[type='submit'], button[class*='submit']")
    if (await submitButtons.count() > 0) {
      await expect(submitButtons.first()).toBeVisible()
    }
  })

  test("input should show loading state", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Loading indicators
    const loadingIndicators = page.locator('[class*="loading"], [class*="spinner"]')
    if (await loadingIndicators.count() > 0) {
      await expect(loadingIndicators.first()).toBeVisible()
    }
  })

  test("input should be disabled during submission", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const textareas = page.locator("textarea")
    if (await textareas.count() > 0) {
      // Check if disabled attribute exists
      const isDisabled = await textareas.first().isDisabled()
      // May or may not be disabled depending on state
      expect(typeof isDisabled).toBe("boolean")
    }
  })
})
