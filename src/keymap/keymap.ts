// Here we define all keyboard shortcuts. They mappings are used to trigger the corresponding action and to create the manual entry.
import {
  addNodeAtPosition,
  copySelectedElements,
  pasteCopiedElements,
} from "../events/graphEvents";
import { showToast } from "../ui/toast";
import { KeyMap, KeyMapping } from "./keymapTypes";
import { closeManual, isManualOpen, toggleManual } from "../ui/manual";

// These are the shortcuts which are triggered regardless of context.
export const otherMappings = new KeyMap("Other mappings");
otherMappings.push(
  new KeyMapping(["?", "/"], "Toggle manual", (args) => {
    toggleManual();
  })
);
otherMappings.push(
  new KeyMapping(["Escape"], "Exit trace or manual", (args) => {
    if (isManualOpen()) {
      closeManual();
    } else if (window.traceManager.hasTrace()) {
      window.traceManager.removeTrace();
    } else {
      console.log(
        "Pressed Escape but the manual is closed and there is no trace loaded."
      );
    }
  })
);
otherMappings.push(
  new KeyMapping(
    ["g"],
    "Group selected nodes - lock their relative positions and prevent them from being moved by automatic layout",
    ({ cy, ur }) => {
      const selectedNodes = cy.$("node:selected");
      let inGroup = false;
      if (selectedNodes.length === 1 && selectedNodes[0].isParent()) {
        ur.do("ungroup", { groupId: selectedNodes[0].id() });
        return;
      }

      selectedNodes.forEach((node) => {
        if (node.isParent() || !node.isOrphan()) {
          inGroup = true;
          showToast({
            message: "Can not group nodes that are already in a group.",
            variant: "danger",
          });
          return;
        }
      });
      if (selectedNodes.length > 0 && !inGroup) {
        // check each node if it is already in a group
        ur.do("group", { nodes: selectedNodes });
      }
    }
  )
);

// These shortcuts should be triggered when ctrl or ⌘ is pressed.
export const cmdMappings = new KeyMap("Command mappings");
cmdMappings.key_to_string = (key) => "⌘ + " + key;
cmdMappings.push(
  new KeyMapping(["c"], "Copy selected elements", ({ cy }) => {
    copySelectedElements(cy);
  })
);

cmdMappings.push(
  new KeyMapping(["v"], "Paste copied elements", ({ cy, ur }) => {
    pasteCopiedElements(cy, ur);
  })
);

cmdMappings.push(
  new KeyMapping(["z"], "Undo last action", ({ ur, event }) => {
    if (event.ctrlKey || event.metaKey) {
      ur.undo();
    }
  })
);

cmdMappings.push(
  new KeyMapping(["y"], "Redo last action", ({ ur, event }) => {
    if (event.ctrlKey || event.metaKey) {
      ur.redo();
    }
  })
);

// These shortcuts trigger actions which modify the parity game. They can't be used if viewing the trace (the trace would then make no sense).
export const pgEditingMappings = new KeyMap("Parity game editing mappings");

pgEditingMappings.push(
  new KeyMapping(["e"], "Add even node at the cursor position", (args) => {
    addNodeAtPosition(args.cy, args.ur, args.modelX, args.modelY, true);
  })
);

pgEditingMappings.push(
  new KeyMapping(["o", "w"], "Add odd node at the cursor position", (args) => {
    addNodeAtPosition(args.cy, args.ur, args.modelX, args.modelY, false);
  })
);

pgEditingMappings.push(
  new KeyMapping(["q"], "Toggle the owner of selected nodes", ({ cy, ur }) => {
    const selectedNodes = cy
      .$("node:selected")
      .filter((node) => !node.isParent());
    if (selectedNodes.length > 0) {
      ur.do("editOwner", { nodes: selectedNodes });
    }
  })
);

pgEditingMappings.push(
  new KeyMapping(
    ["Backspace", "Delete", "d"],
    "Remove selected elements",
    ({ cy, ur }) => {
      const selectedElements = cy
        .$(":selected")
        .filter((ele) => !(ele.isNode && ele.isParent()));
      const groupsToRemove = cy
        .nodes()
        .filter(
          (ele) =>
            ele.isParent() && ele.children().every((child) => child.selected())
        );
      const actionList = [
        { name: "remove", param: selectedElements },
        { name: "remove", param: groupsToRemove },
      ];
      if (selectedElements.length > 0) {
        ur.do("batch", actionList);
      }
    }
  )
);

pgEditingMappings.push(
  new KeyMapping(["+", "=", "2"], "Increment priority", ({ cy, ur }) => {
    const selectedNodes = cy
      .$("node:selected")
      .filter((node) => !node.isParent());
    if (selectedNodes.length > 0) {
      ur.do("changePriority", { nodes: selectedNodes, value: 1 });
    }
  })
);

pgEditingMappings.push(
  new KeyMapping(["-", "1"], "Decrement priority", ({ cy, ur }) => {
    const selectedNodes = cy
      .$("node:selected")
      .filter((node) => !node.isParent());
    if (selectedNodes.length > 0) {
      ur.do("changePriority", { nodes: selectedNodes, value: -1 });
    }
  })
);

pgEditingMappings.push(
  new KeyMapping(
    ["p", "x"],
    "Set priority for selected nodes",
    ({ cy, ur }) => {
      const selectedNodes = cy
        .$("node:selected")
        .filter((node) => !node.isParent());

      if (selectedNodes.length == 0) {
        showToast({
          message: "No nodes selected",
          variant: "warning",
        });
        return;
      }
      const input = prompt("Enter new priority", "");
      if (input !== null) {
        const priority = parseInt(input);
        if (!isNaN(priority)) {
          ur.do("editPriority", {
            nodes: selectedNodes,
            priority: priority,
          });
          return;
        }
      }
      showToast({
        message: "Invalid priority value",
        variant: "danger",
      });
    }
  )
);


pgEditingMappings.push(
  new KeyMapping(["l", "c"], "Edit label of selected node(s)", ({ cy, ur }) => {
    const selectedNodes = cy.nodes().filter((e) => e.selected() && !e.isParent());
    if (selectedNodes.length === 0) {
      showToast({
        message: "No nodes selected",
        variant: "warning",
      })
      return
    }
    const label = prompt("Enter new label", "");
    if (label !== null) {
      ur.do("editLabels", {
        nodes: selectedNodes,
        label: label,
        cy: cy,
      });
    }
  })
);

// These shortcuts are only triggered when viewing a trace.
export const traceMappings = new KeyMap("When trace is loaded");
traceMappings.push(
  new KeyMapping(["ArrowRight"], "Next step", () => {
    window.traceManager.nextStep();
  })
);
traceMappings.push(
  new KeyMapping(["ArrowLeft"], "Next step", () => {
    window.traceManager.prevStep();
  })
);

export const all_keymaps = [
  otherMappings,
  cmdMappings,
  pgEditingMappings,
  traceMappings,
];
