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
import { example_zielonka } from "./board/ExamplePG";
import { algos } from "./algos";

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
cy.add(PGParser.pgToCy(example_zielonka));

fillManual();

const fileInput = document.getElementById("fileInput");
var pgManager = new TraceManager(cy);
fileInput.addEventListener("change", (e) => {
  console.log("fileInput changed");

  const target = e.target as HTMLInputElement;
  pgManager.handleTraceFileSelect(e);

  // Reset the file input value
  if (target && target.value) {
    target.value = '';
  }
  
});
window.traceManager = pgManager;

// populate the algorithm select options
const algoSelect = document.getElementById("algorithm-select");
Object.keys(algos).forEach((key) => {
  const option = document.createElement("option");
  option.value = key;
  option.text = algos[key].name;
  algoSelect.appendChild(option);
});

const algoStart = document.getElementById("start-algorithm-btn");
algoStart.addEventListener("click", () => {
  console.log("start algorithm");
  // get the selected algorithm
  const algoSelect = document.getElementById(
    "algorithm-select"
  ) as HTMLSelectElement;
  const selectedAlgorithm = algoSelect.value;

  const res = algos[selectedAlgorithm].run(PGParser.cyToPg(cy));

  // Update the trace with the result from the algorithm
  if (res.trace) {
    window.traceManager.setTrace(res.trace);
  }
});

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

const displayLabelsInput = document.getElementById(
  "display-labels"
) as HTMLInputElement;
displayLabelsInput.addEventListener("change", refreshNodeLabels);

export function refreshNodeLabels() {
  // Label means two things in this function: node.data.label is the name of the node, and node.style.label is the text that is displayed on the node, which also incudes the priority or the label from trace if needed.
  const displayNodeLabels = displayLabelsInput.checked;

  function compositeLabel(ele) {
    // Parent nodes are the groups of nodes created with "g".
    if (ele.isParent()) {
      return ele.data("label");
    }
    let res = ele.data("priority").toString();
    if (displayNodeLabels && (ele.data("label") || ele.data("traceLabel"))) {
      // Skip line if there is trace label, to make it clear the label is trace label
      res += `\n${ele.data("label")}`;
    }
    if (ele.data("traceLabel")) {
      res += `\n${ele.data("traceLabel")}`;
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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/serviceWorker.js").then(
      (registration) => {
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
      },
      (err) => {
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  });
}
