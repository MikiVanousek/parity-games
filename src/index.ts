import { PG } from "./pg_diagram";
import * as cytoscape from "cytoscape";
import { GameGraph, ParityGameSolver } from "./zielonka_recursive_algo";

// Example usage:
const gameGraph: GameGraph = {
  edges: new Map([
    ["0", ["1", "3"]],
    ["1", ["0", "4", "6"]],
    ["2", ["3", "5"]],
    ["3", ["2"]],
    ["4", ["1"]],
    ["5", ["5", "8"]],
    ["6", ["1"]],
    ["8", ["2", "5"]],
  ]),
  priorities: new Map([
    ["0", 0],
    ["1", 1],
    ["2", 2],
    ["3", 3],
    ["4", 4],
    ["5", 5],
    ["6", 6],
    ["8", 8],
  ]),
};

const solver = new ParityGameSolver(gameGraph);
const solution = solver.solve();
console.log("Winning regions:", solution);

let pg = new PG.ParityGame();
let id = 0;
let cy = cytoscape({
  container: document.getElementById("cy"),
  elements: [],
  style: [
    {
      selector: 'node[isEven = "true"]',
      style: {
        shape: "ellipse", // Round shape for even nodes
        //'background-color': '#66CCFF', // Example color
        // Define other styles as needed
      },
    },
    {
      selector: 'node[isEven = "false"]',
      style: {
        shape: "rectangle", // Square shape for odd nodes
        //'background-color': '#FF6666', // Example color
        // Define other styles as needed
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "bezier", // This makes the edge curved, which helps visually with arrow positioning
        "target-arrow-shape": "triangle", // This creates a directed edge with an arrow pointing to the target node
        //'target-arrow-color': '#000', // Optionally set the arrow color
        //'line-color': '#000' // Optionally set the line color
      },
    },
  ],
});
let mouseX: number = 0;
let mouseY: number = 0;
let firstNodeId: string = null;

document.addEventListener("mousemove", (event: MouseEvent) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

document.addEventListener("keydown", (event: KeyboardEvent) => {
  // const position = cy.container().getBoundingClientRect();
  // const relativeX = mouseX - position.left + window.scrollX; // Adjusting for scrolling
  // const relativeY = mouseY - position.top + window.scrollY; // Adjusting for scrolling

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
  }
});

function addNodeAtPosition(x: number, y: number, isEven: boolean) {
  id = pg.addNode(0, isEven ? PG.Player.Even : PG.Player.Odd);
  cy.add({
    group: "nodes",
    data: {
      id: String(id),
      isEven: String(isEven), // Store isEven as a string to match the selector
    },
    position: { x: x, y: y },
  });
  cy.resize();
}

function addEdge(nodeId: number) {
  cy.add({
    group: "edges",
    data: { source: firstNodeId, target: nodeId },
  });
}

cy.on("tap", "node", function (evt) {
  const nodeId = evt.target.id();
  if (firstNodeId === null) {
    // If no node is selected yet, store the current node's ID
    firstNodeId = nodeId;
  } else if (firstNodeId !== nodeId) {
    // If a different node is clicked, create an edge from the first node to this one
    addEdge(nodeId);

    // Reset firstNodeId for the next selection
    firstNodeId = null;
  }

  cy.on("tap", function (event) {
    const evtTarget = event.target;

    if (evtTarget === cy) {
      // The tap was on the core background, not on any element
      firstNodeId = null; // Deselect any selected node

      // Optional: remove any visual indication of selection
      // This could be adjusting styles or classes on previously selected nodes
    }
  });
  // If the same node is clicked again, you might want to reset firstNodeId or do nothing
  // This part of logic can be adjusted based on the desired behavior
});
