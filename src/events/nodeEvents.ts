export function setupNodeEvents(cy, ur, layoutManager) {
  ur.action(
    "editPriority",
    (args) => {
      let nodes = args.nodes;
      let priority = args.priority;
      // The do action: updating the priority
      let oldPriorities = nodes.map((node) => {
        return { node: node, priority: node.data("priority") };
      });
      nodes.forEach(function (n) {
        n.data("priority", priority);
      });
      return { nodes: nodes, oldPriorities: oldPriorities };
    },
    (args) => {
      // The undo action: reverting to the old priorities
      let oldPriorities = args.oldPriorities;
      let newArgs = {
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
    const displayLabelsElement = document.getElementById("display-labels") as HTMLInputElement;
    const showLabels = displayLabelsElement.checked; // Directly get the checked state

    cy.nodes().style({
      label: showLabels
        ? (ele: any) => `${ele.data("label")}\n${ele.data("priority")}`
        : "",
      "text-wrap": "wrap",
    });
  }
  ur.action(
    "editLabels",
    (args) => {
      let nodes = args.nodes;
      let label = args.label;
      let cy = args.cy;
      // The do action: updating the label
      let oldLabels = nodes.map((node) => {
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
      let oldLabels = args.oldLabels;
      let cy = args.cy;
      let newArgs = {
        nodes: args.nodes,
        label: oldLabels[0].node.data("label"),
        cy: cy
      };
      oldLabels.forEach((item) =>
        item.node.data("label", item.label)
      );
      renderLabelsAndPriorities(cy);
      return newArgs;
    }
  );

  ur.action(
    "changePriority",
    (args) => {
      let nodes = args.nodes;
      let value = args.value;
      // The do action: updating the priority
      let oldPriorities = nodes.map((node) => {
        return { node: node, priority: node.data("priority") };
      });
      nodes.forEach(function (n) {
        var priority = n.data("priority") || 0;
        n.data("priority", Math.max(0, priority + value));
      });
      return { nodes: nodes, value: value, oldPriorities: oldPriorities };
    },
    (args) => {
      // The undo action: reverting to the old priorities
      let nodes = args.nodes;
      let value = args.value;
      let oldPriorities = args.oldPriorities;
      oldPriorities.forEach((item) =>
        item.node.data("priority", item.priority)
      );
      return { nodes: nodes, value: value };
    }
  );

  cy.on("drag", "node", function () {
    layoutManager.onDrag();
  });

  cy.on("click", "node", (event) => {
    const node = event.target;
    const isAltPressed = event.originalEvent.altKey;
    const isShiftCmdPressed =
      event.originalEvent.shiftKey && event.originalEvent.metaKey;
    if (!isAltPressed && !isShiftCmdPressed) return;

    event.preventDefault();
    // Get all currently selected nodes
  });

  cy.on("cxttap", "node", function (event) {
    const target_node = event.target;
    const selectedNodes = cy.$("node:selected");

    // Create an edge from each selected node to the shift-clicked node
    const actionList = [];
    selectedNodes.forEach((selectedNode) => {
      const existingEdge = cy.edges().some((edge) => {
        return (
          edge.data("source") === selectedNode.id() &&
          edge.data("target") === target_node.id()
        );
      });
      if (!existingEdge) {
        actionList.push({
          name: "add",
          param: {
            group: "edges",
            data: { source: selectedNode.id(), target: target_node.id() },
          },
        });
      }
    });
    if (actionList.length > 0) {
      ur.do("batch", actionList);
    }
  });
}
