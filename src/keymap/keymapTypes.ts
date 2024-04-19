// The types for defining keyboard shortcuts.
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
  constructor(keys: string[], description: string, action: (KeyActionArgs) => void) {
    this.keys = keys
    this.description = description
    this.action = action;
  }
}

export class KeyMap {
  keyMappings: KeyMapping[] = []
  keyMap = new Map<string, KeyMapping>()
  manualDescription: string

  constructor(manualDescription: string) {
    this.manualDescription = manualDescription
  }

  push(mapping: KeyMapping) {
    this.keyMappings.push(mapping)
    for (const key of mapping.keys) {
      assert(!this.keyMap.has(key), `Duplicate key mapping for key ${key}`)
      this.keyMap.set(key, mapping)
    }
  }

  key_to_string(key: string): string {
    return key
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
