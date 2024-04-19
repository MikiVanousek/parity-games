
// In this function we register cytoscape undo-redo events. Every action that can be undone with ctrl+c uses one of these events.
export function setupUndoRedoActions() {

  const ur = window.ur;
  const cy = window.cy;
  const layoutManager = window.layoutManager;

  ur.action(
    "runLayout",
    (args) => {
      const oldPositions = args.nodes.map((node) => {
        return { node: node, position: { ...node.position() } };
      });
      if (args.oldPositions === undefined) {
        layoutManager.runOnce();
      } else {
        args.oldPositions.forEach((item) => item.node.position(item.position));
        cy.reset();
        cy.centre();
      }
      return { nodes: args.nodes, oldPositions: oldPositions };
    },
    (args) => {
      const oldPositions = args.nodes.map((node) => {
        return { node: node, position: { ...node.position() } };
      });
      args.oldPositions.forEach((item) => item.node.position(item.position));
      cy.reset();
      cy.centre();
      return { nodes: args.nodes, oldPositions: oldPositions };
    }
  );

  ur.action(
    "editOwner",
    (args) => {
      const nodes = args.nodes;
      // The do action: updating the owner
      nodes.forEach((node) => {
        const currentIsEven = node.data("isEven");
        node.data("isEven", currentIsEven === "true" ? "false" : "true");
      });
      return { nodes: nodes };
    },
    (args) => {
      const nodes = args.nodes;
      // The undo action: updating the owner
      nodes.forEach((node) => {
        const currentIsEven = node.data("isEven");
        node.data("isEven", currentIsEven === "true" ? "false" : "true");
      });
      return { nodes: nodes };
    }
  );

  ur.action(
    "editPriority",
    (args) => {
      const nodes = args.nodes;
      const priority = args.priority;
      // The do action: updating the priority
      const oldPriorities = nodes.map((node) => {
        return { node: node, priority: node.data("priority") };
      });
      nodes.forEach(function (n) {
        n.data("priority", priority);
      });
      renderLabelsAndPriorities();
      return { nodes: nodes, oldPriorities: oldPriorities };
    },
    (args) => {
      // The undo action: reverting to the old priorities
      const oldPriorities = args.oldPriorities;
      const newArgs = {
        nodes: args.nodes,
        priority: oldPriorities[0].node.data("priority"),
      };
      oldPriorities.forEach((item) =>
        item.node.data("priority", item.priority)
      );
      renderLabelsAndPriorities();
      return newArgs;
    }
  );


  ur.action(
    "editLabels",
    (args) => {
      const nodes = args.nodes;
      const label = args.label;
      const cy = args.cy;
      // The do action: updating the label
      const oldLabels = nodes.map((node) => {
        return { node: node, label: node.data("label") };
      });
      nodes.forEach(function (n) {
        n.data("label", label);
      });
      renderLabelsAndPriorities();
      return { nodes: nodes, oldLabels: oldLabels, cy: cy };
    },
    (args) => {
      // The undo action: reverting to the old labels
      const oldLabels = args.oldLabels;
      const cy = args.cy;
      const newArgs = {
        nodes: args.nodes,
        label: oldLabels[0].node.data("label"),
        cy: cy,
      };
      oldLabels.forEach((item) => item.node.data("label", item.label));
      renderLabelsAndPriorities();
      return newArgs;
    }
  );

  ur.action(
    "changePriority",
    (args) => {
      console.log('changePriority', args)
      const nodes = args.nodes;
      const value = args.value;
      // The do action: updating the priority
      const oldPriorities = nodes.map((node) => {
        return { node: node, priority: node.data("priority") };
      });
      nodes.forEach(function (n) {
        const priority = n.data("priority") || 0;
        n.data("priority", Math.max(0, priority + value));
      });
      renderLabelsAndPriorities();
      return { nodes: nodes, value: value, oldPriorities: oldPriorities };
    },
    (args) => {
      // The undo action: reverting to the old priorities
      const nodes = args.nodes;
      const value = args.value;
      const oldPriorities = args.oldPriorities;
      oldPriorities.forEach((item) =>
        item.node.data("priority", item.priority)
      );
      renderLabelsAndPriorities();
      return { nodes: nodes, value: value };
    }
  );
  ur.action(
    "group",
    (args) => {
      return { groupId: layoutManager.groupNodes(args.nodes) };
    },
    (args) => {
      return { nodes: layoutManager.ungroupNodes(args.groupId) };
    }
  );
  ur.action(
    "ungroup",
    (args) => {
      return { nodes: layoutManager.ungroupNodes(args.groupId) };
    },
    (args) => {
      return { groupId: layoutManager.groupNodes(args.nodes) };
    }
  );
}

const displayLabelsInput = document.getElementById("displayLabels") as HTMLInputElement;
displayLabelsInput.addEventListener("change", renderLabelsAndPriorities);
export function renderLabelsAndPriorities() {
  const displayNodeLabels = displayLabelsInput.checked;
  function compositeLabel(ele): string {
    // Parent nodes are the groups of nodes created with "g".
    if (ele.isParent()) {
      if (false) {
        return ele.data("label");
      } else {
        return "";
      }
    }
    let res = ele.data("priority").toString();
    if (displayNodeLabels && (ele.data("label") || ele.data("traceLabel"))) {
      // Skip line if there is trace label, to make it clear the label is trace label
      res += `\n${ele.data("label")}`;
    }
    if (ele.data("traceLabel")) {
      res += `\n${ele.data("traceLabel")}`;
    }
    return res;
  }

  window.cy.nodes()
    .filter((ele: any) => !ele.isParent())
    .style({
      label: compositeLabel,
    });
}
