import { PG } from "./board/PGBoard";
import { Player } from "./board/Node";
import LayoutManager from "./layout/layoutManager";

declare global {
  interface Window {
    $: typeof import("jquery");
  }
}
const EVEN_COLOR = "#7A7A7A";
const ODD_COLOR = "#ADADAD";
const SELECTION_COLOR = "#0169D9";

var cytoscape = require("cytoscape");
var jquery = require("jquery");
var konva = require("konva");
var edgeEditing = require("./cytoscape-edge-editing/src/index.js");
var contextMenus = require("cytoscape-context-menus");
var undoRedo = require("cytoscape-undo-redo");
var cola = require("cytoscape-cola");
window.$ = jquery;
undoRedo(cytoscape);
contextMenus(cytoscape); // This line is crucial
edgeEditing(cytoscape, jquery, konva);
cytoscape.use(cola);

let pg = new PG.ParityGame();
pg.addNodeWith(1, Player.Even);
pg.addNodeWith(8, Player.Odd);
pg.addNodeWith(9, Player.Even);
pg.addNodeWith(5, Player.Odd);
pg.addNodeWith(7, Player.Even);
pg.addNodeWith(3, Player.Odd);
pg.addNodeWith(6, Player.Even);
pg.addNodeWith(4, Player.Odd);
pg.addNodeWith(0, Player.Even);
pg.addNodeWith(2, Player.Odd);
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

// const pgUI = new PG.PGDBoard(pg);
let cy = cytoscape({
  container: document.getElementById("cy"),
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
  ],
});
const cyContainer = cy.container();
let copiedElements: cytoscape.ElementDefinition[] = [];
const defaultLayout = "Force directed";

cy.edgeEditing({
  anchorShapeSizeFactor: 6,
  enableMultipleAnchorRemovalOption: true,
  enableCreateAnchorOnDrag: true,
  zIndex: 0,
  undoable: true,
});

cy.style().update();

let ur = cy.undoRedo({
  isDebug: true,
});

cy.add(pg.getElementDefinition());
const layoutManager = new LayoutManager(cy, defaultLayout);
layoutManager.runOnce();


function resetSettings() {
  const layoutOnDrag = document.getElementById('layout-on-drag') as HTMLInputElement;
  const displayLabels = document.getElementById('display-labels') as HTMLInputElement;

  layoutOnDrag.checked = false;
  displayLabels.checked = false;
}

document.addEventListener("DOMContentLoaded", function () {
  const layoutSelect = document.getElementById('layout-select') as HTMLSelectElement;

  // Dynamically populate the layout select dropdown
  for (const layoutName in layoutManager.layouts) {
    if (layoutManager.layouts.hasOwnProperty(layoutName)) {
      const option = document.createElement('option');
      option.value = layoutName;
      option.textContent = layoutName;
      layoutSelect.appendChild(option);
    }
  }
  layoutSelect.value = defaultLayout;

  resetSettings();
});

cy.on("afterDo", function (e, name) {
  console.log("afterDo", name);
});

let mouseX: number = 0;
let mouseY: number = 0;

function resetBoardVisuals() {
  const elements = pg.getElementDefinition();
  cy.elements().remove(); // Clear the current graph
  cy.add(elements); // Add the new elements
  layoutManager.runOnce();
}

// this export the visuals and also the pg object
(window as any).handleExportGame = function () {
  const cyState = cy.elements().jsons();
  const game = pg.exportToOink();

  const exportData = {
    cytoscapeState: cyState,
    gameState: game
  };

  const exportString = JSON.stringify(exportData, null, 2);

  const file = new Blob([exportString], { type: "application/json" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = pg.name + ".json";
  a.click();
};


(window as any).handleImportGame = function (event) {
  const file = event.target.files[0];

  if (file) {
    updateGraphFileName(file.name);

    const reader = new FileReader();

    reader.onload = function (loadEvent) {
      try {
        const fileContent = loadEvent.target.result as string;
        const importedData = JSON.parse(fileContent);

        cy.elements().remove();
        resetSettings();
        cy.add(importedData.cytoscapeState);
        cy.fit(cy.elements(), 50);

        // remove just the .json part
        var fileName = file.name.replace(/\.[^/.]+$/, "");
        pg.loadFromFile(importedData.gameState, fileName);
      } catch (error) {
        console.error("Error importing game:", error);
      }
    };

    reader.readAsText(file);
  }
};

(window as any).exportAsPng = function () {
  const png = cy.png({ full: true });
  const a = document.createElement("a");
  a.href = png;
  a.download = pg.name + ".png";
  a.click();
};

(window as any).handleFileSelect = function (event) {
  const file = event.target.files[0];

  if (file) {
    updateGraphFileName(file.name);

    const reader = new FileReader();

    reader.onload = function (loadEvent) {
      const fileContent = loadEvent.target.result as string;

      pg.loadFromFile(fileContent, file.name);

      resetBoardVisuals();
    };

    reader.readAsText(file);
  }
};

cy.on("drag", "node", function () {
  layoutManager.runLayout()
});

function updateGraphFileName(name: string) {
  const fileNameDisplay = document.getElementById('file-name-display');
  if (fileNameDisplay) {
    fileNameDisplay.textContent = "File: " + name;
    fileNameDisplay.title = name;
  }
}


(window as any).changeLayout = function (e: any) {
  layoutManager.changeLayout(e.target.value);
  // decheck the layout on layout-on-drag 
  const toggle = document.getElementById('layout-on-drag') as HTMLInputElement;
  toggle.checked = false;
  layoutManager.toggleLayout(false);
};

(window as any).runLayout = function () {
  layoutManager.runOnce();
};

document.getElementById('layout-on-drag').addEventListener('change', function () {
  layoutManager.toggleLayout((this as HTMLInputElement).checked);
});

document.getElementById('display-labels').addEventListener('change', function () {
  const showLabels = (this as HTMLInputElement).checked;
  cy.nodes().style({
    'label': showLabels ? (ele: any) => `${ele.data("label")}\n${ele.data("priority")}` : '',
    'text-wrap': 'wrap',
  });
});

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
      console.log("e pressed");
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
    case "Backspace":
    case "Delete": {
      var selectedElements = cy.$(":selected");

      // Remove selected elements from the graph
      if (selectedElements.length > 0) {
        ur.do("remove", selectedElements);
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
        // Ensure priority does not go below 0
        node.data("priority", Math.max(0, priority - 1));
      });
      break;
    }
    case "p": {
      cy.elements().forEach(function (ele) {
        console.log(ele.data());
      });
    }
  }

  if ((event.ctrlKey || event.metaKey) && event.key === "c") {
    copySelectedElements();
  }
  // Paste with Ctrl+V or Cmd+V
  if ((event.ctrlKey || event.metaKey) && event.key === "v") {
    pasteCopiedElements();
  }

  if ((event.ctrlKey || event.metaKey) && event.key === "z") {
    ur.undo();
  }

  if ((event.ctrlKey || event.metaKey) && event.key === "y") {
    ur.redo();
  }
});

function copySelectedElements() {
  let selectedEles = cy.$(":selected").jsons();
  // Deep copy and store in global variable
  copiedElements = JSON.parse(JSON.stringify(selectedEles));
}

function pasteCopiedElements() {
  if (copiedElements.length > 0) {
    cy.$(":selected").unselect();
    const offset = 10; // Offset for the pasted elements' position
    let oldid_newid = {};
    let maxId = getNewMaxId();

    copiedElements.sort((a, b) => {
      if (a.group === "nodes" && b.group === "edges") {
        return -1;
      }
      if (a.group === "edges" && b.group === "nodes") {
        return 1;
      }
      return 0;
    });

    let newElements = [];
    copiedElements.map((ele) => {
      if (ele.group === "nodes") {
        oldid_newid[ele.data.id] = maxId;
        ele.data.id = `${maxId}`; // Modify the ID to ensure uniqueness
        ele.position.x += offset;
        ele.position.y += offset;
        maxId++;
        newElements.push(ele);
      } else if (
        ele.group === "edges" &&
        oldid_newid.hasOwnProperty(ele.data.source) &&
        oldid_newid.hasOwnProperty(ele.data.target)
      ) {
        // Adjust source and target for edges to point to the new copied node IDs
        ele.data.id = undefined; // Modify the ID to ensure uniqueness
        ele.data.source = `${oldid_newid[ele.data.source]}`;
        ele.data.target = `${oldid_newid[ele.data.target]}`;
        newElements.push(ele);
      }
    }, []);

    ur.do("add", newElements); // Add the new elements to the Cytoscape instance
    copySelectedElements(); // Copy the newly pasted elements
  }
}

function getNewMaxId() {
  return (
    cy.nodes().reduce((max, node) => {
      const id = parseInt(node.data("id"));
      return isNaN(id) ? max : Math.max(max, id);
    }, 0) + 1
  );
}

function addNodeAtPosition(x: number, y: number, isEven: boolean) {
  ur.do("add", {
    group: "nodes",
    data: {
      id: String(getNewMaxId()),
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
  const isShiftCmdPressed =
    event.originalEvent.shiftKey && event.originalEvent.metaKey;
  if (!isAltPressed && !isShiftCmdPressed) return;

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
      ur.do("add", {
        group: "edges",
        data: { source: selectedNode.id(), target: node.id() },
      });
    }
  });

  selectedNodes.unselect();
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

// Right click context menu
cy.on("cxttap", "node", (event) => {
  const node = event.target;

  // Prevent context menu from showing when shift+cmd is pressed
  const isShiftCmdPressed =
    event.originalEvent.shiftKey && event.originalEvent.metaKey;
  if (isShiftCmdPressed) return;

  event.preventDefault();

  const contextMenu = document.getElementById("context-menu");
  if (contextMenu) {
    contextMenu.style.display = "block";
    contextMenu.style.left = event.originalEvent.clientX + "px";
    contextMenu.style.top = event.originalEvent.clientY + "px";
  }

  const deleteButton = document.getElementById("delete-button");
  if (deleteButton) {
    deleteButton.onclick = () => {
      ur.do("remove", node);
      contextMenu.style.display = "none";
    };
  }
});

cy.on("add", "node, edge", function (event) {
  // update PG Board 
  // pg.addNode(event.target.data("id"), event.target.data("isEven") === "true" ? Player.Even : Player.Odd);
});

cy.on("remove", "node, edge", function (event) {
  // update PG Board shit

});

cy.on("data", "node, edge", function (event) {
  // update PG Board shit
});
