/**
 * UI Components Gallery Tests
 *
 * Tests for shadcn/ui components in the test gallery.
 * Validates rendering, interactivity, and visual appearance.
 *
 * @module ui-components-test
 */

import { test, expect } from "@playwright/test"

/**
 * UI Components Gallery Test Suite
 *
 * Tests all UI components for:
 * - Visual rendering
 * - Interactive behavior
 * - Accessibility features
 */
test.describe("UI Components Gallery", () => {
  /**
   * Navigate to test gallery before each test
   */
  test.beforeEach(async ({ page }) => {
    await page.goto("/test-gallery")
  })

  /**
   * Test: Button component variants and sizes
   * Verifies all button variants (default, secondary, destructive, outline, ghost, link)
   * and sizes (sm, default, lg, icon)
   */
  test("Button component should render all variants and sizes", async ({ page }) => {
    const section = page.locator("#button-section")
    await expect(section.getByRole("button", { name: "Default" })).toBeVisible()
    await expect(section.getByRole("button", { name: "Secondary" })).toBeVisible()
    await expect(section.getByRole("button", { name: "Destructive" })).toBeVisible()
    await expect(section.getByRole("button", { name: "Outline" })).toBeVisible()
    await expect(section.getByRole("button", { name: "Ghost" })).toBeVisible()
    await expect(section.getByRole("button", { name: "Link" })).toBeVisible()
    await expect(section.getByRole("button", { name: "Small" })).toBeVisible()
    await expect(section.getByRole("button", { name: "Large" })).toBeVisible()
    await expect(section.locator("button").filter({ has: page.locator("svg") })).toBeVisible()
    await expect(section.getByRole("button", { name: "Loading" })).toBeDisabled()
  })

  /**
   * Test: Card component structure
   * Verifies card header, content, and footer rendering
   */
  test("Card component should render correctly", async ({ page }) => {
    const section = page.locator("#card-section")
    await expect(section.getByText("Card Title")).toBeVisible()
    await expect(section.getByText("Card Description")).toBeVisible()
    await expect(section.getByText("Card Content")).toBeVisible()
    await expect(section.getByText("Card Footer")).toBeVisible()
  })

  /**
   * Test: Dialog component interaction
   * Verifies dialog opens on trigger and closes on escape
   */
  test("Dialog component should open and close", async ({ page }) => {
    const section = page.locator("#dialog-section")
    await section.getByRole("button", { name: "Open Dialog" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByText("Are you absolutely sure?")).toBeVisible()
    // Click close button or press escape
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).not.toBeVisible()
  })

  /**
   * Test: Input component interactivity
   * Verifies input field with label and disabled state
   */
  test("Input component should be interactive", async ({ page }) => {
    const section = page.locator("#input-section")
    const input = section.getByLabel("Email")
    await expect(input).toBeVisible()
    await input.fill("test@example.com")
    await expect(input).toHaveValue("test@example.com")
    await expect(section.getByPlaceholder("Disabled Input")).toBeDisabled()
  })

  /**
   * Test: Skeleton component loading state
   * Verifies skeleton animation placeholders render
   */
  test("Skeleton component should render", async ({ page }) => {
    const section = page.locator("#skeleton-section")
    await expect(section.locator(".animate-pulse")).toHaveCount(3)
  })

  /**
   * Test: Sonner (Toast) notifications
   * Verifies toast notifications display correctly
   */
  test("Sonner (Toast) should show notifications", async ({ page }) => {
    const section = page.locator("#sonner-section")
    await section.getByRole("button", { name: "Default Toast" }).click()
    await expect(page.locator("[data-sonner-toast]").getByText("Event has been created")).toBeVisible()

    await section.getByRole("button", { name: "Success Toast" }).click()
    await expect(page.locator("[data-sonner-toast]").getByText("Success!")).toBeVisible()
  })

  /**
   * Test: Tabs component switching
   * Verifies tab content switches on selection
   */
  test("Tabs component should switch content", async ({ page }) => {
    const section = page.locator("#tabs-section")
    await expect(section.getByText("Make changes to your account here.")).toBeVisible()
    await section.getByRole("tab", { name: "Password" }).click()
    await expect(section.getByText("Change your password here.")).toBeVisible()
  })

  /**
   * Test: Avatar component images and fallbacks
   * Verifies avatar displays image or fallback initials
   */
  test("Avatar component should render images and fallbacks", async ({ page }) => {
    const section = page.locator("#avatar-section")
    // Wait for image or fallback
    await expect(section.locator("img").or(section.getByText("JD"))).toBeVisible()
  })

  /**
   * Test: Breadcrumb component navigation
   * Verifies breadcrumb links and separators render
   */
  test("Breadcrumb component should render navigation", async ({ page }) => {
    const section = page.locator("#breadcrumb-section")
    await expect(section.getByRole("link", { name: "Home" })).toBeVisible()
    await expect(section.getByRole("link", { name: "Docs" })).toBeVisible()
    await expect(section.getByText("Breadcrumb")).toBeVisible()
  })

  /**
   * Test: ScrollArea component viewport
   * Verifies scrollable area with custom scrollbar
   */
  test("ScrollArea component should be visible", async ({ page }) => {
    const section = page.locator("#scroll-area-section")
    await expect(section.locator("div[data-radix-scroll-area-viewport]")).toBeVisible()
  })

  /**
   * Test: Separator component dividers
   * Verifies horizontal and vertical separators render
   */
  test("Separator component should render dividers", async ({ page }) => {
    const section = page.locator("#separator-section")
    await expect(section.locator('[role="none"]')).toHaveCount(3) // 1 horizontal, 2 vertical
  })

  /**
   * Test: Accordion component expansion
   * Verifies accordion expands and collapses content
   */
  test("Accordion component should expand and collapse", async ({ page }) => {
    const section = page.locator("#accordion-section")
    await section.getByRole("button", { name: "Is it accessible?" }).click()
    await expect(section.getByText("Yes. It adheres to the WAI-ARIA design pattern.")).toBeVisible()
  })

  /**
   * Test: Alert component variants
   * Verifies default and destructive alert styles
   */
  test("Alert component should show variants", async ({ page }) => {
    const section = page.locator("#alert-section")
    await expect(section.getByText("Heads up!")).toBeVisible()
    await expect(section.getByText("Error")).toBeVisible()
  })

  /**
   * Test: Badge component variants
   * Verifies all badge style variants render
   */
  test("Badge component should show variants", async ({ page }) => {
    const section = page.locator("#badge-section")
    await expect(section.getByText("Badge", { exact: true })).toBeVisible()
    await expect(section.getByText("Secondary")).toBeVisible()
    await expect(section.getByText("Outline")).toBeVisible()
    await expect(section.getByText("Destructive")).toBeVisible()
  })

  /**
   * Test: Collapsible component toggle
   * Verifies collapsible content shows/hides on trigger
   */
  test("Collapsible component should open and close", async ({ page }) => {
    const section = page.locator("#collapsible-section")
    const content = section.getByText("@radix-ui/primitives")
    // It might be hidden but in DOM
    await section.getByRole("button").click()
    await expect(content).toBeVisible()
  })

  /**
   * Test: Command component search
   * Verifies command input and suggestion list
   */
  test("Command component should show results", async ({ page }) => {
    const section = page.locator("#command-section")
    await expect(section.getByPlaceholder("Type a command or search...")).toBeVisible()
    await expect(section.getByText("Suggestions")).toBeVisible()
    await expect(section.getByText("Calendar")).toBeVisible()
  })

  /**
   * Test: Dropdown Menu interaction
   * Verifies menu opens and displays items
   */
  test("Dropdown Menu should open items", async ({ page }) => {
    const section = page.locator("#dropdown-menu-section")
    await section.getByRole("button", { name: "Open Menu" }).click()
    await expect(page.getByRole("menuitem", { name: "Profile" })).toBeVisible()
  })

  /**
   * Test: Hover Card interaction
   * Verifies card shows content on hover
   */
  test("Hover Card should show content on hover", async ({ page }) => {
    const section = page.locator("#hover-card-section")
    await section.getByText("@nextjs").hover()
    await expect(page.getByText("The React Framework – created and maintained by @vercel.")).toBeVisible()
  })

  /**
   * Test: Select component options
   * Verifies select dropdown with options
   */
  test("Select component should allow selecting options", async ({ page }) => {
    const section = page.locator("#select-section")
    await section.getByRole("combobox").click()
    const option = page.getByRole("option", { name: "Apple" })
    await expect(option).toBeVisible()
    await page.getByRole("option", { name: "Banana" }).click()
    await expect(section.getByText("Banana")).toBeVisible()
  })

  /**
   * Test: Textarea component input
   * Verifies textarea accepts multi-line input
   */
  test("Textarea should take input", async ({ page }) => {
    const section = page.locator("#textarea-section")
    const textarea = section.locator("textarea")
    await textarea.fill("Hello World")
    await expect(textarea).toHaveValue("Hello World")
  })

  /**
   * Test: Tooltip component hover
   * Verifies tooltip shows on hover
   */
  test("Tooltip should show on hover", async ({ page }) => {
    const section = page.locator("#tooltip-section")
    await section.getByRole("button", { name: "Hover" }).hover()
    // Tooltips are often in portals
    await expect(page.getByRole("tooltip").or(page.getByText("Add to library"))).toBeVisible()
  })

  /**
   * Test: Progress component visualization
   * Verifies progress bar renders with value
   */
  test("Progress component should render", async ({ page }) => {
    const section = page.locator("#progress-section")
    const progress = section.locator('[role="progressbar"]')
    await expect(progress).toBeVisible()
  })

  /**
   * Test: Input Group with icons/buttons
   * Verifies input group with addon icons and buttons
   */
  test("Input Group should render with icons/buttons", async ({ page }) => {
    const section = page.locator("#input-group-section")
    await expect(section.locator("button").filter({ has: page.locator(".lucide-search") })).toBeVisible()
    await expect(section.locator(".lucide-user")).toBeVisible()
  })

  /**
   * Test: Sidebar component navigation
   * Verifies sidebar menu items render
   */
  test("Sidebar should render", async ({ page }) => {
    const section = page.locator("#sidebar-section")
    await expect(section.getByText("Home")).toBeVisible()
    await expect(section.getByText("Inbox")).toBeVisible()
    await expect(section.getByText("Calendar")).toBeVisible()
  })
})
