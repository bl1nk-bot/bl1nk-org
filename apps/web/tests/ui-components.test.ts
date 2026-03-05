import { test, expect } from "@playwright/test"
import { injectAxe, checkA11y } from "axe-playwright"

test.describe("UI Components Gallery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/test-gallery")
    await injectAxe(page)
  })

  test("has no accessibility violations", async ({ page }) => {
    await checkA11y(page)
  })

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

  test("Card component should render correctly", async ({ page }) => {
    const section = page.locator("#card-section")
    await expect(section.getByText("Card Title")).toBeVisible()
    await expect(section.getByText("Card Description")).toBeVisible()
    await expect(section.getByText("Card Content")).toBeVisible()
    await expect(section.getByText("Card Footer")).toBeVisible()
  })

  test("Dialog component should open and close", async ({ page }) => {
    const section = page.locator("#dialog-section")
    await section.getByRole("button", { name: "Open Dialog" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByText("Are you absolutely sure?")).toBeVisible()
    // Click close button or press escape
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).not.toBeVisible()
  })

  test("Input component should be interactive", async ({ page }) => {
    const section = page.locator("#input-section")
    const input = section.getByLabel("Email")
    await expect(input).toBeVisible()
    await input.fill("test@example.com")
    await expect(input).toHaveValue("test@example.com")
    await expect(section.getByPlaceholder("Disabled Input")).toBeDisabled()
  })

  test("Skeleton component should render", async ({ page }) => {
    const section = page.locator("#skeleton-section")
    await expect(section.locator(".animate-pulse")).toHaveCount(3)
  })

  test("Sonner (Toast) should show notifications", async ({ page }) => {
    const section = page.locator("#sonner-section")
    await section.getByRole("button", { name: "Default Toast" }).click()
    await expect(page.locator("[data-sonner-toast]").getByText("Event has been created")).toBeVisible()
    
    await section.getByRole("button", { name: "Success Toast" }).click()
    await expect(page.locator("[data-sonner-toast]").getByText("Success!")).toBeVisible()
  })

  test("Tabs component should switch content", async ({ page }) => {
    const section = page.locator("#tabs-section")
    await expect(section.getByText("Make changes to your account here.")).toBeVisible()
    await section.getByRole("tab", { name: "Password" }).click()
    await expect(section.getByText("Change your password here.")).toBeVisible()
  })

  test("Avatar component should render images and fallbacks", async ({ page }) => {
    const section = page.locator("#avatar-section")
    // Wait for image or fallback
    await expect(section.locator("img").or(section.getByText("JD"))).toBeVisible()
  })

  test("Breadcrumb component should render navigation", async ({ page }) => {
    const section = page.locator("#breadcrumb-section")
    await expect(section.getByRole("link", { name: "Home" })).toBeVisible()
    await expect(section.getByRole("link", { name: "Docs" })).toBeVisible()
    await expect(section.getByText("Breadcrumb")).toBeVisible()
  })

  test("ScrollArea component should be visible", async ({ page }) => {
    const section = page.locator("#scroll-area-section")
    await expect(section.locator("div[data-radix-scroll-area-viewport]")).toBeVisible()
  })

  test("Separator component should render dividers", async ({ page }) => {
    const section = page.locator("#separator-section")
    await expect(section.locator('[role="none"]')).toHaveCount(3) // 1 horizontal, 2 vertical
  })

  test("Accordion component should expand and collapse", async ({ page }) => {
    const section = page.locator("#accordion-section")
    await section.getByRole("button", { name: "Is it accessible?" }).click()
    await expect(section.getByText("Yes. It adheres to the WAI-ARIA design pattern.")).toBeVisible()
  })

  test("Alert component should show variants", async ({ page }) => {
    const section = page.locator("#alert-section")
    await expect(section.getByText("Heads up!")).toBeVisible()
    await expect(section.getByText("Error")).toBeVisible()
  })

  test("Badge component should show variants", async ({ page }) => {
    const section = page.locator("#badge-section")
    await expect(section.getByText("Badge", { exact: true })).toBeVisible()
    await expect(section.getByText("Secondary")).toBeVisible()
    await expect(section.getByText("Outline")).toBeVisible()
    await expect(section.getByText("Destructive")).toBeVisible()
  })

  test("Collapsible component should open and close", async ({ page }) => {
    const section = page.locator("#collapsible-section")
    const content = section.getByText("@radix-ui/primitives")
    // It might be hidden but in DOM
    await section.getByRole("button").click()
    await expect(content).toBeVisible()
  })

  test("Command component should show results", async ({ page }) => {
    const section = page.locator("#command-section")
    await expect(section.getByPlaceholder("Type a command or search...")).toBeVisible()
    await expect(section.getByText("Suggestions")).toBeVisible()
    await expect(section.getByText("Calendar")).toBeVisible()
  })

  test("Dropdown Menu should open items", async ({ page }) => {
    const section = page.locator("#dropdown-menu-section")
    await section.getByRole("button", { name: "Open Menu" }).click()
    await expect(page.getByRole("menuitem", { name: "Profile" })).toBeVisible()
  })

  test("Hover Card should show content on hover", async ({ page }) => {
    const section = page.locator("#hover-card-section")
    await section.getByText("@nextjs").hover()
    await expect(page.getByText("The React Framework – created and maintained by @vercel.")).toBeVisible()
  })

  test("Select component should allow selecting options", async ({ page }) => {
    const section = page.locator("#select-section")
    await section.getByRole("combobox").click()
    const option = page.getByRole("option", { name: "Apple" })
    await expect(option).toBeVisible()
    await page.getByRole("option", { name: "Banana" }).click()
    await expect(section.getByText("Banana")).toBeVisible()
  })

  test("Textarea should take input", async ({ page }) => {
    const section = page.locator("#textarea-section")
    const textarea = section.locator("textarea")
    await textarea.fill("Hello World")
    await expect(textarea).toHaveValue("Hello World")
  })

  test("Tooltip should show on hover", async ({ page }) => {
    const section = page.locator("#tooltip-section")
    await section.getByRole("button", { name: "Hover" }).hover()
    // Tooltips are often in portals
    await expect(page.getByRole("tooltip").or(page.getByText("Add to library"))).toBeVisible()
  })

  test("Progress component should render", async ({ page }) => {
    const section = page.locator("#progress-section")
    const progress = section.locator('[role="progressbar"]')
    await expect(progress).toBeVisible()
  })

  test("Input Group should render with icons/buttons", async ({ page }) => {
    const section = page.locator("#input-group-section")
    await expect(section.locator("button").filter({ has: page.locator(".lucide-search") })).toBeVisible()
    await expect(section.locator(".lucide-user")).toBeVisible()
  })

  test("Sidebar should render", async ({ page }) => {
    const section = page.locator("#sidebar-section")
    await expect(section.getByText("Home")).toBeVisible()
    await expect(section.getByText("Inbox")).toBeVisible()
    await expect(section.getByText("Calendar")).toBeVisible()
  })
})
