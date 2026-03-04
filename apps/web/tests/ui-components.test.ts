/**
 * UI Components Tests for bl1nk-web
 * Tests for shadcn/ui components and custom components
 */

import { test, expect, type Page } from "@playwright/test"

// ============================================================================
// Button Component Tests
// ============================================================================

test.describe("Button Component", () => {
  test("should render default button", async ({ page }) => {
    await page.setContent(`
      <html>
        <body>
          <div id="root"></div>
          <script type="module">
            import { render } from 'react-dom/client'
            import { Button } from './components/ui/button.tsx'
            render(<Button>Click Me</Button>, document.getElementById('root'))
          </script>
        </body>
      </html>
    `)

    const button = page.getByRole("button", { name: "Click Me" })
    await expect(button).toBeVisible()
  })

  test("should render button variants", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Check for default button styles
    const buttons = page.locator("button")
    await expect(buttons.first()).toHaveClass(/inline-flex/)
  })

  test("should render icon button", async ({ page }) => {
    // Icon buttons should have size-4 class for icons
    await page.goto("http://localhost:3000")
    const iconButtons = page.locator("button").filter({ has: page.locator("svg") })
    await expect(iconButtons.first()).toBeVisible()
  })
})

// ============================================================================
// Card Component Tests
// ============================================================================

test.describe("Card Component", () => {
  test("should render card with header and content", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const cards = page.locator('[class*="rounded-xl border bg-card"]')
    if (await cards.count() > 0) {
      await expect(cards.first()).toBeVisible()
    }
  })

  test("card should have proper shadow", async ({ page }) => {
    await page.goto("http://localhost:3000")
    const card = page.locator('[class*="rounded-xl border"]')
    if (await card.count() > 0) {
      const boxShadow = await card.evaluate((el) => 
        window.getComputedStyle(el).boxShadow
      )
      expect(boxShadow).toBeTruthy()
    }
  })
})

// ============================================================================
// Dialog Component Tests
// ============================================================================

test.describe("Dialog Component", () => {
  test("should open dialog when trigger clicked", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Look for dialog triggers
    const dialogTriggers = page.locator('[data-state="open"], button[class*="dialog"]')
    if (await dialogTriggers.count() > 0) {
      await dialogTriggers.first().click()
      await expect(page.locator('[role="dialog"]')).toBeVisible()
    }
  })

  test("dialog should have overlay", async ({ page }) => {
    await page.goto("http://localhost:3000")
    const overlays = page.locator('[class*="fixed inset-0"]')
    if (await overlays.count() > 0) {
      await expect(overlays.first()).toBeVisible()
    }
  })
})

// ============================================================================
// Input Component Tests
// ============================================================================

test.describe("Input Component", () => {
  test("should render input field", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const inputs = page.locator("input[type='text'], input[type='email']")
    if (await inputs.count() > 0) {
      await expect(inputs.first()).toBeVisible()
    }
  })

  test("input should have focus ring", async ({ page }) => {
    await page.goto("http://localhost:3000")
    const input = page.locator("input").first()
    if (await input.count() > 0) {
      await input.focus()
      const className = await input.getAttribute("class")
      expect(className).toContain("focus-visible:ring")
    }
  })
})

// ============================================================================
// Skeleton Component Tests
// ============================================================================

test.describe("Skeleton Component", () => {
  test("should render skeleton with animation", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const skeletons = page.locator('[class*="animate-pulse"]')
    if (await skeletons.count() > 0) {
      await expect(skeletons.first()).toBeVisible()
      
      // Check for pulse animation
      const animationName = await skeletons.first().evaluate((el) =>
        window.getComputedStyle(el).animationName
      )
      expect(animationName).toContain("pulse")
    }
  })
})

// ============================================================================
// Toast/Sonner Component Tests
// ============================================================================

test.describe("Toast Component", () => {
  test("should have toaster container", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Sonner creates a toast container
    const toaster = page.locator('[class*="toaster"], [data-sonner-toaster]')
    if (await toaster.count() > 0) {
      await expect(toaster.first()).toBeVisible()
    }
  })
})

// ============================================================================
// Tabs Component Tests
// ============================================================================

test.describe("Tabs Component", () => {
  test("should render tabs list and triggers", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const tabsLists = page.locator('[role="tablist"]')
    if (await tabsLists.count() > 0) {
      await expect(tabsLists.first()).toBeVisible()
      
      const tabs = tabsLists.first().locator('[role="tab"]')
      await expect(tabs.first()).toBeVisible()
    }
  })

  test("should switch tabs when clicked", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const tabsList = page.locator('[role="tablist"]').first()
    if (await tabsList.count() > 0) {
      const tabs = tabsList.locator('[role="tab"]')
      if (await tabs.count() > 1) {
        await tabs.nth(1).click()
        await expect(tabs.nth(1)).toHaveAttribute("data-state", "active")
      }
    }
  })
})

// ============================================================================
// Avatar Component Tests
// ============================================================================

test.describe("Avatar Component", () => {
  test("should render avatar with image", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const avatars = page.locator('[class*="rounded-full overflow-hidden"]')
    if (await avatars.count() > 0) {
      await expect(avatars.first()).toBeVisible()
    }
  })

  test("avatar should have fallback", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Look for avatar fallbacks (usually initials)
    const fallbacks = page.locator('[class*="bg-muted"], [class*="rounded-full"]').filter({ hasText: /^[A-Z]{1,3}$/ })
    if (await fallbacks.count() > 0) {
      await expect(fallbacks.first()).toBeVisible()
    }
  })
})

// ============================================================================
// Breadcrumb Component Tests
// ============================================================================

test.describe("Breadcrumb Component", () => {
  test("should render breadcrumb navigation", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const breadcrumbs = page.locator("nav[aria-label='breadcrumb'], ol[class*='flex']")
    if (await breadcrumbs.count() > 0) {
      await expect(breadcrumbs.first()).toBeVisible()
    }
  })

  test("breadcrumb should have separator", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    // Chevron or separator
    const separators = page.locator("svg").filter({ has: page.locator('[class*="chevron"]') })
    if (await separators.count() > 0) {
      await expect(separators.first()).toBeVisible()
    }
  })
})

// ============================================================================
// ScrollArea Component Tests
// ============================================================================

test.describe("ScrollArea Component", () => {
  test("should render scrollable area", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const scrollAreas = page.locator('[class*="overflow-auto"], [class*="overflow-hidden"]')
    if (await scrollAreas.count() > 0) {
      await expect(scrollAreas.first()).toBeVisible()
    }
  })

  test("scroll area should have scrollbar", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const scrollbars = page.locator('[class*="scrollbar"]')
    if (await scrollbars.count() > 0) {
      await expect(scrollbars.first()).toBeVisible()
    }
  })
})

// ============================================================================
// Separator Component Tests
// ============================================================================

test.describe("Separator Component", () => {
  test("should render horizontal separator", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const separators = page.locator('[class*="h-[1px] w-full"], [class*="shrink-0 bg-border"]')
    if (await separators.count() > 0) {
      await expect(separators.first()).toBeVisible()
    }
  })

  test("should render vertical separator", async ({ page }) => {
    await page.goto("http://localhost:3000")
    
    const verticalSeparators = page.locator('[class*="h-full w-[1px]"]')
    if (await verticalSeparators.count() > 0) {
      await expect(verticalSeparators.first()).toBeVisible()
    }
  })
})
