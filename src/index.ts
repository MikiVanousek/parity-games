import "./index.css";

import LayoutManager from "./layout/layoutManager";
import { TraceManager } from "./io/TraceManager";
import { setupCytoscape } from "./cytoscape/cytoscapeSetup";
import { setupKeyboardEvents } from "./events/keyboardEvents";
import { setupNodeEvents } from "./events/nodeEvents";
import { fillManual as setupManual } from "./ui/manual";
import { loadState, saveState } from "./io/autosave";
import "./ui/pgNameEditing";
import { setupPGNameEditing } from "./ui/pgNameEditing";
import { setupImportExportUI } from "./io/exportImport";
import { setupAlgorithmSelect } from "./ui/algorithmSelect";
import { setupOtherUI } from "./ui/other";
import { setupUndoRedoActions } from "./undo-redo/urActionSetup";

declare global {
  interface Window {
    $: typeof import("jquery");
    cy: any;
    ur: any;
    traceManager: TraceManager;
    layoutManager: LayoutManager;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const [cy, ur] = setupCytoscape("cy");
  window.cy = cy;
  window.ur = ur;
  const traceManager = new TraceManager(cy);
  window.traceManager = traceManager

  const layoutManager = new LayoutManager(cy);
  window.layoutManager = layoutManager;
  setupUndoRedoActions();
  setupKeyboardEvents(cy, ur);
  setupNodeEvents(cy, ur, layoutManager);

  setupManual();
  setupAlgorithmSelect();
  setupPGNameEditing();

  setupImportExportUI();
  setupOtherUI();

  window.cy.fit(cy.elements(), 50);

  loadState(); // Load saved state
  setInterval(saveState, 500);
});
