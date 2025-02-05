# Cypress Web3

This repository demonstrates how to use Cypress with Web3 by utilizing a CustomBridge to connect a wallet on [de.fi](https://de.fi).

## Features

- Uses Cypress for end-to-end testing.
- Connects a wallet to de.fi using Web3.
- Includes a GitHub Actions workflow for running tests.
- Generates a Mochawesome report.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/cypress-web3.git
   cd cypress-web3
   ```
2. Install dependencies:
   ```sh
   yarn install
   ```

## Running Tests

Run Cypress tests locally using:

```sh
yarn cypress open
```

or headless mode:

```sh
yarn cypress run
```

## GitHub Actions Workflow

The repository includes a GitHub Actions workflow (`cypress-web3.yml`) that runs Cypress tests in a CI/CD pipeline. The workflow:

- Runs on `ubuntu-latest` using a Cypress Docker image.
- Caches dependencies for faster execution.
- Runs tests using Chrome in headless mode.
- Stores a Mochawesome report as an artifact.

### Workflow File: `.github/workflows/cypress-web3.yml`

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
        id: yarn-build-cache
        with:
          path: |
            **/node_modules
            ~/.cache/Cypress
            **/build
          key: ${{ runner.os }}-node_modules-files-build-${{ hashFiles('./yarn.lock') }}
          restore-keys: |
            ${{ runner.os }}-node_modules-build-
      - name: Install and show git version
        run: apt-get -y install git && git --version
        id: git-install
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

## Environment Variables

To run tests locally or in CI, set the following environment variables:

- `CYPRESS_WALLET_PRIVATE_KEY`: Private key for the test wallet.
- `CYPRESS_NETWORK`: Ethereum network ID (e.g., `1` for mainnet).

## Test File

The repository contains a single test in `cypress/e2e/login.cy.ts`, which connects the wallet to de.fi.

## Test Reports

- Uses Mochawesome for generating reports.
- The report is available in `cypress/reports/` after running tests.
- In CI, the report is stored as an artifact.

## Contributing

Feel free to submit issues or pull requests for improvements.

## License

This project is licensed under the MIT License.
