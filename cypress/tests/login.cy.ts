import { connectEvmWalletModal } from "../support/page-objects/connectEvmWalletModal"
import { leftBarSection } from "../support/page-objects/leftBarSection"
import { selectNetworkModal } from "../support/page-objects/selectNetworkModal"

describe("Login", () => {
  context("desktop", () => {
    beforeEach(() => {
      cy.loginWithWallet()
    })

    it("connect wallet using ETH Mainnet", () => {
      leftBarSection.connectWalletOption().click()
      leftBarSection.connectWalletButton().click()

      selectNetworkModal.evmWalletsButton().click()
      connectEvmWalletModal.detectedWalletButton().click()

      leftBarSection.connectWalletOption().should("not.exist")
      leftBarSection.walletDropdown().should("be.visible")
    })
  })
})
