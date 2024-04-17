import { assert } from "../assert";
import { PGParser } from "../board/PGParser";

export function setupOtherUI() {
  document.getElementById("export-oink-btn").addEventListener("click", () => {
    PGParser.exportOinkFormat(PGParser.cyToPg(window.cy));
  });

  const fileInput = document.getElementById("fileInput");
  fileInput.addEventListener("change", (e) => {
    console.log("fileInput changed");

    const target = e.target as HTMLInputElement;
    window.traceManager.handleTraceFileSelect(e);

    // Reset the file input value
    if (target && target.value) {
      target.value = '';
    }

  });

  displayLabelsInput.addEventListener("change", refreshNodeLabels);
}

const displayLabelsInput = document.getElementById(
  "display-labels"
) as HTMLInputElement;

export function refreshNodeLabels() {
  // Label means two things in this function: node.data.label is the name of the node, and node.style.label is the text that is displayed on the node, which also incudes the priority or the label from trace if needed.
  const displayNodeLabels = displayLabelsInput.checked;

  function compositeLabel(ele): string {
    // Parent nodes are the groups of nodes created with "g".
    assert(!ele.isParent());
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

  window.cy.nodes().filter((e) => !e.isParent()).style({
    label: compositeLabel
  });

  document.getElementById("resetView").addEventListener("click", () => {
    window.cy.reset();
    window.cy.centre();
  });
}