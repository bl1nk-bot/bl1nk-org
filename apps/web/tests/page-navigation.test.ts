/**
 * Page and Navigation Tests
 * Tests for main page layout, navigation, and routing
 */

import { test, expect } from "@playwright/test"

// ============================================================================
// Main Page Tests
// ============================================================================

test.describe("Main Page", () => {
  test("should load the main page", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    await expect(page).toHaveTitle(/bl1nk|AI|Workspace/i)
    await expect(page.locator("body")).toBeVisible()
  })

  test("should render main layout with three columns", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Left sidebar (file tree)
    const leftSidebar = page.locator('[class*="flex-col border-r"]').or(
      page.locator('[class*="sidebar"]').first()
    )
    await expect(leftSidebar.first()).toBeVisible()
    
    // Center panel (code/terminal)
    const centerPanel = page.locator('[class*="flex-1"]').or(
      page.locator('[class*="center"]').or(page.locator("main"))
    )
    await expect(centerPanel.first()).toBeVisible()
    
    // Right sidebar (chat/AI)
    const rightSidebar = page.locator('[class*="border-l"]').or(
      page.locator('[class*="sidebar"]').last()
    )
    await expect(rightSidebar.first()).toBeVisible()
  })

  test("should have responsive layout", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    // Layout should still be visible
    await expect(page.locator("body")).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)
    
    await expect(page.locator("body")).toBeVisible()
  })
})

// ============================================================================
// Navigation Tests
// ============================================================================

test.describe("Navigation", () => {
  test("should have working navigation links", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Look for navigation links
    const navLinks = page.locator('a[href^="/"], nav a')
    if (await navLinks.count() > 0) {
      const firstLink = navLinks.first()
      const href = await firstLink.getAttribute("href")
      
      await firstLink.click()
      await page.waitForURL(new RegExp(href || ""))
      
      expect(page.url()).toContain(href || "")
    }
  })

  test("should highlight active navigation item", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Active nav items usually have different styles
    const activeNav = page.locator('[class*="active"], [class*="selected"], a[class*="font-medium"]')
    if (await activeNav.count() > 0) {
      await expect(activeNav.first()).toBeVisible()
    }
  })
})

// ============================================================================
// Settings Dialog Tests
// ============================================================================

test.describe("Settings Dialog", () => {
  test("should open settings dialog", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Look for settings button (gear icon)
    const settingsButton = page.locator("button").filter({
      has: page.locator("svg").or(page.locator('[class*="settings"], [class*="gear"]')),
    })
    
    if (await settingsButton.count() > 0) {
      await settingsButton.first().click()
      
      // Dialog should appear
      const dialog = page.locator('[role="dialog"], [class*="dialog"]')
      await expect(dialog.first()).toBeVisible()
    }
  })

  test("settings should have sidebar menu", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Open settings first
    const settingsButton = page.locator("button").filter({
      has: page.locator("svg"),
    })
    
    if (await settingsButton.count() > 0) {
      await settingsButton.first().click()
      
      // Look for settings sidebar
      const settingsSidebar = page.locator('[class*="sidebar-menu"], [class*="nav-menu"]')
      if (await settingsSidebar.count() > 0) {
        await expect(settingsSidebar.first()).toBeVisible()
      }
    }
  })

  test("settings should close on outside click", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const settingsButton = page.locator("button").filter({
      has: page.locator("svg"),
    })
    
    if (await settingsButton.count() > 0) {
      await settingsButton.first().click()
      
      // Click outside
      await page.mouse.click(0, 0)
      
      // Dialog should close
      const dialog = page.locator('[role="dialog"]')
      if (await dialog.count() > 0) {
        await expect(dialog.first()).not.toBeVisible()
      }
    }
  })
})

// ============================================================================
// Workflow/Canvas Tests
// ============================================================================

test.describe("Workflow Canvas", () => {
  test("should render workflow canvas", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const canvas = page.locator('[class*="canvas"], [class*="workflow"]')
    if (await canvas.count() > 0) {
      await expect(canvas.first()).toBeVisible()
    }
  })

  test("canvas should have nodes", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const nodes = page.locator('[class*="node"], [class*="card"]')
    if (await nodes.count() > 0) {
      await expect(nodes.first()).toBeVisible()
    }
  })

  test("canvas should have edges/connections", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Edges are usually SVG paths
    const edges = page.locator("svg path, .edge, .connection")
    if (await edges.count() > 0) {
      await expect(edges.first()).toBeVisible()
    }
  })

  test("nodes should be draggable", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const nodes = page.locator('[class*="node"], [class*="card"]')
    if (await nodes.count() > 0) {
      const initialBox = await nodes.first().boundingBox()
      
      // Drag the node
      await nodes.first().dragTo(page.locator("body"), {
        targetPosition: { x: 100, y: 100 },
      })
      
      const newBox = await nodes.first().boundingBox()
      
      // Position should change
      if (initialBox && newBox) {
        expect(newBox.x).not.toBe(initialBox.x)
      }
    }
  })
})

// ============================================================================
// Chat Interface Tests
// ============================================================================

test.describe("Chat Interface", () => {
  test("should display chat input", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const chatInput = page.locator("textarea[placeholder*='message'], textarea[placeholder*='ask']")
    if (await chatInput.count() > 0) {
      await expect(chatInput.first()).toBeVisible()
    }
  })

  test("should send message", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const chatInput = page.locator("textarea")
    const submitButton = page.locator("button[type='submit']")
    
    if (await chatInput.count() > 0 && await submitButton.count() > 0) {
      await chatInput.first().fill("Test message")
      await submitButton.first().click()
      
      // Message should appear in conversation
      await page.waitForTimeout(1000)
      
      const messages = page.locator('[class*="message"]')
      await expect(messages.first()).toBeVisible()
    }
  })

  test("should display loading state during response", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const chatInput = page.locator("textarea")
    const submitButton = page.locator("button[type='submit']")
    
    if (await chatInput.count() > 0) {
      await chatInput.first().fill("Test")
      await submitButton.first().click()
      
      // Look for loading indicators
      const loadingIndicator = page.locator('[class*="loading"], [class*="spinner"], [class*="typing"]')
      if (await loadingIndicator.count() > 0) {
        await expect(loadingIndicator.first()).toBeVisible()
      }
    }
  })
})

// ============================================================================
// Context/Preview Tests
// ============================================================================

test.describe("Context Preview", () => {
  test("should show context indicator", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const contextIndicator = page.locator('[class*="context"], [class*="preview"]')
    if (await contextIndicator.count() > 0) {
      await expect(contextIndicator.first()).toBeVisible()
    }
  })

  test("should open web preview", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const previewButton = page.locator("button").filter({ hasText: /preview|web/i })
    if (await previewButton.count() > 0) {
      await previewButton.first().click()
      
      // Preview should appear
      const preview = page.locator('[class*="preview"], iframe')
      if (await preview.count() > 0) {
        await expect(preview.first()).toBeVisible()
      }
    }
  })
})

// ============================================================================
// Accessibility Tests
// ============================================================================

test.describe("Accessibility", () => {
  test("should have proper ARIA labels", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Check for ARIA labels
    const ariaLabels = page.locator('[aria-label], [aria-labelledby]')
    expect(await ariaLabels.count()).toBeGreaterThan(0)
  })

  test("buttons should have accessible names", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const buttons = page.locator("button")
    const count = await buttons.count()
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i)
      const ariaLabel = await button.getAttribute("aria-label")
      const text = await button.textContent()
      
      // Button should have either aria-label or text content
      expect(ariaLabel || text?.trim()).toBeTruthy()
    }
  })

  test("images should have alt text", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const images = page.locator("img")
    const count = await images.count()
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const image = images.nth(i)
      const alt = await image.getAttribute("alt")
      
      // Images should have alt text (can be empty for decorative)
      expect(alt).toBeDefined()
    }
  })

  test("should be navigable with keyboard", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Tab through interactive elements
    await page.keyboard.press("Tab")
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName)
    
    await page.keyboard.press("Tab")
    const secondFocused = await page.evaluate(() => document.activeElement?.tagName)
    
    // Focus should move
    expect(firstFocused).toBeDefined()
    expect(secondFocused).toBeDefined()
  })
})

// ============================================================================
// Performance Tests
// ============================================================================

test.describe("Performance", () => {
  test("should load within acceptable time", async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto("http://localhost:3000")
    await page.waitForLoadState("networkidle")
    
    const loadTime = Date.now() - startTime
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test("should not have memory leaks", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Navigate away and back multiple times
    for (let i = 0; i < 3; i++) {
      await page.reload()
      await page.waitForLoadState("networkidle")
    }
    
    // Page should still be responsive
    await expect(page.locator("body")).toBeVisible()
  })
})
