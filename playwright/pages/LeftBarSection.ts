import { expect, type Locator, type Page } from "@playwright/test"

export class LeftBarSection {
  readonly page: Page
  readonly connectWalletOption: Locator
  readonly walletDropdown: Locator
  readonly connectWalletButton: Locator

  constructor(page: Page) {
    this.page = page
    this.connectWalletOption = page.locator("div.walletsManager span.arrowDownIcon")
    this.walletDropdown = page.locator("div.walletsManager > div[class*='dropdownButton']")
    this.connectWalletButton = page.locator("section > div > div > button")
  }

  async goToConnectWallet() {
    await this.connectWalletOption.click()
    await expect(this.connectWalletButton).toBeVisible()
    await this.connectWalletButton.click()
  }

  async verifyWalletConnected() {
    await expect(this.connectWalletOption).not.toBeVisible()
    await expect(this.walletDropdown).toBeVisible()
  }
}
