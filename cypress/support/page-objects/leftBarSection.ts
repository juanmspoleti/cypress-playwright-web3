import type { Locator } from "../utils/pageObjectUtils"
import { getElement } from "../utils/pageObjectUtils"

export const leftBarSection = {
  // menu options
  connectWalletOption: (): Locator => getElement("div.walletsManager span.arrowDownIcon"),
  walletDropdown: (): Locator =>
    getElement("div.walletsManager > div[class*='dropdownButton']", { timeout: 10000 }),

  // connect wallet section
  connectWalletButton: (): Locator => getElement("section > div > div > button"),
}
