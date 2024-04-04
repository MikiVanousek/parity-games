import * as cytoscape from "cytoscape";
import { showToast } from "../ui/toast";
import { keyMap } from "../keymap/keymap";

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

    if (keyMap.has(event.key)) {
      // skip the keybinds from KeyBoardEvents if the user is typing in an input field
      var nothingIsFocused = document.activeElement === document.body
      if (!nothingIsFocused) return;

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
