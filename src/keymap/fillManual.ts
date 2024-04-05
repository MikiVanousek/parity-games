import { all_keymaps, cmdMappings, otherMappings, pgEditingMappings } from "./keymap";
import { KeyMapping } from "./keymapTypes";

export function fillManual(): void {
  const manual = document.getElementById("manual-keybinds");
  manual.innerHTML = '';
  for (const km of all_keymaps) {
    manual.appendChild(document.createElement("h3")).textContent = km.manualDescription;
    for (const kb of km.keyMappings) {
      const entryDiv = document.createElement("div");
      entryDiv.className = "manual-entry";
      const keysDiv = document.createElement("div");
      keysDiv.className = "manual-keys";
      for (let key of kb.keys) {
        const keyDiv = document.createElement("div");
        keyDiv.className = "manual-key";
        keyDiv.textContent = km.key_to_string(key);
        keysDiv.appendChild(keyDiv);
      }
      entryDiv.appendChild(keysDiv);
      entryDiv.appendChild(document.createTextNode(kb.description));
      manual.appendChild(entryDiv);
    }
  }
}
