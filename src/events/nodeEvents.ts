export function setupNodeEvents(cy, ur, layoutManager) {
  ur.action(
    "editPriority",
    (args) => {
      let nodes = args.nodes;
      let priority = args.priority;
      // The do action: updating the priority
      console.log(nodes);
      console.log(priority);
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
    const selectedNodes = cy.$("node:selected");

    // Create an edge from each selected node to the shift-clicked node
    selectedNodes.forEach((selectedNode) => {
      const existingEdge = cy.edges().some((edge) => {
        return (
          edge.data("source") === selectedNode.id() &&
          edge.data("target") === node.id()
        );
      });
      if (!existingEdge) {
        ur.do("add", {
          group: "edges",
          data: { source: selectedNode.id(), target: node.id() },
        });
      }
    });

    selectedNodes.unselect();
  });

  // Right click context menu
  cy.on("cxttap", "node", (event) => {
    const node = event.target;

    // Prevent context menu from showing when shift+cmd is pressed
    const isShiftCmdPressed =
      event.originalEvent.shiftKey && event.originalEvent.metaKey;
    if (isShiftCmdPressed) return;

    event.preventDefault();

    const contextMenu = document.getElementById("context-menu");
    if (contextMenu) {
      contextMenu.style.display = "block";
      contextMenu.style.left = event.originalEvent.clientX + "px";
      contextMenu.style.top = event.originalEvent.clientY + "px";
    }

    const deleteButton = document.getElementById("delete-button");
    if (deleteButton) {
      deleteButton.onclick = () => {
        ur.do("remove", node);
        contextMenu.style.display = "none";
      };
    }
  });

  cy.on("cxttap", "node", function (event) {
    const node = event.target;
    let menu = document.getElementById("custom-context-menu");

    menu.style.left = event.renderedPosition.x + "px";
    menu.style.top = event.renderedPosition.y + "px";
    menu.style.display = "block";

    // Function to hide the menu
    function hideMenu() {
      menu.style.display = "none";
    }

    // Hide the menu on any click
    window.addEventListener("click", hideMenu);

    // Edit priority action
    document.getElementById("edit-priority").onclick = function () {
      let priority = prompt("Enter new priority", node.data("priority") || "");
      if (priority !== null) {
        let selectedNodes = cy.$("node:selected");
        if (selectedNodes.length > 0) {
          ur.do("editPriority", {
            nodes: selectedNodes,
            priority: priority,
          });
        }
      }
      hideMenu();
    };
  });
}