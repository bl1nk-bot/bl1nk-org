import { test as base } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

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

export { expect } from "@playwright/test"
