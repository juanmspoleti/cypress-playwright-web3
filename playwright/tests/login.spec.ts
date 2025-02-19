import { LeftBarSection } from "../pages/LeftBarSection"
import { ConnectEvmWalletModal } from "../pages/ConnectEvmWalletModal"
import { SelectNetworkModal } from "../pages/SelectNetworkModal"
// Import necessary Synpress modules and setup
import { testWithSynpress } from "@synthetixio/synpress"
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright"
import basicSetup from "../wallet-setup/basic.setup"

// Create a test instance with Synpress and MetaMask fixtures
const test = testWithSynpress(metaMaskFixtures(basicSetup))

// Define a basic test case
test("should connect wallet to the MetaMask Test Dapp", async ({
  context,
  page,
  metamaskPage,
  extensionId,
}) => {
  // Create a new MetaMask instance
  const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId)

  const leftBarSection = new LeftBarSection(page)
  const connectEvmWalletModal = new ConnectEvmWalletModal(page)
  const selectNetworkModal = new SelectNetworkModal(page)

  // Navigate to the homepage
  await page.goto("")

  await leftBarSection.goToConnectWallet()

  await selectNetworkModal.evmWalletsButton.click()
  await connectEvmWalletModal.metamaskWalletButton.click({ timeout: 50000 })

  // Connect MetaMask to the dapp
  await metamask.connectToDapp()

  await leftBarSection.verifyWalletConnected()
})
