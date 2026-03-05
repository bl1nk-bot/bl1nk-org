/**
 * Test fixtures for Playwright tests.
 *
 * Provides extended testing capabilities including:
 * - Accessibility testing with axe-core
 * - Custom test utilities
 *
 * @module fixtures
 */

import { test as base } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

/**
 * Extended Playwright test with custom fixtures.
 *
 * @typedef {Object} TestFixtures
 * @property {() => AxeBuilder} makeAxeBuilder - Factory function to create AxeBuilder instances for accessibility testing
 */

/**
 * Creates an AxeBuilder instance for accessibility testing.
 *
 * The AxeBuilder is used to analyze pages for WCAG accessibility violations.
 * It integrates with Playwright to scan specific sections or entire pages.
 *
 * @example
 * ```typescript
 * test("should not have accessibility violations", async ({ page, makeAxeBuilder }) => {
 *   const results = await makeAxeBuilder()
 *     .include("#main-content")
 *     .analyze()
 *   expect(results.violations).toEqual([])
 * })
 * ```
 */
export const test = base.extend<{
  makeAxeBuilder: () => AxeBuilder
}>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () => {
      return new AxeBuilder({ page })
    }
    await use(makeAxeBuilder)
  },
})

/**
 * Playwright expect assertion library.
 *
 * Re-exported from @playwright/test for consistency.
 * Used for all test assertions.
 *
 * @example
 * ```typescript
 * await expect(page.getByText("Hello")).toBeVisible()
 * ```
 */
export { expect } from "@playwright/test"
