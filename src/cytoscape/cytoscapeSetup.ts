var jquery = require("jquery");
window.$ = jquery;
var cytoscape = require("cytoscape");
var konva = require("konva");
var edgeEditing = require("../cytoscape-edge-editing/src/index.js");
var contextMenus = require("cytoscape-context-menus");
var undoRedo = require("cytoscape-undo-redo");
var cola = require("cytoscape-cola");

export function setupCytoscape(containerId: string) {
  const EVEN_COLOR = "#7A7A7A";
  const ODD_COLOR = "#ADADAD";
  const SELECTION_COLOR = "#0169D9";
  // Initialize Cytoscape with a configuration object
  let cy = cytoscape({
    container: document.getElementById(containerId),
    elements: [],
    style: [
      {
        selector: "node",
        style: {
          width: "25",
          height: "25",
          content: "data(priority)",
          "text-valign": "center",
          "text-halign": "center",
          color: "white",
          "font-size": "10px",
        },
      },
      {
        selector: 'node[isEven = "true"]',
        style: {
          shape: "ellipse", // Round shape for even nodes
          "background-color": EVEN_COLOR,
        },
      },
      {
        selector: 'node[isEven = "false"]',
        style: {
          shape: "rectangle", // Square shape for odd nodes
          "background-color": ODD_COLOR,
        },
      },
      {
        selector: "node:selected",
        style: {
          "background-color": SELECTION_COLOR,
        },
      },
      {
        selector: "node[background_color]",
        style: {
          "background-color": "data(background_color)",
          "text-outline-color": "data(background_color)",
        },
      },
      {
        selector: "edge",
        style: {
          "curve-style": "bezier", // This makes the edge curved, which helps visually with arrow positioning
          "target-arrow-shape": "triangle", // This creates a directed edge with an arrow pointing to the target node
          //width: "1",
          //"arrow-scale": "0.5",
          //'target-arrow-color': '#000', // Optionally set the arrow color
          //'line-color': '#000' // Optionally set the line color
        },
      },
      {
        selector: "edge:selected",
        style: {
          "line-color": SELECTION_COLOR, // Example selection color for edges
          "target-arrow-color": SELECTION_COLOR, // Make sure the arrow matches the line
          //'width': 4, // Optionally increase the width for visibility
        },
      },
      {
        selector: "edge[line_color]",
        style: {
          "line-color": "data(line_color)",
          "target-arrow-color": "data(line_color)",
        },
      },
      {
        selector: ":parent",
        style: {
          "background-opacity": 0.333,
          "background-color": "grey",
          "border-width": 2,
          "border-color": "white",
          "border-style": "solid",
        },
      },
    ],
  });
  undoRedo(cytoscape);
  contextMenus(cytoscape); // This line is crucial
  edgeEditing(cytoscape, jquery, konva);
  cytoscape.use(cola);

  let ur = cy.undoRedo({
    isDebug: true,
  });

  cy.edgeEditing({
    anchorShapeSizeFactor: 6,
    enableMultipleAnchorRemovalOption: true,
    enableCreateAnchorOnDrag: true,
    zIndex: 0,
    undoable: true,
  });

  cy.style().update();

  return [cy, ur]; // Return the Cytoscape instance for further use
}
