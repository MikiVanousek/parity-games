import LayoutManager from "./layout/layoutManager";
import { example_pg } from "./board/ExamplePG";
import { handleTraceFileSelect } from "./io/importTrace";
import { setupCytoscape } from "./cytoscape/cytoscapeSetup";
import { setupKeyboardEvents } from "./events/keyboardEvents";
import {
  handleExportGame,
  handleImportGame,
  exportAsPng,
  handleOinkFileSelect,
} from "./io/exportImport";
import { setupNodeEvents } from "./events/nodeEvents";

const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", handleTraceFileSelect);

// Set up the cytoscape instance
var pg = example_pg;
var [cy, ur] = setupCytoscape("cy");
cy.add(pg.getElementDefinition());
const layoutManager = new LayoutManager(cy);
layoutManager.runOnce();
setupKeyboardEvents(cy, ur);
setupNodeEvents(cy, ur, layoutManager);

// Window shits
(window as any).handleExportGame = function () {
  handleExportGame(pg, cy);
};

(window as any).handleImportGame = function (event) {
  handleImportGame(event, cy);
};

(window as any).exportAsPng = function () {
  exportAsPng(cy, pg);
};

(window as any).handleFileSelect = function (event) {
  handleOinkFileSelect(event, cy, layoutManager, pg);
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
