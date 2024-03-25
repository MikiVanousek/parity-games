import { ParityGame } from './board/ParityGame';
import { Player } from "./board/Node";
import LayoutManager from "./layout/layoutManager";
import { PGParser } from './board/PGParser';
import { example_pg } from "../src/board/ExamplePG";
import { setupTraceUI } from './TraceUI';
import { cy, defaultLayout, layoutManager, ur } from './Cytosetup';

setupTraceUI()
let pg = example_pg;
cy.add(pg.getElementDefinition());


declare global {
  interface Window {
    $: typeof import("jquery");
  }
}

var jquery = require("jquery");
var konva = require("konva");
var edgeEditing = require("./cytoscape-edge-editing/src/index.js");
var contextMenus = require("cytoscape-context-menus");
var undoRedo = require("cytoscape-undo-redo");
var cola = require("cytoscape-cola");
window.$ = jquery;

function resetSettings() {
  const layoutOnDrag = document.getElementById(
    "layout-on-drag"
  ) as HTMLInputElement;
  const displayLabels = document.getElementById(
    "display-labels"
  ) as HTMLInputElement;

  layoutOnDrag.checked = false;
  displayLabels.checked = false;
}

document.addEventListener("DOMContentLoaded", function () {
  const layoutSelect = document.getElementById(
    "layout-select"
  ) as HTMLSelectElement;

  // Dynamically populate the layout select dropdown
  for (const layoutName in layoutManager.layouts) {
    if (layoutManager.layouts.hasOwnProperty(layoutName)) {
      const option = document.createElement("option");
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


function resetBoardVisuals() {
  const elements = pg.getElementDefinition();
  cy.elements().remove(); // Clear the current graph
  cy.add(elements); // Add the new elements
  layoutManager.runOnce();
}

// this export the visuals and also the pg object
(window as any).handleExportGame = function () {
  const cyState = cy.elements().jsons();
  const game = PGParser.export_pg_format(pg);

  const exportData = {
    cytoscapeState: cyState,
    gameState: game,
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
        // pg.loadFromFile(importedData.gameState, fileName);
        cy.pg = PGParser.import_pg_format(importedData.gameState);
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

      pg = PGParser.import_pg_format(fileContent);
      resetBoardVisuals();
    };

    reader.readAsText(file);
  }
};

function updateGraphFileName(name: string) {
  const fileNameDisplay = document.getElementById("file-name-display");
  if (fileNameDisplay) {
    fileNameDisplay.textContent = "File: " + name;
    fileNameDisplay.title = name;
  }
}


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

cy.on("cxttap", "node", function (event) {
  const node = event.target;
  let menu = document.getElementById("custom-context-menu");

  menu.style.left = event.renderedPosition.x + "px";
  menu.style.top = event.renderedPosition.y + "px";
  menu.style.display = "block";

  // Function to hide the menu
  function hideMenu() {
    menu.style.display = "none";
  }

  // Hide the menu on any click
  window.addEventListener("click", hideMenu);

  // Edit priority action
  document.getElementById("edit-priority").onclick = function () {
    let priority = prompt("Enter new priority", node.data("priority") || "");
    if (priority !== null) {
      let selectedNodes = cy.$("node:selected");
      if (selectedNodes.length > 0) {
        ur.do("editPriority", {
          nodes: selectedNodes,
          priority: priority,
        });
      }
    }
    hideMenu();
  };
});
