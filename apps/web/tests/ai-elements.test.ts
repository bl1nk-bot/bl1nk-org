import { test, expect } from "@playwright/test"

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
    await section.getByRole("button").hover()
    // Tooltip might be in portal
    await expect(page.getByRole("tooltip").or(page.getByText("2 minutes ago"))).toBeVisible()
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
})
