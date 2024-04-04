import { updateGraphFileName } from "../ui/utils";
import { PGParser } from "../board/PGParser";

export function handleExportGame(cy, name = "game") {
  const cyState = cy.elements().jsons();

  const exportData = {
    cytoscapeState: cyState,
  };

  const exportString = JSON.stringify(exportData, null, 2);

  const file = new Blob([exportString], { type: "application/json" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = name + ".cypg_json";
  a.click();
}

export function handleImportGame(event, cy) {
  const file = event.target.files[0];

  if (file) {
    updateGraphFileName(file.name);
    window.pgName = file.name;
    console.log("Importing game:", file.name);

    const reader = new FileReader();

    reader.onload = function (loadEvent) {
      try {
        const fileContent = loadEvent.target.result as string;
        const importedData = JSON.parse(fileContent);

        cy.elements().remove();
        cy.add(importedData.cytoscapeState);
        cy.fit(cy.elements(), 50);

        var fileName = file.name.replace(/\.[^/.]+$/, "");
      } catch (error) {
        console.error("Error importing game:", error);
      }
    };

    reader.readAsText(file);
  }
}

export function exportAsPng(cy, name = "picture") {
  const png = cy.png({ full: true });
  const a = document.createElement("a");
  a.href = png;
  a.download = name + ".png";
  a.click();
}

export function handleOinkFileSelect(event, cy, layoutManager) {
  const file = event.target.files[0];

  if (file) {
    updateGraphFileName(file.name);
    window.pgName = file.name;
    console.log("Importing game:", file.name);

    const reader = new FileReader();

    reader.onload = function (loadEvent) {
      const fileContent = loadEvent.target.result as string;

      const pg = PGParser.importOinkFormat(fileContent);
      resetBoardVisuals(cy, pg, layoutManager);
    };

    reader.readAsText(file);
  }
}

export function saveOinkFile(cy, name = "game") {
  const pg = PGParser.cyToPg(cy);
  const exportString = PGParser.exportOinkFormat(pg);

  const file = new Blob([exportString], { type: "text/plain" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = name + ".pg";
  a.click();
}

function resetBoardVisuals(cy, pg, layoutManager) {
  const elements = PGParser.pgToCy(pg);
  cy.elements().remove(); // Clear the current graph
  cy.add(elements); // Add the new elements
  layoutManager.runOnce();
}
