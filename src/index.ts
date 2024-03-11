import { PG } from "./pg_diagram";
// import * as cytoscape from "cytoscape";
// import * as edgeEditing from "cytoscape-edge-editing";
//import * as $ from "jquery";
//import konva from "konva";

var cytoscape = require("cytoscape");
var jquery = require("jquery");
var konva = require("konva");
var edgeEditing = require("cytoscape-edge-editing");
console.log(jquery);
edgeEditing(cytoscape, jquery, konva);
cytoscape.use(edgeEditing);

let pg = new PG.ParityGame();
let id = 0;
let isDragging = false;
let cy = cytoscape({
  container: document.getElementById("cy"),
  elements: [],
  style: [
    {
      selector: 'node[isEven = "true"]',
      style: {
        shape: "ellipse", // Round shape for even nodes
        content: "data(priority)",
        "text-valign": "center",
        "text-halign": "center",
        color: "white",
        //'background-color': '#66CCFF', // Example color
        // Define other styles as needed
      },
    },
    {
      selector: 'node[isEven = "false"]',
      style: {
        shape: "rectangle", // Square shape for odd nodes
        content: "data(priority)",
        "text-valign": "center",
        "text-halign": "center",
        color: "white",
        //'background-color': '#FF6666', // Example color
        // Define other styles as needed
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "unbundled-bezier", // This makes the edge curved, which helps visually with arrow positioning
        "target-arrow-shape": "triangle", // This creates a directed edge with an arrow pointing to the target node
        //'target-arrow-color': '#000', // Optionally set the arrow color
        //'line-color': '#000' // Optionally set the line color
      },
    },
  ],
});
const cyContainer = cy.container();
let copiedElements: cytoscape.ElementDefinition[] = [];

cy.edgeEditing({
  bendRemovalSensitivity: 16,
  enableMultipleAnchorRemovalOption: true,
  initAnchorsAutomatically: false,
  useTrailingDividersAfterContextMenuOptions: false,
  enableCreateAnchorOnDrag: true,
});

let mouseX: number = 0;
let mouseY: number = 0;

document.addEventListener("mousemove", (event: MouseEvent) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

document.addEventListener("keydown", (event: KeyboardEvent) => {
  const zoom = cy.zoom();
  const pan = cy.pan();

  // Convert the mouse coordinates to the model coordinates
  const modelX = (mouseX - pan.x) / zoom;
  const modelY = (mouseY - pan.y) / zoom;

  switch (event.key) {
    case "e": {
      addNodeAtPosition(modelX, modelY, true);
      break;
    }
    case "o": {
      addNodeAtPosition(modelX, modelY, false);
      break;
    }
    case "q": {
      var selectedNodes = cy.$("node:selected");
      selectedNodes.forEach((node) => {
        let currentIsEven = node.data("isEven");
        if (currentIsEven === "true") {
          node.data("isEven", "false");
        } else {
          node.data("isEven", "true");
        }
      });
      break;
    }
    case "Delete": {
      var selectedElements = cy.$(":selected");

      // Remove selected elements from the graph
      if (selectedElements.length > 0) {
        selectedElements.remove();
      }
    }
    case "+": {
      var selectedNodes = cy.$("node:selected");
      selectedNodes.forEach((node) => {
        var priority = node.data("priority") || 0;
        node.data("priority", priority + 1);
      });
      break;
    }
    case "-": {
      var selectedNodes = cy.$("node:selected");
      selectedNodes.forEach((node) => {
        var priority = node.data("priority") || 0;
        node.data("priority", priority - 1);
      });
      break;
    }
  }

  if (event.ctrlKey && event.key === "c") {
    copySelectedElements();
  }
  // Paste with Ctrl+V
  else if (event.ctrlKey && event.key === "v") {
    pasteCopiedElements();
  }
});

function copySelectedElements() {
  const selectedEles = cy.$(":selected").jsons();
  // Deep copy and store in global variable
  copiedElements = JSON.parse(JSON.stringify(selectedEles));
}

function pasteCopiedElements() {
  if (copiedElements.length > 0) {
    cy.$(":selected").unselect();
    const offset = 10; // Offset for the pasted elements' position
    const newElements = copiedElements.map((ele) => {
      if (ele.group === "nodes") {
        // Adjust positions to avoid overlap
        ele.data.id = `copied_${ele.data.id}`; // Modify the ID to ensure uniqueness
        ele.position.x += offset;
        ele.position.y += offset;
      } else if (ele.group === "edges") {
        // Adjust source and target for edges to point to the new copied node IDs
        ele.data.id = `copied_${ele.data.id}`; // Modify the ID to ensure uniqueness
        ele.data.source = `copied_${ele.data.source}`;
        ele.data.target = `copied_${ele.data.target}`;
      }
      return ele;
    });

    cy.add(newElements); // Add the new elements to the Cytoscape instance
    copySelectedElements();
    //cy.layout({ name: 'preset' }).run(); // Re-run layout to refresh the view, if needed
  }
}

function addNodeAtPosition(x: number, y: number, isEven: boolean) {
  id = pg.addNode(0, isEven ? PG.Player.Even : PG.Player.Odd);
  cy.add({
    group: "nodes",
    data: {
      id: String(id),
      isEven: String(isEven), // Store isEven as a string to match the selector
      priority: 1,
    },
    position: { x: x, y: y },
  });
  cy.resize();
}

cy.on("click", "node", (event) => {
  const node = event.target;
  const isAltPressed = event.originalEvent.altKey;
  if (!isAltPressed) return;

  event.preventDefault();

  // Get all currently selected nodes
  const selectedNodes = cy.$("node:selected");

  // Create an edge from each selected node to the shift-clicked node
  selectedNodes.forEach((selectedNode) => {
    const existingEdge = cy.edges().some((edge) => {
      return (
        edge.data("source") === selectedNode.id() &&
        edge.data("target") === node.id()
      );
    });
    if (!existingEdge) {
      cy.add({
        group: "edges",
        data: { source: selectedNode.id(), target: node.id() },
      });
    }
  });
});

cyContainer.addEventListener(
  "mousedown",
  (event) => {
    if (event.ctrlKey) {
      event.preventDefault();
      event.stopPropagation();
    }
  },
  true
);
