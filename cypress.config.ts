import { defineConfig } from "cypress"
import dotenv from "dotenv"

dotenv.config()

export default defineConfig({
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports/mochawesome",
    charts: true,
    reportPageTitle: "Cypress Web3 Automation",
    embeddedScreenshots: true,
  },
  chromeWebSecurity: false,
  env: {
    cypress_wallet_private_key: process.env.CYPRESS_WALLET_PRIVATE_KEY,
    network: process.env.CYPRESS_NETWORK,
  },
  e2e: {
    specPattern: "cypress/tests/**/*.cy.{ts,tsx}",
    baseUrl: "https://de.fi",
    setupNodeEvents(on, config) {
      require("cypress-mochawesome-reporter/plugin")(on)
    },
  },
})
