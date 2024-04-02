import * as cytoscape from "cytoscape";
import {
  addNodeAtPosition,
  copySelectedElements,
  pasteCopiedElements,
} from "./graphEvents";
import { showToast } from "../ui/toast";
import { assert } from "../assert";
import { requiresArg } from "yargs";

type KeyActionArgs = {
  cy: cytoscape.Core;
  ur: any;
  modelX: number;
  modelY: number;
  event: KeyboardEvent;
};
class KeyMapping {
  keys: string[]
  description: string
  action: (KeyActionArgs) => void
  editing_pg: boolean
  requires_modifier: boolean
  constructor(keys: string[], description: string, action: (KeyActionArgs) => void, requires_modifier: boolean = false, editing_pg: boolean = true,) {
    this.keys = keys
    this.description = description
    this.action = action;
    this.editing_pg = editing_pg;
    this.requires_modifier = requires_modifier
  }
}

const mappings: KeyMapping[] = []
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
  ["+"],
  "Increment priority",
  ({ cy }) => {
    var selectedNodes = cy.$("node:selected");
    selectedNodes.forEach((node) => {
      var priority = node.data("priority") || 0;
      node.data("priority", priority + 1);
    });
  }
));

mappings.push(new KeyMapping(
  ["-"],
  "Decrement priority",
  ({ cy }) => {
    var selectedNodes = cy.$("node:selected");
    selectedNodes.forEach((node) => {
      var priority = node.data("priority") || 0;
      node.data("priority", Math.max(0, priority - 1));
    });
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

// Redo
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

function buildKeyMap(keyMappings: KeyMapping[]): Map<string, KeyMapping> {
  const keyMap = new Map<string, KeyMapping>()
  for (const mapping of keyMappings) {
    for (const key of mapping.keys) {
      assert(!keyMap.has(key), `Duplicate key mapping for key ${key}`)
      keyMap.set(key, mapping)
    }
  }
  return keyMap
}
function fillManual(mappings: KeyMapping[]): void {
  const manual = document.getElementById("manual-keybinds");
  manual.innerHTML = ''
  for (const kb of mappings) {
    const entryDiv = document.createElement("div");
    entryDiv.className = "manual-entry";
    const keysDiv = document.createElement("div");
    keysDiv.className = "manual-keys";
    for (let key of kb.keys) {
      if (kb.requires_modifier) {
        key = "⌘ + " + key
      }
      const keyDiv = document.createElement("div");
      keyDiv.className = "manual-key";
      keyDiv.textContent = key;
      keysDiv.appendChild(keyDiv);
    }
    entryDiv.appendChild(keysDiv);
    entryDiv.appendChild(document.createTextNode(kb.description));
    manual.appendChild(entryDiv)
  }

}

export function setupKeyboardEvents(cy: cytoscape.Core, ur) {
  fillManual(mappings)
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
  const keyMap = buildKeyMap(mappings)
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    const zoom = cy.zoom();
    const pan = cy.pan();


    // Convert the mouse coordinates to the model coordinates
    const modelX = (mouseX - pan.x) / zoom;
    const modelY = (mouseY - pan.y) / zoom;

    if (keyMap.has(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      const km = keyMap.get(event.key)
      if (km.editing_pg && window.traceManager.hasTrace()) {
        showToast({
          message: "Can not change parity game while a trace is loaded. Attempted: \n" + km.description,
          variant: "danger",
        });
        return;
      }
      else {
        if (km.requires_modifier && (event.ctrlKey || event.metaKey)) {
          km.action({ cy, ur, modelX, modelY, event })
        }
        if (!km.requires_modifier) {
          km.action({ cy, ur, modelX, modelY, event })
        }
      }
    }
  });

}
