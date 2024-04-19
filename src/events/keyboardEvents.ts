// In this file, we keep track of the mouse movement, register key presses and trigger keymaps.
import * as cytoscape from "cytoscape";
import { showToast } from "../ui/toast";
import { cmdMappings, otherMappings, pgEditingMappings, traceKeymap } from "../keymap/keymap";

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

    // skip the keybinds from KeyBoardEvents if the user is typing in an input field
    const isTyping = (document.activeElement.tagName.toLowerCase() == "input" && (document.activeElement as HTMLInputElement).type == "text") || document.activeElement.tagName.toLowerCase() == "textarea";
    if (isTyping) return;

    let km;
    if (km = otherMappings.keyMap.get(event.key)) {
      km.action({ cy, ur, modelX, modelY, event })
      event.preventDefault();
      event.stopPropagation();
    } else if (window.traceManager.hasTrace()) {
      if (km = traceKeymap.keyMap.get(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        km.action({ cy, ur, modelX, modelY, event });
        return;
      } else if (km = pgEditingMappings.keyMap.get(event.key) || (km = cmdMappings.keyMap.get(event.key))) {
        showToast({
          message: "Can not change parity game while a trace is loaded. Attempted: \n" + km.description,
          variant: "danger",
        });
        return;
      }
    } else if (event.ctrlKey || event.metaKey) {
      if (cmdMappings.keyMap.has(event.key)) {
        const km = cmdMappings.keyMap.get(event.key);
        event.preventDefault();
        event.stopPropagation();
        km.action({ cy, ur, modelX, modelY, event });
        return;
      } else {
        console.log("No key bind for ⌘ + " + event.key);
      }
    } else if (km = pgEditingMappings.keyMap.get(event.key)) {
      km.action({ cy, ur, modelX, modelY, event })
      event.preventDefault();
      event.stopPropagation();
    } else {
      console.log("No key bind for " + event.key);
    }
  });
}
