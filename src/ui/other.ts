export function setupOtherUI() {
  document.getElementById("resetViewBtn").addEventListener("click", () => {
    window.cy.reset();
    window.cy.centre();
  });
}
