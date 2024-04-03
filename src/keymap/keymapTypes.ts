import { assert } from "../assert";

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
export function buildKeyMap(keyMappings: KeyMapping[]): Map<string, KeyMapping> {
  const keyMap = new Map<string, KeyMapping>()
  for (const mapping of keyMappings) {
    for (const key of mapping.keys) {
      assert(!keyMap.has(key), `Duplicate key mapping for key ${key}`)
      keyMap.set(key, mapping)
    }
  }
  return keyMap
}