import { addNodeAtPosition, copySelectedElements, pasteCopiedElements } from "../events/graphEvents";
import { KeyMapping, buildKeyMap } from "./keymapTypes";


export const keyMappings: KeyMapping[] = [];
keyMappings.push(new KeyMapping(
  ["?", "/"],
  "Toggle manual",
  (args) => {
    const manual_overlay = document.getElementById("manual-overlay");
    if (manual_overlay.style.display === "none") {
      manual_overlay.style.display = "";
    } else {
      manual_overlay.style.display = "none";
    }
  }
));
keyMappings.push(new KeyMapping(
  ["e"],
  "Add even node at the cursor position",
  (args) => {
    console.log(args);
    addNodeAtPosition(args.cy, args.ur, args.modelX, args.modelY, true);
  }
));

keyMappings.push(new KeyMapping(
  ["o"],
  "Add odd node at the cursor position",
  (args) => {
    addNodeAtPosition(args.cy, args.ur, args.modelX, args.modelY, false);
  }
));
keyMappings.push(new KeyMapping(
  ["q"],
  "Toggle the parity of selected nodes",
  (args) => {
    var selectedNodes = args.cy.$("node:selected");
    selectedNodes.forEach((node) => {
      let currentIsEven = node.data("isEven");
      node.data("isEven", currentIsEven === "true" ? "false" : "true");
    });
  }
));
keyMappings.push(new KeyMapping(
  ["Backspace", "Delete"],
  "Remove selected elements",
  ({ cy, ur }) => {
    var selectedElements = cy.$(":selected");
    if (selectedElements.length > 0) {
      ur.do("remove", selectedElements);
    }
  }
));
keyMappings.push(new KeyMapping(
  ["+", "="],
  "Increment priority",
  ({ cy, ur }) => {
    var selectedNodes = cy.$("node:selected");
    ur.do("changePriority", { nodes: selectedNodes, value: 1 });
  }
));
keyMappings.push(new KeyMapping(
  ["-"],
  "Decrement priority",
  ({ cy, ur }) => {
    var selectedNodes = cy.$("node:selected");
    ur.do("changePriority", { nodes: selectedNodes, value: -1 });
  }
));
keyMappings.push(new KeyMapping(
  ["p"],
  "Paste selected elements",
  ({ cy }) => {
    cy.elements().forEach(function (ele) {
      console.log(ele.data());
    });
  }
));
keyMappings.push(new KeyMapping(
  ["c"],
  "Copy selected elements",
  ({ cy }) => {
    copySelectedElements(cy);
  },
  true
));
keyMappings.push(new KeyMapping(
  ["v"],
  "Paste copied elements",
  ({ cy, ur }) => {
    pasteCopiedElements(cy, ur);
  },
  true
));
keyMappings.push(new KeyMapping(
  ["z"],
  "Undo last action",
  ({ ur, event }) => {
    if (event.ctrlKey || event.metaKey) {
      ur.undo();
    }
  },
  true
));
keyMappings.push(new KeyMapping(
  ["y"],
  "Redo last action",
  ({ ur, event }) => {
    if (event.ctrlKey || event.metaKey) {
      ur.redo();
    }
  },
  true
));


export const keyMap = buildKeyMap(keyMappings)