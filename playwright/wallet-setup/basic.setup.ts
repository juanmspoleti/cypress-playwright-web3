import { defineWalletSetup } from "@synthetixio/synpress"
import { MetaMask } from "@synthetixio/synpress/playwright"
import "dotenv/config"

const SEED_PHRASE = process.env.WALLET_SEED_PHRASE
const PASSWORD = process.env.WALLET_PASSWORD

if (!PASSWORD) {
  throw new Error("WALLET_PASSWORD is not set in .env file")
}
if (!SEED_PHRASE) {
  throw new Error("WALLET_SEED_PHRASE is not set in .env file")
}

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const metamask = new MetaMask(context, walletPage, PASSWORD)

  await metamask.importWallet(SEED_PHRASE)
})
