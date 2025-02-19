# Cypress & Playwright Web3 Testing

This repository demonstrates how to use **Cypress** and **Playwright** for Web3 end-to-end testing by utilizing a **CustomBridge** (in Cypress) and **Synpress** (in Playwright) to connect a wallet on [de.fi](https://de.fi).

## Features

- Uses **Cypress** and **Playwright** for end-to-end testing.
- Connects a wallet to de.fi using Web3.
- Includes **GitHub Actions** workflows for running tests.
- Generates **Mochawesome** and **Playwright** reports.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/web3-testing.git
   cd web3-testing
   ```
2. Install dependencies:
   ```sh
   yarn install
   ```

---

## Running Tests

### Cypress

Run Cypress tests locally using:

```sh
yarn cypress open
```

or in headless mode:

```sh
yarn cypress run
```

### Playwright

Run Playwright tests locally:

```sh
npx playwright test
```

Run Playwright tests in **headed mode**:

```sh
npx playwright test --headed
```

Before running Playwright tests, ensure the wallet cache is generated:

```sh
npx synpress playwright/wallet-setup
```

---

## Project Structure

```
.
├── cypress/                  # Cypress tests
│   ├── e2e/                  # Cypress E2E tests
│   ├── reports/              # Mochawesome reports
│   ├── support/              # Cypress support files
│   └── cypress.config.ts     # Cypress configuration
│
├── playwright/               # Playwright tests
│   ├── pages/                # Page objects for Playwright
│   ├── tests/                # Playwright E2E tests
│   ├── wallet-setup/         # Wallet setup for Playwright
│   │   └── basic.setup.ts    # Script to build wallet cache
│   ├── playwright.config.ts  # Playwright configuration
│   └── playwright-report/    # Playwright test reports
│
└── .github/workflows/        # CI/CD pipelines
```

---

## GitHub Actions Workflows

### Cypress Workflow

The Cypress workflow (`.github/workflows/cypress-web3.yml`):

- Runs on `ubuntu-latest` using a Cypress Docker image.
- Caches dependencies for faster execution.
- Runs tests using Chrome in headless mode.
- Stores a **Mochawesome** report as an artifact.

```yaml
name: Cypress Web3 tests
on:
  workflow_dispatch:
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    container: cypress/browsers:node-22.12.0-chrome-131.0.6778.108-1-ff-133.0-edge-131.0.2903.70-1
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - run: corepack enable
      - uses: actions/cache@v4
        with:
          path: |
            **/node_modules
            ~/.cache/Cypress
          key: ${{ runner.os }}-node_modules-${{ hashFiles('./yarn.lock') }}
      - name: Install dependencies
        run: yarn install
      - name: Cypress run
        uses: cypress-io/github-action@v6
        env:
          CYPRESS_WALLET_PRIVATE_KEY: ${{ secrets.CYPRESS_WALLET_PRIVATE_KEY }}
          CYPRESS_NETWORK: "1"
        with:
          browser: chrome
          headless: true
      - name: Store Mochawesome report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: cypress-mochawesome-report
          path: cypress/reports
```

### Playwright Workflow

The Playwright workflow (`.github/workflows/playwright-web3.yml`):

- Runs on `ubuntu-latest`.
- Caches dependencies for faster execution.
- Generates wallet cache before running tests.
- Stores **Playwright HTML reports** as an artifact.

```yaml
name: Playwright Web3 tests
on:
  workflow_dispatch:
jobs:
  playwright-run:
    runs-on: ubuntu-latest
    env:
      WALLET_SEED_PHRASE: ${{ secrets.WALLET_SEED_PHRASE }}
      WALLET_PASSWORD: ${{ secrets.WALLET_PASSWORD }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Install dependencies
        run: npm install
      - name: Build wallet cache
        run: xvfb-run npx synpress playwright/wallet-setup
      - name: Run Playwright tests
        run: xvfb-run npx playwright test
      - name: Store Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Environment Variables

To run tests locally or in CI, set the following environment variables:

**For Cypress:**

- `CYPRESS_WALLET_PRIVATE_KEY`: Private key for the test wallet.
- `CYPRESS_NETWORK`: Ethereum network ID (e.g., `1` for mainnet).

**For Playwright:**

- `WALLET_SEED_PHRASE`: Wallet seed phrase.
- `WALLET_PASSWORD`: Wallet password.

### Setting Secrets in GitHub Actions

1. Go to your repository settings.
2. Navigate to **Secrets and variables** > **Actions**.
3. Click **New repository secret**.
4. Add:
   - `WALLET_SEED_PHRASE`
   - `WALLET_PASSWORD`
   - `CYPRESS_WALLET_PRIVATE_KEY`
   - `CYPRESS_NETWORK`

---

## Test Reports

### Cypress

- Uses **Mochawesome** for test reports.
- Report available in `cypress/reports/`.
- Stored as an artifact in CI/CD.

### Playwright

- Generates **HTML test reports** in `playwright-report/`.
- Stored as an artifact in CI/CD.

---

## License

This project is licensed under the **MIT License**.
