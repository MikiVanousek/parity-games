import LayoutManager from "./layout/layoutManager";
import { TraceManager } from "./io/TraceManager";
import { setupCytoscape } from "./cytoscape/cytoscapeSetup";
import { setupKeyboardEvents } from "./events/keyboardEvents";
import {
  handleExportGame,
  handleImportGame,
  exportAsPng,
  handleOinkFileSelect,
  saveOinkFile,
} from "./io/exportImport";
import { setupUndoRedoActions } from "./undo-redo/urActionSetup";
import { setupNodeEvents } from "./events/nodeEvents";
import { PGParser } from "./board/PGParser";
import { showToast } from "./ui/toast";
import { fillManual } from "./keymap/manual";
import { loadState, saveState } from "./io/autosave";
import "./ui/PGNameEditing";
import { setupPGNameEditing } from "./ui/PGNameEditing";

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
window.PGParser = PGParser;

// Set up the cytoscape instance
var [cy, ur] = setupCytoscape("cy");
window.cy = cy;
window.ur = ur;

fillManual();

const fileInput = document.getElementById("fileInput");
var pgManager = new TraceManager(cy);
fileInput.addEventListener("change", (e) => {
  console.log("fileInput changed");
  pgManager.handleTraceFileSelect(e);
});
window.traceManager = pgManager;

const layoutManager = new LayoutManager(cy);
window.layoutManager = layoutManager;
setupUndoRedoActions(cy, ur, layoutManager);
setupKeyboardEvents(cy, ur);
setupNodeEvents(cy, ur, layoutManager);

// Window shits
(window as any).handleExportGame = function () {
  handleExportGame(cy);
};

(window as any).handleImportGame = function (event) {
  handleImportGame(event, cy, ur);
};

(window as any).handleOinkFileSelect = function (event) {
  handleOinkFileSelect(event, cy, layoutManager, ur);
};
(window as any).saveOinkFile = function (event) {
  saveOinkFile(cy);
};

(window as any).exportAsPng = function () {
  exportAsPng(cy);
};

(window as any).changeLayout = function (e: any) {
  layoutManager.changeLayout(e.target.value);
  // decheck the layout on layout-on-drag
  const toggle = document.getElementById("layout-on-drag") as HTMLInputElement;
  toggle.checked = false;
  layoutManager.setRunOnDrag(false);
};

(window as any).runLayout = function () {
  ur.do("runLayout", { nodes: cy.nodes() });
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

function serializeGraphState() {
  if (!window.cy) return;

  const elements = window.cy.json().elements;
  const layoutOptions = window.layoutManager.getCurrentLayoutOptions();
  const currentStepIndex = window.traceManager
    ? window.traceManager.getStep()
    : 0;
  const trace = window.traceManager ? window.traceManager.getTrace() : [];

  const state = {
    elements,
    layoutOptions,
    currentStepIndex,
    trace,
  };

  localStorage.setItem("graphState", JSON.stringify(state));
}

function deserializeGraphState() {
  const savedState = localStorage.getItem("graphState");
  if (!savedState) return;

  const { elements, layoutOptions, currentStepIndex, trace } =
    JSON.parse(savedState);

  if (window.cy) {
    window.cy.json({ elements }); // Restore elements
    window.cy.layout(layoutOptions).run(); // Apply the saved layout

    // Restore the trace
    if (trace) {
      let t = new Trace(trace);
      window.traceManager.setTrace(t);
    }
    return res;
  }

  cy.nodes().style({
    label: compositeLabel,
  });
}

document.addEventListener("DOMContentLoaded", function () {
  loadState(); // Load saved state
  refreshNodeLabels();
  window.cy.fit(cy.elements(), 50);

  setupPGNameEditing();

  document
    .getElementById("nextStepAction")
    .addEventListener("click", pgManager.nextStep.bind(pgManager));
  document
    .getElementById("lastStepAction")
    .addEventListener("click", pgManager.prevStep.bind(pgManager));
  document
    .getElementById("skipToBeginningAction")
    .addEventListener("click", pgManager.goToFirstStep.bind(pgManager));
  document
    .getElementById("skipToEndAction")
    .addEventListener("click", pgManager.goToLastStep.bind(pgManager));
  document
    .getElementById("closeButton")
    .addEventListener("click", pgManager.removeTrace.bind(pgManager));

  document.getElementById("export-oink-btn").addEventListener("click", (e) => {
    PGParser.exportOinkFormat(PGParser.cyToPg(cy));
  });

  // reset view button. so when this button is clicked, the graph will be reset to the original view and have the graph centered
  document.getElementById("resetView").addEventListener("click", (e) => {
    cy.reset();
    cy.centre();
  });

  setInterval(saveState, 500);
});
