import { pgEditingMappings } from "./keymap";
import { KeyMapping } from "./keymapTypes";

const mappingCategories: [string, KeyMapping[]][] = [
  ["Editing parity game", pgEditingMappings],

]
export function fillManual(): void {
  const mappings = pgEditingMappings;
  const categoryMap = new Map<string, KeyMapping[]>();
  for (const mapping of mappings) {
    if (!categoryMap.has(mapping.category)) {
      categoryMap.set(mapping.category, []);
    }
    categoryMap.get(mapping.category).push(mapping);
  }

  const manual = document.getElementById("manual-keybinds");
  manual.innerHTML = '';
  for (const [category, categoryMappings] of mappingCategories) {
    manual.appendChild(document.createElement("h3")).textContent = category;
    for (const kb of categoryMappings) {
      const entryDiv = document.createElement("div");
      entryDiv.className = "manual-entry";
      const keysDiv = document.createElement("div");
      keysDiv.className = "manual-keys";
      for (let key of kb.keys) {
        // if () {
        //   key = "⌘ + " + key;
        // }
        const keyDiv = document.createElement("div");
        keyDiv.className = "manual-key";
        keyDiv.textContent = key;
        keysDiv.appendChild(keyDiv);
      }
      entryDiv.appendChild(keysDiv);
      entryDiv.appendChild(document.createTextNode(kb.description));
      manual.appendChild(entryDiv);
    }
  }
}
