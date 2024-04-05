import { addNodeAtPosition, copySelectedElements, pasteCopiedElements } from "../events/graphEvents";
import { KeyMap, KeyMapping, buildKeyMap } from "./keymapTypes";

export const otherMappings = new KeyMap("Other mappings");
otherMappings.push(new KeyMapping(
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

export const cmdMappings = new KeyMap("Command mappings");
cmdMappings.key_to_string = (key) => "⌘ + " + key;
cmdMappings.push(new KeyMapping(
  ["c"],
  "Copy selected elements",
  ({ cy }) => {
    copySelectedElements(cy);
  }
));

cmdMappings.push(new KeyMapping(
  ["v"],
  "Paste copied elements",
  ({ cy, ur }) => {
    pasteCopiedElements(cy, ur);
  },
));

cmdMappings.push(new KeyMapping(
  ["z"],
  "Undo last action",
  ({ ur, event }) => {
    if (event.ctrlKey || event.metaKey) {
      ur.undo();
    }
  },
));

cmdMappings.push(new KeyMapping(
  ["y"],
  "Redo last action",
  ({ ur, event }) => {
    if (event.ctrlKey || event.metaKey) {
      ur.redo();
    }
  },
));

export const pgEditingMappings = new KeyMap("Parity game editing mappings");

pgEditingMappings.push(new KeyMapping(
  ["e"],
  "Add even node at the cursor position",
  (args) => {
    addNodeAtPosition(args.cy, args.ur, args.modelX, args.modelY, true);
  }
));

pgEditingMappings.push(new KeyMapping(
  ["o", "w"],
  "Add odd node at the cursor position",
  (args) => {
    addNodeAtPosition(args.cy, args.ur, args.modelX, args.modelY, false);
  }
));

pgEditingMappings.push(new KeyMapping(
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

pgEditingMappings.push(new KeyMapping(
  ["Backspace", "Delete"],
  "Remove selected elements",
  ({ cy, ur }) => {
    var selectedElements = cy.$(":selected");
    if (selectedElements.length > 0) {
      ur.do("remove", selectedElements);
    }
  }
));

pgEditingMappings.push(new KeyMapping(
  ["+", "="],
  "Increment priority",
  ({ cy, ur }) => {
    var selectedNodes = cy.$("node:selected");
    ur.do("changePriority", { nodes: selectedNodes, value: 1 });
  }
));

pgEditingMappings.push(new KeyMapping(
  ["-"],
  "Decrement priority",
  ({ cy, ur }) => {
    var selectedNodes = cy.$("node:selected");
    ur.do("changePriority", { nodes: selectedNodes, value: -1 });
  }
));

pgEditingMappings.push(new KeyMapping(
  ["p"],
  "Set priority for selected nodes",
  ({ cy, ur }) => {
    let priority = Number(
      prompt("Enter new priority", "")
    );
    if (priority !== null && !isNaN(priority)) {
      let selectedNodes = cy.$("node:selected");
      if (selectedNodes.length > 0) {
        ur.do("editPriority", {
          nodes: selectedNodes,
          priority: priority,
        });
      }
    }
  }
));

export const traceKeymap = new KeyMap("When trace is loaded");
traceKeymap.push(new KeyMapping(
  ["ArrowRight"],
  "Next step",
  (args) => {
    const manual_overlay = document.getElementById("manual-overlay");
    if (manual_overlay.style.display === "none") {
      manual_overlay.style.display = "";
    } else {
      manual_overlay.style.display = "none";
    }
  }
));


export const all_keymaps = [otherMappings, cmdMappings, pgEditingMappings, traceKeymap]