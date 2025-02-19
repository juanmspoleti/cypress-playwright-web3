import { type Locator, type Page } from "@playwright/test"

export class ConnectEvmWalletModal {
  readonly page: Page
  readonly detectedWalletButton: Locator
  readonly metamaskWalletButton: Locator

  constructor(page: Page) {
    this.page = page
    this.detectedWalletButton = page.locator("li[class*='detected-wallet'] > button")
    this.metamaskWalletButton = page.locator("li[class*='metamask'] > button")
  }
}
