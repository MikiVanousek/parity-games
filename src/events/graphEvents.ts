import * as cytoscape from "cytoscape";

var copiedElements = [];

export function addNodeAtPosition(
  cy: cytoscape.Core,
  ur,
  x: number,
  y: number,
  isEven: boolean
) {
  ur.do("add", {
    group: "nodes",
    data: {
      id: String(getNewMaxId(cy)),
      isEven: String(isEven), // Store isEven as a string to match the selector
      priority: 1,
      label: "",
    },
    position: { x: x, y: y },
  });
  cy.resize();
}

export function copySelectedElements(cy: cytoscape.Core) {
  let selectedEles = cy.$(":selected").jsons();
  // Deep copy and store in global variable
  copiedElements = JSON.parse(JSON.stringify(selectedEles));
}

export function pasteCopiedElements(cy: cytoscape.Core, ur) {
  if (copiedElements.length > 0) {
    cy.$(":selected").unselect();
    const offset = 10; // Offset for the pasted elements' position
    let oldid_newid = {};
    let maxId = getNewMaxId(cy);

    copiedElements.sort((a, b) => {
      if (a.group === "nodes" && b.group === "edges") {
        return -1;
      }
      if (a.group === "edges" && b.group === "nodes") {
        return 1;
      }
      return 0;
    });

    let newElements = [];
    copiedElements.map((ele) => {
      if (ele.group === "nodes") {
        oldid_newid[ele.data.id] = maxId;
        ele.data.id = `${maxId}`; // Modify the ID to ensure uniqueness
        ele.position.x += offset;
        ele.position.y += offset;
        maxId++;
        newElements.push(ele);
      } else if (
        ele.group === "edges" &&
        oldid_newid.hasOwnProperty(ele.data.source) &&
        oldid_newid.hasOwnProperty(ele.data.target)
      ) {
        // Adjust source and target for edges to point to the new copied node IDs
        ele.data.id = undefined; // Modify the ID to ensure uniqueness
        ele.data.source = `${oldid_newid[ele.data.source]}`;
        ele.data.target = `${oldid_newid[ele.data.target]}`;
        newElements.push(ele);
      }
    }, []);

    ur.do("add", newElements); // Add the new elements to the Cytoscape instance
    copySelectedElements(cy); // Copy the newly pasted elements
  }
}

function getNewMaxId(cy: cytoscape.Core) {
  return (
    cy.nodes().reduce((max, node) => {
      const id = parseInt(node.data("id"));
      return isNaN(id) ? max : Math.max(max, id);
    }, 0) + 1
  );
}
