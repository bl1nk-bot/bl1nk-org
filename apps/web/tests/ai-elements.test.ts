/**
 * AI Elements Gallery Tests
 *
 * Tests for AI-related components in the test gallery.
 * Validates rendering, interactivity, and accessibility compliance.
 *
 * @module ai-elements-test
 */

import { expect, test } from "./fixtures"

/**
 * AI Elements Gallery Test Suite
 *
 * Tests all AI element components for:
 * - Visual rendering
 * - Interactive behavior
 * - Accessibility (WCAG compliance via axe-core)
 */
test.describe("AI Elements Gallery", () => {
  /**
   * Navigate to test gallery before each test
   */
  test.beforeEach(async ({ page }) => {
    await page.goto("/test-gallery")
  })

  /**
   * Test: Agent component rendering
   * Verifies agent header, model info, and description display
   */
  test("Agent component should render header and info", async ({ page }) => {
    const section = page.locator("#agent-section")
    await expect(section.getByText("Bl1nk Agent")).toBeVisible()
    await expect(section.getByText("gpt-4o")).toBeVisible()
    await expect(section.getByText("Agent components rendered here.")).toBeVisible()
  })

  /**
   * Test: CodeBlock component rendering
   * Verifies code display with syntax highlighting
   */
  test("CodeBlock component should render code", async ({ page }) => {
    const section = page.locator("#codeblock-section")
    await expect(section.locator("pre")).toBeVisible()
    await expect(section.getByText("console.log")).toBeVisible()
  })

  /**
   * Test: Checkpoint component status display
   * Verifies checkpoint saved status and restore trigger with tooltip
   */
  test("Checkpoint component should show status and trigger", async ({ page }) => {
    const section = page.locator("#checkpoint-section")
    await expect(section.getByText("Checkpoint saved")).toBeVisible()
    const trigger = section.getByRole("button", { name: "Checkpoint saved" })
    await expect(trigger).toHaveAttribute("title", "2 minutes ago")
  })

  /**
   * Test: Conversation and Message components
   * Verifies conversation flow with user and assistant messages
   */
  test("Conversation & Message components should render correctly", async ({ page }) => {
    const section = page.locator("#conversation-section")
    await expect(section.getByText("Hello, how can you help me?")).toBeVisible()
    await expect(section.getByText("I can help you with your code!")).toBeVisible()
  })

  /**
   * Test: FileTree component structure
   * Verifies folder hierarchy and file display
   */
  test("FileTree component should show folders and files", async ({ page }) => {
    const section = page.locator("#filetree-section")
    await expect(section.getByText("src")).toBeVisible()
    // It might need expansion or be visible by default
    await expect(section.getByText("index.ts").or(section.getByText("package.json"))).toBeVisible()
  })

  /**
   * Test: Plan and Task components
   * Verifies deployment plan with task items
   */
  test("Plan & Task components should render and expand", async ({ page }) => {
    const section = page.locator("#plan-section")
    await expect(section.getByText("Deployment Plan")).toBeVisible()
    await expect(section.getByText("Prepare infrastructure")).toBeVisible()
    await expect(section.getByText("Setting up servers and database.")).toBeVisible()
  })

  /**
   * Test: Queue component structure
   * Verifies queue sections with in-progress items
   */
  test("Queue component should render items and labels", async ({ page }) => {
    const section = page.locator("#queue-section")
    await expect(section.getByText("In Progress")).toBeVisible()
    await expect(section.getByText("Deploying to production")).toBeVisible()
  })

  /**
   * Test: Terminal component output
   * Verifies terminal output with ANSI color codes
   */
  test("Terminal component should show output", async ({ page }) => {
    const section = page.locator("#terminal-section")
    // Use part of the text to be safe with ANSI codes
    await expect(section.getByText("npm run build")).toBeVisible()
    await expect(section.getByText("Done!")).toBeVisible()
  })

  /**
   * Test: PromptInput component interactivity
   * Verifies textarea input and submit button functionality
   */
  test("PromptInput component should be interactive", async ({ page }) => {
    const section = page.locator("#promptinput-section")
    const textarea = section.locator("textarea")
    await textarea.fill("What is the meaning of life?")
    await expect(textarea).toHaveValue("What is the meaning of life?")
    await expect(section.getByRole("button")).toBeVisible()
  })

  /**
   * Test: Canvas component rendering
   * Verifies canvas area for workflow nodes and edges
   */
  test("Canvas component should render drawing area", async ({ page }) => {
    const section = page.locator("#canvas-section")
    await expect(section).toBeVisible()
    await expect(section.getByText("Canvas")).toBeVisible()

    // Assert canvas element is visible using specific test id
    const canvas = section.getByTestId("canvas-area")
    await expect(canvas).toBeVisible()

    // Assert example text is present
    await expect(section.getByText("Canvas area for workflow")).toBeVisible()
  })

  /**
   * Test: Edge component rendering
   * Verifies edge connections between nodes
   */
  test("Edge component should render connection", async ({ page }) => {
    const section = page.locator("#edge-section")
    await expect(section).toBeVisible()
    await expect(section.getByText("Edge")).toBeVisible()

    // Assert edge label/connection text is visible
    await expect(section.getByText("Edge connection")).toBeVisible()

    // Assert SVG edge element exists using specific test id
    const edge = section.getByTestId("edge-connection")
    await expect(edge).toBeVisible()
  })

  /**
   * Test: Node component rendering
   * Verifies node with title, content, and child controls
   */
  test("Node component should render node with title and content", async ({ page }) => {
    const section = page.locator("#node-section")
    await expect(section).toBeVisible()
    await expect(section.getByText("Node")).toBeVisible()

    // Assert node title is visible
    await expect(section.getByText("Process Data")).toBeVisible()

    // Assert node content is visible (explicit partial match)
    await expect(section.getByText("Transform and validate", { exact: false })).toBeVisible()

    // Assert node has child controls
    const node = section.locator("[class*='node'], [class*='card']")
    await expect(node.first()).toBeVisible()
  })

  /**
   * Test: Accessibility - AI Elements
   *
   * Validates WCAG compliance for AI-related components:
   * - Agent section
   * - CodeBlock section
   * - Button section (icon-only buttons with aria-labels)
   *
   * Uses axe-core to detect accessibility violations.
   */
  test("should not have accessibility violations on AI elements", async ({
    page,
    makeAxeBuilder,
  }) => {
    // Test agent section
    const agentResults = await makeAxeBuilder().include("#agent-section").analyze()
    expect(agentResults.violations).toEqual([])

    // Test codeblock section
    const codeblockResults = await makeAxeBuilder().include("#codeblock-section").analyze()
    expect(codeblockResults.violations).toEqual([])

    // Test button section (icon-only buttons with aria-labels)
    const buttonResults = await makeAxeBuilder().include("#button-section").analyze()
    expect(buttonResults.violations).toEqual([])
  })

  /**
   * Test: Accessibility - Forms and Inputs
   *
   * Validates WCAG compliance for form components:
   * - Input section
   * - PromptInput section
   *
   * Uses axe-core to detect accessibility violations.
   */
  test("should not have accessibility violations on forms and inputs", async ({
    page,
    makeAxeBuilder,
  }) => {
    // Test input section
    const inputResults = await makeAxeBuilder().include("#input-section").analyze()
    expect(inputResults.violations).toEqual([])

    // Test promptinput section
    const promptInputResults = await makeAxeBuilder().include("#promptinput-section").analyze()
    expect(promptInputResults.violations).toEqual([])
  })

  /**
   * Test: Accessibility - Navigation Components
   *
   * Validates WCAG compliance for navigation components:
   * - Breadcrumb section
   * - Tabs section
   *
   * Uses axe-core to detect accessibility violations.
   */
  test("should not have accessibility violations on navigation components", async ({
    page,
    makeAxeBuilder,
  }) => {
    // Test breadcrumb section
    const breadcrumbResults = await makeAxeBuilder().include("#breadcrumb-section").analyze()
    expect(breadcrumbResults.violations).toEqual([])

    // Test tabs section
    const tabsResults = await makeAxeBuilder().include("#tabs-section").analyze()
    expect(tabsResults.violations).toEqual([])
  })
})
