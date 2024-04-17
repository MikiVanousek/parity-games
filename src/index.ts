import "./index.css";

import LayoutManager from "./layout/layoutManager";
import { TraceManager } from "./io/TraceManager";
import { setupCytoscape } from "./cytoscape/cytoscapeSetup";
import { setupKeyboardEvents } from "./events/keyboardEvents";
import { setupUndoRedoActions } from "./undo-redo/urActionSetup";
import { setupNodeEvents } from "./events/nodeEvents";
import { fillManual as setupManual } from "./keymap/manual";
import { loadState, saveState } from "./io/autosave";
import "./ui/PGNameEditing";
import { setupPGNameEditing } from "./ui/PGNameEditing";
import { setupImportExportUI } from "./io/exportImport";
import { refreshNodeLabels } from "./ui/other";
import { setupAlgorithmSelect } from "./ui/algorithmSelect";

declare global {
  interface Window {
    $: typeof import("jquery");
    cy: any;
    ur: any;
    traceManager: TraceManager;
    layoutManager: LayoutManager;
    PGParser: any;
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
  setupUndoRedoActions(cy, ur, layoutManager);
  setupKeyboardEvents(cy, ur);
  setupNodeEvents(cy, ur, layoutManager);

  setupManual();
  setupAlgorithmSelect();
  setupPGNameEditing();

  setupImportExportUI();
  refreshNodeLabels();

  loadState(); // Load saved state
  window.cy.fit(cy.elements(), 50);




  // reset view button. so when this button is clicked, the graph will be reset to the original view and have the graph centered

  setInterval(saveState, 500);
});
