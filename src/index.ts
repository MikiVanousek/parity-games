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

const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", handleTraceFileSelect);

var pg = example_pg;

var [cy, ur] = setupCytoscape("cy");
setupKeyboardEvents(cy, ur);

const cyContainer = cy.container();
const defaultLayout = "Force directed";

ur.action(
  "editPriority",
  (args) => {
    let nodes = args.nodes;
    let priority = args.priority;
    // The do action: updating the priority
    console.log(nodes);
    console.log(priority);
    let oldPriorities = nodes.map((node) => {
      return { node: node, priority: node.data("priority") };
    });
    nodes.forEach(function (n) {
      n.data("priority", priority);
    });
    return { nodes: nodes, oldPriorities: oldPriorities };
  },
  (args) => {
    // The undo action: reverting to the old priorities
    let oldPriorities = args.oldPriorities;
    let newArgs = {
      nodes: args.nodes,
      priority: oldPriorities[0].node.data("priority"),
    };
    oldPriorities.forEach((item) => item.node.data("priority", item.priority));
    return newArgs;
  }
);

cy.add(pg.getElementDefinition());
const layoutManager = new LayoutManager(cy, defaultLayout);
layoutManager.runOnce();

cy.on("afterDo", function (e, name) {
  console.log("afterDo", name);
});

// this export the visuals and also the pg object
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

cy.on("drag", "node", function () {
  layoutManager.runLayout();
});

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
