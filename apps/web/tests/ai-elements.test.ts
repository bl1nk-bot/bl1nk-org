import { test, expect } from "@playwright/test"

test.describe("AI Elements Gallery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/test-gallery")
  })

  test("Agent component should render header and info", async ({ page }) => {
    const section = page.locator("#agent-section")
    await expect(section.getByText("Bl1nk Agent")).toBeVisible()
    await expect(section.getByText("gpt-4o")).toBeVisible()
    // Ensure actual text present in Agent card is matched
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
    
    // CheckpointTrigger renders a title attribute rather than a tooltip element
    const trigger = section.getByRole("button")
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
    await expect(section.getByText("Interactive Canvas Workspace")).toBeVisible()
    // Verify nodes inside canvas
    await expect(section.getByText("Source Node")).toBeVisible()
    await expect(section.getByText("Process Node")).toBeVisible()
  })

  test("Edge component should render connection", async ({ page }) => {
    const section = page.locator("#edge-section")
    await expect(section.getByText("Static Edge")).toBeVisible()
    await expect(section.getByText("Animated Edge")).toBeVisible()
    await expect(section.getByText("Connection Text")).toBeVisible()
    // Verify SVG path for edge
    await expect(section.locator("svg path").first()).toBeVisible()
  })

  test("Node component should render title and contents", async ({ page }) => {
    const section = page.locator("#node-section")
    await expect(section.getByText("Node Header Title")).toBeVisible()
    await expect(section.getByText("Node Content details and child controls.")).toBeVisible()
    await expect(section.getByText("Node Footer Description")).toBeVisible()
  })
})
