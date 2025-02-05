import type { Locator } from "../utils/pageObjectUtils"
import { getElement } from "../utils/pageObjectUtils"

export const connectEvmWalletModal = {
  detectedWalletButton: (): Locator =>
    getElement("li[class*='detected-wallet'] > button", { timeout: 50000 }),
}
