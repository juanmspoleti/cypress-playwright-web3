export type Locator = Cypress.Chainable<JQuery<HTMLElement>>

export function getElement(selector: string, options?: any): Locator {
  return cy.get(selector, options)
}
