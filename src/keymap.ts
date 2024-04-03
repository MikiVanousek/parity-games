import { addNodeAtPosition, copySelectedElements, pasteCopiedElements } from "./events/graphEvents";

export type KeyActionArgs = {
  cy: cytoscape.Core;
  ur: any;
  modelX: number;
  modelY: number;
  event: KeyboardEvent;
};

export class KeyMapping {
  keys: string[]
  description: string
  action: (KeyActionArgs) => void
  editing_pg: boolean
  requires_modifier: boolean
  category: string
  constructor(keys: string[], description: string, action: (KeyActionArgs) => void, requires_modifier: boolean = false, category: string = "Other", editing_pg: boolean = true,) {
    this.keys = keys
    this.description = description
    this.action = action;
    this.editing_pg = editing_pg;
    this.requires_modifier = requires_modifier
    this.category = category
  }
}

export const mappings: KeyMapping[] = []
mappings.push(new KeyMapping(
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
))

mappings.push(new KeyMapping(
  ["e"],
  "Add even node at the cursor position",
  (args) => {
    addNodeAtPosition(args.cy, args.ur, args.modelX, args.modelY, true);
  }
))

mappings.push(new KeyMapping(
  ["o"],
  "Add odd node at the cursor position",
  (args) => {
    addNodeAtPosition(args.cy, args.ur, args.modelX, args.modelY, false);
  }
))

mappings.push(new KeyMapping(
  ["q"],
  "Toggle the parity of selected nodes",
  (args) => {
    var selectedNodes = args.cy.$("node:selected");
    selectedNodes.forEach((node) => {
      let currentIsEven = node.data("isEven");
      node.data("isEven", currentIsEven === "true" ? "false" : "true");
    });
  }
))

mappings.push(new KeyMapping(
  ["Backspace", "Delete"],
  "Remove selected elements",
  ({ cy, ur }) => {
    var selectedElements = cy.$(":selected");
    if (selectedElements.length > 0) {
      ur.do("remove", selectedElements);
    }
  }
));

mappings.push(new KeyMapping(
  ["+", "="],
  "Increment priority",
  ({ cy, ur }) => {
    var selectedNodes = cy.$("node:selected");
    ur.do("changePriority", { nodes: selectedNodes, value: 1 });
  }
));

mappings.push(new KeyMapping(
  ["-"],
  "Decrement priority",
  ({ cy, ur }) => {
    var selectedNodes = cy.$("node:selected");
    ur.do("changePriority", { nodes: selectedNodes, value: -1 });
  }
));

mappings.push(new KeyMapping(
  ["p"],
  "Paste selected elements",
  ({ cy }) => {
    cy.elements().forEach(function (ele) {
      console.log(ele.data());
    });
  }
));

mappings.push(new KeyMapping(
  ["c"],
  "Copy selected elements",
  ({ cy }) => {
    copySelectedElements(cy);
  },
  true,
));

mappings.push(new KeyMapping(
  ["v"],
  "Paste copied elements",
  ({ cy, ur }) => {
    pasteCopiedElements(cy, ur);
  },
  true
));

mappings.push(new KeyMapping(
  ["z"],
  "Undo last action",
  ({ ur, event }) => {
    if (event.ctrlKey || event.metaKey) {
      ur.undo();
    }
  },
  true
));

mappings.push(new KeyMapping(
  ["y"],
  "Redo last action",
  ({ ur, event }) => {
    if (event.ctrlKey || event.metaKey) {
      ur.redo();
    }
  },
  true
));
