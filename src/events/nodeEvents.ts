import { showToast } from "../ui/toast";

export function setupNodeEvents(cy, ur, layoutManager) {
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
    if (window.traceManager.hasTrace()) {
      showToast({
        message:
          "Can not change parity (create edge) game while a trace is loaded.",
        variant: "danger",
      });
      return;
    }
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
