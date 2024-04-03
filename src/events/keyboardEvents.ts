import * as cytoscape from "cytoscape";
import {
  addNodeAtPosition,
  copySelectedElements,
  pasteCopiedElements,
} from "./graphEvents";
import { showToast } from "../ui/toast";

export function setupKeyboardEvents(cy: cytoscape.Core, ur) {
  let mouseX: number = 0;
  let mouseY: number = 0;

  const cyContainer = cy.container();
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

  document.addEventListener("mousemove", (mouseEvent: MouseEvent) => {
    mouseX = mouseEvent.clientX;
    mouseY = mouseEvent.clientY;
  });

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    const zoom = cy.zoom();
    const pan = cy.pan();

    // Convert the mouse coordinates to the model coordinates
    const modelX = (mouseX - pan.x) / zoom;
    const modelY = (mouseY - pan.y) / zoom;

    const pgEditingKeys = [
      "e",
      "o",
      "q",
      "Backspace",
      "Delete",
      "+",
      "-",
      "p",
      "c",
      "v",
      "z",
      "y",
    ];
    if (window.traceManager.hasTrace() && pgEditingKeys.includes(event.key)) {
      showToast({
        message: "Can not change parity game while a trace is loaded.",
        variant: "danger",
      });
      return;
    }
    switch (event.key) {
      case "e":
        addNodeAtPosition(cy, ur, modelX, modelY, true);
        break;
      case "o":
        if (window.traceManager.hasTrace()) {
          showToast({
            message: "Can not change parity game while a trace is loaded.",
            variant: "danger",
          });
          break;
        }
        addNodeAtPosition(cy, ur, modelX, modelY, false);
        break;
      case "q":
        toggleNodeParity(cy);
        break;
      case "Backspace":
      case "Delete":
        removeSelectedElements(cy, ur);
        break;
      case "+":
        incrementPriority(cy);
        break;
      case "-":
        decrementPriority(cy);
        break;
      case "p":
        printElementsData(cy);
        break;
      case "c":
        if (event.ctrlKey || event.metaKey) {
          copySelectedElements(cy);
        }
        break;
      case "v":
        if (event.ctrlKey || event.metaKey) {
          pasteCopiedElements(cy, ur);
        }
        break;
      case "z":
        if (event.ctrlKey || event.metaKey) {
          ur.undo();
        }
        break;
      case "y":
        if (event.ctrlKey || event.metaKey) {
          ur.redo();
        }
        break;
    }
  });
}

function toggleNodeParity(cy: cytoscape.Core) {
  var selectedNodes = cy.$("node:selected");
  selectedNodes.forEach((node) => {
    let currentIsEven = node.data("isEven");
    node.data("isEven", currentIsEven === "true" ? "false" : "true");
  });
}

function removeSelectedElements(cy: cytoscape.Core, ur) {
  var selectedElements = cy.$(":selected");
  if (selectedElements.length > 0) {
    ur.do("remove", selectedElements);
  }
}

function incrementPriority(cy: cytoscape.Core) {
  var selectedNodes = cy.$("node:selected");
  selectedNodes.forEach((node) => {
    var priority = node.data("priority") || 0;
    node.data("priority", priority + 1);
  });
}

function decrementPriority(cy: cytoscape.Core) {
  var selectedNodes = cy.$("node:selected");
  selectedNodes.forEach((node) => {
    var priority = node.data("priority") || 0;
    node.data("priority", Math.max(0, priority - 1));
  });
}

function printElementsData(cy: cytoscape.Core) {
  cy.elements().forEach(function (ele) {
    console.log(ele.data());
  });
}
