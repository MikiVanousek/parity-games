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
  ur.action(
    "group",
    (nodes: cytoscape.NodeCollection) => {
      return layoutManager.groupNodes(nodes);
    },
    (groupId: string) => {
      return layoutManager.ungroupNodes(groupId);
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

  cy.on("drag", "node", function () {
    layoutManager.runLayout();
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
    if (target_node.isParent()) return;
    const selectedNodes = cy
      .$("node:selected")
      .filter((node) => !node.isParent());

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
