export function setupUndoRedoActions(cy, ur, layoutManager) {
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
      return newArgs;
    }
  );

  function renderLabelsAndPriorities(cy) {
    const displayLabelsElement = document.getElementById(
      "displayLabels"
    ) as HTMLInputElement;
    const showLabels = displayLabelsElement.checked; // Directly get the checked state

    cy.nodes()
      .filter((ele: any) => !ele.isParent())
      .style({
        label: showLabels
          ? (ele: any) => `${ele.data("label")}\n${ele.data("priority")}`
          : "",
        "text-wrap": "wrap",
      });
    cy.nodes()
      .filter((ele: any) => ele.isParent())
      .style({
        label: showLabels ? (ele: any) => `${ele.data("label")}` : "",
        "text-wrap": "wrap",
      });
  }
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
      renderLabelsAndPriorities(cy);
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
      renderLabelsAndPriorities(cy);
      return newArgs;
    }
  );

  ur.action(
    "changePriority",
    (args) => {
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
