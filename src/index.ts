import LayoutManager from "./layout/layoutManager";
import { TraceManager } from "./io/TraceManager";
import { setupCytoscape } from "./cytoscape/cytoscapeSetup";
import { setupKeyboardEvents } from "./events/keyboardEvents";
import {
  handleExportGame,
  handleImportGame,
  exportAsPng,
  handleOinkFileSelect,
} from "./io/exportImport";
import { setupNodeEvents } from "./events/nodeEvents";
import { PGParser } from "./board/PGParser";
import { example_pg } from "./board/ExamplePG";


declare global {
  interface Window {
    $: typeof import("jquery");
    cy: any
    ur: any
    traceManager: TraceManager
    layoutManager: LayoutManager,
  }
}

// Set up the cytoscape instance
var [cy, ur] = setupCytoscape("cy");
window.cy = cy
window.ur = ur
cy.add(PGParser.pgToCy(example_pg));

const fileInput = document.getElementById("fileInput");
var pgManager = new TraceManager(cy);
fileInput.addEventListener("change", (e) => {
  console.log("fileInput changed");
  pgManager.handleTraceFileSelect(e);
});
window.traceManager = pgManager

const layoutManager = new LayoutManager(cy);
window.layoutManager = layoutManager;
layoutManager.runOnce();
setupKeyboardEvents(cy, ur);
setupNodeEvents(cy, ur, layoutManager);


// Window shits
(window as any).handleExportGame = function () {
  handleExportGame(cy);
};

(window as any).handleImportGame = function (event) {
  handleImportGame(event, cy);
};

(window as any).exportAsPng = function () {
  exportAsPng(cy);
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






let autoPlayIntervalId = null;

// function play() {
//   // get the current factor
//   const factor = document.getElementById('speedSelect') as HTMLSelectElement;
//   const speedFactor = parseFloat(factor.value);

//   const interval = 2000 / speedFactor;

//   // Stop any existing playback
//   if (autoPlayIntervalId !== null) {
//     clearInterval(autoPlayIntervalId);
//     autoPlayIntervalId = null;
//   }

//   // Start a new interval
//   autoPlayIntervalId = setInterval(() => {
//     if (currentStepIndex < traceData.length - 1) {
//       currentStepIndex++;
//       updateDisplay();
//     } else {
//       // Reached the end, stop the interval
//       stopPlay();
//     }
//   }, interval);
// }

// function stopPlay() {
//   if (autoPlayIntervalId !== null) {
//     clearInterval(autoPlayIntervalId);
//     autoPlayIntervalId = null;
//   }
// }

document.addEventListener('DOMContentLoaded', function () {

  document.getElementById('nextStepAction').addEventListener('click', pgManager.nextStep.bind(pgManager));
  document.getElementById('lastStepAction').addEventListener('click', pgManager.prevStep.bind(pgManager));
  document.getElementById('skipToBeginningAction').addEventListener('click', pgManager.goToFirstStep.bind(pgManager));
  document.getElementById('skipToEndAction').addEventListener('click', pgManager.goToLastStep.bind(pgManager));
  document.getElementById('stopAction').addEventListener('click', pgManager.removeTrace.bind(pgManager))

  // document.getElementById('playAction').addEventListener('click', play);
  // document.getElementById('stopAction').addEventListener('click', stopPlay);

});
