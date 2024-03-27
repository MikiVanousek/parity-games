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

  function updateDisplay() {
    const step = traceData[currentStepIndex];
    const listElement = document.getElementById('color-legend');
    listElement.innerHTML = '';
  
    step.node_sets.forEach((node, index) => {
      addListItem(listElement, node, `#FF5733`); 
    });
  
    step.link_sets.forEach((link, index) => {
      addListItem(listElement, link, `#4CAF50`);
    });
  }
  
  function addListItem(listElement, text, initialColor) {
    const listItem = document.createElement('li');
    listItem.style.display = 'flex';
    listItem.style.alignItems = 'center';
  
    const colorLine = document.createElement('div');
    colorLine.classList.add('color-line');
    colorLine.style.backgroundColor = initialColor; // Set initial color
    colorLine.setAttribute('data-initial-color', initialColor); // Store initial color
    
    // Update color toggle functionality
    colorLine.addEventListener('click', function() {
      const isTransparent = colorLine.style.backgroundColor === 'transparent' || colorLine.style.backgroundColor === '';
      // Retrieve the initial color from the custom attribute
      const storedColor = colorLine.getAttribute('data-initial-color');
      colorLine.style.backgroundColor = isTransparent ? storedColor : 'transparent';
    });
  
    listItem.appendChild(colorLine);
  
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    textSpan.style.marginLeft = '15px'; // Ensures padding between the color line and text
    listItem.appendChild(textSpan);
  
    listElement.appendChild(listItem);
  }
  
  
  function goToNextStep() {
    if (currentStepIndex < traceData.length - 1) {
      currentStepIndex++;
      updateDisplay();
    }
  }
  
  function goToPreviousStep() {
    if (currentStepIndex > 0) {
      currentStepIndex--;
      updateDisplay();
    }
  }
  
  function goToFirstStep() {
    currentStepIndex = 0;
    updateDisplay();
  }
  
  function goToLastStep() {
    currentStepIndex = traceData.length - 1;
    updateDisplay();
  }
  
  let autoPlayIntervalId = null;
  
  function play() {
    // get the current factor
    const factor = document.getElementById('speedSelect') as HTMLSelectElement;
    const speedFactor = parseFloat(factor.value);
  
    const interval = 2000 / speedFactor;
  
    // Stop any existing playback
    if (autoPlayIntervalId !== null) {
      clearInterval(autoPlayIntervalId);
      autoPlayIntervalId = null;
    }
  
    // Start a new interval
    autoPlayIntervalId = setInterval(() => {
      if (currentStepIndex < traceData.length - 1) {
        currentStepIndex++;
        updateDisplay();
      } else {
        // Reached the end, stop the interval
        stopPlay();
      }
    }, interval);
  }
  
  function stopPlay() {
    if (autoPlayIntervalId !== null) {
      clearInterval(autoPlayIntervalId);
      autoPlayIntervalId = null;
    }
  }
  
  document.addEventListener('DOMContentLoaded', function() {
  
    document.getElementById('nextStepAction').addEventListener('click', goToNextStep);
    document.getElementById('lastStepAction').addEventListener('click', goToPreviousStep);
    document.getElementById('skipToBeginningAction').addEventListener('click', goToFirstStep);
    document.getElementById('skipToEndAction').addEventListener('click', goToLastStep);
  
    document.getElementById('playAction').addEventListener('click', play);
    document.getElementById('stopAction').addEventListener('click', stopPlay);
  
    updateDisplay();
  });
  
  
  const traceData = [
    {
      name: "Step 1",
      node_sets: ["Vertex 1", "Vertex 2"],
      link_sets: ["Link 1-2", "Link 2-3"]
    },
    {
      name: "Step 2",
      node_sets: ["Vertex 3", "Vertex 4"],
      link_sets: ["Link 3-4", "Link 4-5"]
    },
    {
      name: "Step 3",
      node_sets: ["Vertex 5", "Vertex 6"],
      link_sets: ["Link 5-6", "Link 6-7"]
    }
  ];
  
  let currentStepIndex = 0;
  