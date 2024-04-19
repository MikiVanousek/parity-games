// Here we place all the UI setups for small components that did not fit anywhere else.
export function setupOtherUI() {
  document.getElementById("resetViewBtn").addEventListener("click", () => {
    window.cy.reset();
    window.cy.centre();
  });
}
