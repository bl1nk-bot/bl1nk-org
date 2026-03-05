import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test.describe("AI Elements Gallery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/test-gallery")
  })

  test("Agent component should render header and info", async ({ page }) => {
    const section = page.locator("#agent-section")
    await expect(section.getByText("Bl1nk Agent")).toBeVisible()
    await expect(section.getByText("gpt-4o")).toBeVisible()
    await expect(section.getByText("Agent components rendered here.")).toBeVisible()
  })

  test("CodeBlock component should render code", async ({ page }) => {
    const section = page.locator("#codeblock-section")
    await expect(section.locator("pre")).toBeVisible()
    await expect(section.getByText("console.log")).toBeVisible()
  })

  test("Checkpoint component should show status and trigger", async ({ page }) => {
    const section = page.locator("#checkpoint-section")
    await expect(section.getByText("Checkpoint saved")).toBeVisible()
    const trigger = section.getByRole("button", { name: "Checkpoint saved" })
    await expect(trigger).toHaveAttribute("title", "2 minutes ago")
  })

  test("Conversation & Message components should render correctly", async ({ page }) => {
    const section = page.locator("#conversation-section")
    await expect(section.getByText("Hello, how can you help me?")).toBeVisible()
    await expect(section.getByText("I can help you with your code!")).toBeVisible()
  })

  test("FileTree component should show folders and files", async ({ page }) => {
    const section = page.locator("#filetree-section")
    await expect(section.getByText("src")).toBeVisible()
    // It might need expansion or be visible by default
    await expect(section.getByText("index.ts").or(section.getByText("package.json"))).toBeVisible()
  })

  test("Plan & Task components should render and expand", async ({ page }) => {
    const section = page.locator("#plan-section")
    await expect(section.getByText("Deployment Plan")).toBeVisible()
    await expect(section.getByText("Prepare infrastructure")).toBeVisible()
    await expect(section.getByText("Setting up servers and database.")).toBeVisible()
  })

  test("Queue component should render items and labels", async ({ page }) => {
    const section = page.locator("#queue-section")
    await expect(section.getByText("In Progress")).toBeVisible()
    await expect(section.getByText("Deploying to production")).toBeVisible()
  })

  test("Terminal component should show output", async ({ page }) => {
    const section = page.locator("#terminal-section")
    // Use part of the text to be safe with ANSI codes
    await expect(section.getByText("npm run build")).toBeVisible()
    await expect(section.getByText("Done!")).toBeVisible()
  })

  test("PromptInput component should be interactive", async ({ page }) => {
    const section = page.locator("#promptinput-section")
    const textarea = section.locator("textarea")
    await textarea.fill("What is the meaning of life?")
    await expect(textarea).toHaveValue("What is the meaning of life?")
    await expect(section.getByRole("button")).toBeVisible()
  })

  test("Canvas component should render drawing area", async ({ page }) => {
    const section = page.locator("#canvas-section")
    await expect(section).toBeVisible()
    await expect(section.getByText("Canvas")).toBeVisible()
    
    // Assert canvas element is visible
    const canvas = section.locator("canvas, [class*='canvas']")
    await expect(canvas.first()).toBeVisible()
    
    // Assert example text is present
    await expect(section.getByText("Canvas area for workflow")).toBeVisible()
  })

  test("Edge component should render connection", async ({ page }) => {
    const section = page.locator("#edge-section")
    await expect(section).toBeVisible()
    await expect(section.getByText("Edge")).toBeVisible()
    
    // Assert edge label/connection text is visible
    await expect(section.getByText("Edge connection")).toBeVisible()
    
    // Assert SVG edge element exists
    const edge = section.locator("svg, [class*='edge']")
    await expect(edge.first()).toBeVisible()
  })

  test("Node component should render node with title and content", async ({ page }) => {
    const section = page.locator("#node-section")
    await expect(section).toBeVisible()
    await expect(section.getByText("Node")).toBeVisible()
    
    // Assert node title is visible
    await expect(section.getByText("Process Data")).toBeVisible()
    
    // Assert node content is visible
    await expect(section.getByText("Transform and validate")).toBeVisible()
    
    // Assert node has child controls
    const node = section.locator("[class*='node'], [class*='card']")
    await expect(node.first()).toBeVisible()
  })

  test("should not have accessibility violations on AI elements", async ({ page }) => {
    // Test agent section
    const agentResults = await new AxeBuilder({ page })
      .include("#agent-section")
      .analyze()
    expect(agentResults.violations).toEqual([])

    // Test codeblock section
    const codeblockResults = await new AxeBuilder({ page })
      .include("#codeblock-section")
      .analyze()
    expect(codeblockResults.violations).toEqual([])

    // Test button section (icon-only buttons with aria-labels)
    const buttonResults = await new AxeBuilder({ page })
      .include("#button-section")
      .analyze()
    expect(buttonResults.violations).toEqual([])
  })

  test("should not have accessibility violations on forms and inputs", async ({ page }) => {
    // Test input section
    const inputResults = await new AxeBuilder({ page })
      .include("#input-section")
      .analyze()
    expect(inputResults.violations).toEqual([])

    // Test promptinput section
    const promptInputResults = await new AxeBuilder({ page })
      .include("#promptinput-section")
      .analyze()
    expect(promptInputResults.violations).toEqual([])
  })

  test("should not have accessibility violations on navigation components", async ({ page }) => {
    // Test breadcrumb section
    const breadcrumbResults = await new AxeBuilder({ page })
      .include("#breadcrumb-section")
      .analyze()
    expect(breadcrumbResults.violations).toEqual([])

    // Test tabs section
    const tabsResults = await new AxeBuilder({ page })
      .include("#tabs-section")
      .analyze()
    expect(tabsResults.violations).toEqual([])
  })
})
