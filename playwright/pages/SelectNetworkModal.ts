import { type Locator, type Page } from "@playwright/test"

export class SelectNetworkModal {
  readonly page: Page
  readonly evmWalletsButton: Locator

  constructor(page: Page) {
    this.page = page
    this.evmWalletsButton = page.locator("[data-testid='connect-evm']")
  }
}
