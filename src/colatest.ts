import { PG } from "./pg_diagram";
import * as cytoscape from "cytoscape";
const cola = require("cytoscape-cola");

//d3test(document.querySelector<HTMLElement>("#d3-test")!);
let pg = new PG.ParityGame();
let id = 0;
cytoscape.use(cola);

// default layout options
var colaLayout: any = {
  name: "cola",
  animate: true, // whether to show the layout as it's running
  refresh: 1, // number of ticks per frame; higher is faster but more jerky
  maxSimulationTime: 4000, // max length in ms to run the layout
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
    return 10;
  }, // extra spacing around nodes
  flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
  alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
  gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
  centerGraph: true, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)

  // different methods of specifying edge length
  // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
  edgeLength: undefined, // sets edge length directly in simulation
  edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
  edgeJaccardLength: undefined, // jaccard edge length in simulation

  // iterations of cola algorithm; uses default values on undefined
  unconstrIter: undefined, // unconstrained initial layout iterations
  userConstIter: undefined, // initial layout iterations with user-specified constraints
  allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
};

let cy = cytoscape({
  container: document.getElementById("cy"),
  autounselectify: true,

  elements: [
    // Nodes
    {
      data: { id: "n0", priority: 0, isEven: "true" },
    },
    {
      data: { id: "n1", priority: 1, isEven: "false" },
    },
    {
      data: { id: "n2", priority: 2, isEven: "true" },
    },
    {
      data: { id: "n3", priority: 3, isEven: "false" },
    },
    {
      data: { id: "n4", priority: 4, isEven: "true" },
    },
    {
      data: { id: "n5", priority: 5, isEven: "false" },
    },
    {
      data: { id: "n6", priority: 6, isEven: "true" },
    },

    // Edges
    { data: { id: "e0", priority: 0, source: "n0", target: "n1" } },
    { data: { id: "e1", priority: 1, source: "n1", target: "n2" } },
    { data: { id: "e2", priority: 2, source: "n2", target: "n3" } },
    { data: { id: "e3", priority: 3, source: "n3", target: "n4" } },
    { data: { id: "e4", priority: 4, source: "n4", target: "n0" } },
  ],

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
// apply layout with name
cy.layout(colaLayout).run();
let copiedElements: cytoscape.ElementDefinition[] = [];
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
  true,
);
