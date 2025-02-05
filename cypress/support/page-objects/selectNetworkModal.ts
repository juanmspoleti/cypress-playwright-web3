import type { Locator } from "../utils/pageObjectUtils"
import { getElement } from "../utils/pageObjectUtils"

export const selectNetworkModal = {
  evmWalletsButton: (): Locator => getElement("[data-testid='connect-evm']"),
}
