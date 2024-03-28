import LayoutManager from "./layout/layoutManager";
import { PGManager } from "./io/PGManager";
import { setupCytoscape } from "./cytoscape/cytoscapeSetup";
import { setupKeyboardEvents } from "./events/keyboardEvents";
import {
  handleExportGame,
  handleImportGame,
  exportAsPng,
  handleOinkFileSelect,
} from "./io/exportImport";
import { setupNodeEvents } from "./events/nodeEvents";


declare global {
  interface Window {
    $: typeof import("jquery");
    cy: any
    pgManager: PGManager
    layoutManager: LayoutManager,
  }
}

// Set up the cytoscape instance
var [cy, ur] = setupCytoscape("cy");
window.cy = cy

const fileInput = document.getElementById("fileInput");
var pgManager = new PGManager(cy);
fileInput.addEventListener("change", (e) => {
  console.log("fileInput changed");
  pgManager.handleTraceFileSelect(e);
});
window.pgManager = pgManager

const layoutManager = new LayoutManager(cy);
window.layoutManager = layoutManager;
layoutManager.runOnce();
setupKeyboardEvents(cy, ur);
setupNodeEvents(cy, ur, layoutManager);


// Window shits
(window as any).handleExportGame = function () {
  handleExportGame(pgManager.pg, cy);
};

(window as any).handleImportGame = function (event) {
  handleImportGame(event, cy);
};

(window as any).exportAsPng = function () {
  exportAsPng(cy, pgManager.pg);
};

(window as any).changeLayout = function (e: any) {
  layoutManager.changeLayout(e.target.value);
  // decheck the layout on layout-on-drag
  const toggle = document.getElementById("layout-on-drag") as HTMLInputElement;
  toggle.checked = false;
  layoutManager.toggleLayout(false);
};

(window as any).runLayout = function () {
  layoutManager.runOnce();
};

document
  .getElementById("display-labels")
  .addEventListener("change", function () {
    const showLabels = (this as HTMLInputElement).checked;
    cy.nodes().style({
      label: showLabels
        ? (ele: any) => `${ele.data("label")}\n${ele.data("priority")}`
        : "",
      "text-wrap": "wrap",
    });
  });