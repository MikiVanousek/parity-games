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
import { setupNodeEvents } from "./events/nodeEvents";
import { PGParser } from "./board/PGParser";
import { example_pg } from "./board/ExamplePG";
import { Trace } from "./board/Trace";
import { showToast } from "./ui/toast";
import { fillManual } from "./keymap/fillManual";
import { keyMappings } from "./keymap/keymap";

declare global {
  interface Window {
    $: typeof import("jquery");
    cy: any;
    ur: any;
    traceManager: TraceManager;
    layoutManager: LayoutManager;
    pgName: string;
  }
}

// Set up the cytoscape instance
var [cy, ur] = setupCytoscape("cy");
window.cy = cy;
window.ur = ur;

fillManual()

const fileInput = document.getElementById("fileInput");
var pgManager = new TraceManager(cy);
fileInput.addEventListener("change", (e) => {
  console.log("fileInput changed");
  pgManager.handleTraceFileSelect(e);
});
window.traceManager = pgManager;

const layoutManager = new LayoutManager(cy);
window.layoutManager = layoutManager;
setupKeyboardEvents(cy, ur);
setupNodeEvents(cy, ur, layoutManager);

// Window shits
(window as any).handleExportGame = function () {
  handleExportGame(cy);
};

(window as any).handleImportGame = function (event) {
  handleImportGame(event, cy);
};

(window as any).handleOinkFileSelect = function (event) {
  handleOinkFileSelect(event, cy, layoutManager);
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
  layoutManager.toggleLayout(false);
};

(window as any).runLayout = function () {
  layoutManager.runOnce();
};

document.getElementById("display-labels").addEventListener("change", function () {
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
    const currentStepIndex = window.traceManager ? window.traceManager.getStep() : 0;
    const trace = window.traceManager ? window.traceManager.getTrace() : [];
    const pgName = window.pgName;
  
    const state = {
      elements,
      layoutOptions,
      currentStepIndex,
      trace,
      pgName,
    };
  
    localStorage.setItem('graphState', JSON.stringify(state));
  }


function deserializeGraphState() {
  const savedState = localStorage.getItem('graphState');
  if (!savedState) return;

  const { elements, layoutOptions, currentStepIndex, trace, pgName } = JSON.parse(savedState);

  if (window.cy) {
    window.cy.json({ elements }); // Restore elements
    cy.fit(); // Fit the graph to the viewport
    window.pgName = pgName; // Restore the parity game name
    
    // Restore the trace
    if (trace) {
      let t = new Trace((trace));
      window.traceManager.setTrace(t);
    }

    if (window.traceManager && currentStepIndex !== undefined) {
      window.traceManager.setStep(currentStepIndex); // Restore the current step
    }
  }
}

function validatepgName(pgName) {

  if (pgName.length > 0) {
    return true;
  } else if (pgName.length === 0) {
    showToast({
      message: "The name of the parity game cannot be empty.",
      variant: "danger",
      duration: 4000,
    });
    return false;
  } else if (pgName.includes('/')) {
    showToast({
      message: "The name of the parity game cannot contain slashes.",
      variant: "danger",
      duration: 4000,
    });
    return false;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  deserializeGraphState();
  const playStopButton = document.getElementById("playAction");

  // if the name is in the window, then update the title
  if (window.pgName) {
    if (validatepgName(window.pgName)) {
      document.getElementById('parityGameTitle').textContent = window.pgName;
    } else {
      document.getElementById('parityGameTitle').textContent = 'New Parity Game';
      window.pgName = 'New Parity Game';
    }
  }

  if (playStopButton) {
    const playStopIcon = document.querySelector("#playAction .fa");

    if (playStopIcon) {
      // Initial button state setup
      playStopButton.dataset.playing = "false";
      playStopIcon.classList.add("fa-play");
      playStopButton.textContent = "Play";

      playStopButton.addEventListener("click", function () {
        const isPlaying = playStopButton.dataset.playing === "true";

        if (!isPlaying) {
          // If not playing, start play
          playStopButton.dataset.playing = "true";
          playStopIcon.classList.remove("fa-play");
          playStopIcon.classList.add("fa-stop");
          playStopButton.textContent = "Stop";
          pgManager.play(); // Call the play method
        } else {
          // If playing, stop
          playStopButton.dataset.playing = "false";
          playStopIcon.classList.remove("fa-stop");
          playStopIcon.classList.add("fa-play");
          playStopButton.textContent = "Play";
          pgManager.stop(); // Call the stop method
        }
      });
    }
  }

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
    .addEventListener("click", pgManager.close.bind(pgManager));

  document.getElementById("export-oink-btn").addEventListener("click", (e) => {
    PGParser.exportOinkFormat(PGParser.cyToPg(cy));
  });

  document.getElementById('editTitleIcon').addEventListener('click', function() {
    const currentTitleElement = document.getElementById('parityGameTitle');
    const currentText = currentTitleElement.textContent;

    // Create an input field only if it doesn't already exist
    if (currentTitleElement && currentTitleElement.querySelector('.title-edit-input') === null){
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = currentText;
        inputField.className = 'title-edit-input';

        currentTitleElement.textContent = '';
        currentTitleElement.appendChild(inputField);
        inputField.focus();
        inputField.select();

        const revertToText = () => {
            if (validatepgName(inputField.value)) {
                currentTitleElement.textContent = inputField.value; // Update the text if valid
                window.pgName = inputField.value; // Update the global parityName
                inputField.removeEventListener('blur', handleBlur);
                inputField.remove(); // Remove input field if the name is valid
            } else {
                inputField.focus();
            }
        };

        // Define a function to handle blur event
        const handleBlur = () => revertToText();

        // Define a function to handle keypress event
        const handleKeypress = (e) => {
            if (e.key === 'Enter') {
                if (validatepgName(inputField.value)) {
                    inputField.blur(); // Trigger blur to revert and save if the name is valid
                } else {
                    e.preventDefault(); // Prevent the default action if the name is invalid
                }
            }
        };

        inputField.addEventListener('blur', handleBlur);
        inputField.addEventListener('keypress', handleKeypress);
    }
});
  setInterval(serializeGraphState, 500);
});
