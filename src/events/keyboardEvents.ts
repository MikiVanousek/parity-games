import * as cytoscape from "cytoscape";
import { showToast } from "../ui/toast";
import { assert } from "../assert";
import { KeyMapping, mappings } from "../keymap";

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
  const categoryMap = new Map<string, KeyMapping[]>()
  for (const mapping of mappings) {
    if (!categoryMap.has(mapping.category)) {
      categoryMap.set(mapping.category, [])
    }
    categoryMap.get(mapping.category).push(mapping)
  }

  const manual = document.getElementById("manual-keybinds");
  manual.innerHTML = ''
  for (const [category, categoryMappings] of categoryMap) {
    manual.appendChild(document.createElement("h3")).textContent = category
    for (const kb of categoryMappings) {
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
