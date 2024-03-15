import { PG } from "./board/PGBoard";
import { Player } from "./board/Node";

import * as cytoscape from "cytoscape";
const cola = require("cytoscape-cola");

//d3test(document.querySelector<HTMLElement>("#d3-test")!);
let pg = new PG.ParityGame();
let id = 0;
cytoscape.use(cola);

// default layout options
var colaLayout: any = {
  name: "cola",
  refresh: 1, // number of ticks per frame; higher is faster but more jerky
  animate: true, // whether to show the layout as it's running
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  fit: true, // on every layout reposition of nodes, fit the viewport
  padding: 100, // padding around the simulation
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

  // layout event callbacks
  ready: function () {}, // on layoutready
  stop: function () {}, // on layoutstop

  // positioning options
  randomize: false, // use random node positions at beginning of layout
  avoidOverlap: true, // if true, prevents overlap of node bounding boxes
  handleDisconnected: true, // if true, avoids disconnected components from overlapping
  convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
  nodeSpacing: function (node: any) {
    return 5;
  }, // extra spacing around nodes
  flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
  alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
  gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
  centerGraph: true, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)

  // different methods of specifying edge length
  // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
  edgeLength: undefined,
  edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
  edgeJaccardLength: undefined, // jaccard edge length in simulation

  // iterations of cola algorithm; uses default values on undefined
  unconstrIter: undefined, // unconstrained initial layout iterations
  userConstIter: undefined, // initial layout iterations with user-specified constraints
  allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
};

pg.addNode(1, Player.Even);
pg.addNode(8, Player.Odd);
pg.addNode(9, Player.Even);
pg.addNode(5, Player.Odd);
pg.addNode(7, Player.Even);
pg.addNode(3, Player.Odd);
pg.addNode(6, Player.Even);
pg.addNode(4, Player.Odd);
pg.addNode(0, Player.Even);
pg.addNode(2, Player.Odd);
// pg.addNode(10, Player.Even);

// Adding links between nodes
pg.addLinkFromNodes(pg.nodes[0], pg.nodes[8]);
pg.addLinkFromNodes(pg.nodes[1], pg.nodes[9]);
pg.addLinkFromNodes(pg.nodes[2], pg.nodes[9]);
pg.addLinkFromNodes(pg.nodes[3], pg.nodes[2]);
pg.addLinkFromNodes(pg.nodes[4], pg.nodes[7]);
pg.addLinkFromNodes(pg.nodes[5], pg.nodes[8]);
pg.addLinkFromNodes(pg.nodes[6], pg.nodes[9]);
pg.addLinkFromNodes(pg.nodes[7], pg.nodes[6]);
pg.addLinkFromNodes(pg.nodes[8], pg.nodes[2]);
pg.addLinkFromNodes(pg.nodes[9], pg.nodes[0]);
pg.addLinkFromNodes(pg.nodes[3], pg.nodes[9]);
pg.addLinkFromNodes(pg.nodes[2], pg.nodes[1]);
pg.addLinkFromNodes(pg.nodes[4], pg.nodes[0]);
pg.addLinkFromNodes(pg.nodes[8], pg.nodes[4]);
pg.addLinkFromNodes(pg.nodes[8], pg.nodes[3]);

// console.log(JSON.stringify(pg.getElementDefinition()));

let cy = cytoscape({
  container: document.getElementById("cy"),
  autounselectify: false,
  elements: [],
  boxSelectionEnabled: false,
  style: [
    {
      selector: 'node[isEven = "true"]',
      style: {
        shape: "ellipse", // Round shape for even nodes
        content: "data(priority)",
        "text-valign": "center",
        "text-halign": "center",
        color: "white",
        // 'background-color': '#66CCFF', // Example color
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
        // 'background-color': '#FF6666', // Example color
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

const cyContainer = cy.container();
var layout = cy.layout(colaLayout);
layout.run();

cy.on("drag", "node", function () {
  // use throttle function to make layout smooth
  layout.run();
});

let copiedElements: cytoscape.ElementDefinition[] = [];
let mouseX: number = 0;
let mouseY: number = 0;

document.getElementById("file").addEventListener("change", function (event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) {
    console.log("No file selected.");
    return;
  }

  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    // Asserting that e.target is a FileReader
    const fileContent = (e.target as FileReader).result;
    loadParityGameFromFileContent(fileContent as string);
  };
  reader.readAsText(file);
});

function loadParityGameFromFileContent(fileContent: any) {
  pg.loadFromFile(fileContent);

  // Re-initialize cytoscape with the new elements
  cy.elements().remove(); // Remove existing elements
  cy.json({ elements: pg.getElementDefinition() });
  console.log(JSON.stringify(pg.getElementDefinition()));

  // Apply layout again if needed
  layout.run();
}

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
  id = pg.addNode(0, isEven ? Player.Even : Player.Odd);

  cy.add({
    data: {
      id: String(id) + "testing node",
      isEven: String(isEven), // Store isEven as a string to match the selector
      priority: 1,
    },
    position: { x: x, y: y },
  });
  cy.fit(cy.elements(), 20);
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
  true,
);
