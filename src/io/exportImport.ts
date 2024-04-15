import { updateGraphFileName } from "../ui/utils";
import { PGParser } from "../board/PGParser";
import { showToast } from "../ui/toast";
import { getPGName, setPGName } from "../ui/PGNameEditing";

export function handleExportGame(cy, name = getPGName()) {
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

    // remove the file extension
    setPGName(file.name.replace(/\.[^/.]+$/, ""));

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

export function exportAsPng(cy, name = getPGName()) {
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

    // remove the file extension
    setPGName(file.name.replace(/\.[^/.]+$/, ""));

    const reader = new FileReader();

    reader.onload = function (loadEvent) {
      const fileContent = loadEvent.target.result as string;

      let pg;
      try {
        pg = PGParser.importOinkFormat(fileContent);
      } catch (e) {
        console.error("Error importing game:", e);
        showToast({
          title: "Invalid pg file",
          message: "The file you selected is not a valid pg file",
          variant: "danger",
        })
        return;
      }
      resetBoardVisuals(cy, pg, layoutManager);
    };

    reader.readAsText(file);
  }
}

export function saveOinkFile(cy, name = getPGName()) {
  const pg = PGParser.cyToPg(cy);
  const exportString = PGParser.exportOinkFormat(pg);

  const file = new Blob([exportString], { type: "text/plain" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = name + ".pg";
  a.click();
}

export function resetBoardVisuals(cy, pg, layoutManager) {
  const elements = PGParser.pgToCy(pg);
  cy.elements().remove(); // Clear the current graph
  cy.add(elements); // Add the new elements
  layoutManager.runOnce();
}
