import './manual.css';
import {
  all_keymaps,
} from "../keymap/keymap";


export function fillManual(): void {
  const manual = document.getElementById("manualKeybinds");
  manual.innerHTML = "";
  for (const km of all_keymaps) {
    manual.appendChild(document.createElement("h3")).textContent =
      km.manualDescription;
    for (const kb of km.keyMappings) {
      const entryDiv = document.createElement("div");
      entryDiv.className = "manual-entry";
      const keysDiv = document.createElement("div");
      keysDiv.className = "manual-keys";
      for (const key of kb.keys) {
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

const manual_overlay = document.getElementById("manualOverlay");
const manual_button = document.getElementById("manualOpenButton");
export function openManual() {
  manual_overlay.style.display = "";
  manual_button.innerHTML = "✕";
}
export function closeManual() {
  manual_overlay.style.display = "none";
  manual_button.innerHTML = "?";
}

export function isManualOpen() {
  return manual_overlay.style.display !== "none";
}

export function toggleManual() {
  if (isManualOpen()) {
    closeManual();
  } else {
    openManual();
  }
}

manual_button.addEventListener("click", toggleManual);
